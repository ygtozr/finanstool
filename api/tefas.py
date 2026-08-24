import json
import re
import threading
import time
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from curl_cffi import requests


BASE_URL = "https://www.tefas.gov.tr"
FUND_CODE = re.compile(r"^[A-Z0-9]{2,8}$")
SESSION_TTL = 9 * 60
CACHE_TTL = 10 * 60

_lock = threading.Lock()
_session = None
_session_started = 0.0
_cache = {}


def _new_session():
    global _session, _session_started
    session = requests.Session(impersonate="chrome131")
    session.headers.update({
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Origin": BASE_URL,
        "Referer": BASE_URL + "/tr/fon-verileri",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
    })
    session.get(BASE_URL + "/tr/", timeout=18)
    _session = session
    _session_started = time.time()
    return session


def _get_session():
    with _lock:
        if _session is None or time.time() - _session_started > SESSION_TTL:
            return _new_session()
        return _session


def _post(path, body):
    key = path + "|" + json.dumps(body, sort_keys=True, ensure_ascii=False)
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < CACHE_TTL:
        return cached[1]

    last_error = None
    for attempt in range(3):
        try:
            response = _get_session().post(BASE_URL + path, json=body, timeout=22)
            if response.status_code == 429:
                raise RuntimeError("TEFAS istek sınırına ulaşıldı.")
            response.raise_for_status()
            if "json" not in (response.headers.get("content-type") or "").lower() or not response.text:
                raise RuntimeError("TEFAS geçici olarak boş yanıt verdi.")
            payload = response.json()
            if payload.get("errorCode") or payload.get("errorMessage"):
                raise RuntimeError(payload.get("errorMessage") or "TEFAS veri hatası.")
            _cache[key] = (time.time(), payload)
            return payload
        except Exception as error:
            last_error = error
            if attempt == 0:
                time.sleep(0.7)
            else:
                global _session, _session_started
                with _lock:
                    _session = None
                    _session_started = 0.0
                time.sleep(1.2)
    raise RuntimeError(str(last_error or "TEFAS verisine ulaşılamadı."))


def _clean_code(value):
    code = str(value or "").upper().replace("TEFAS-", "").strip()
    return code if FUND_CODE.fullmatch(code) else ""


def _period(query):
    params = parse_qs(query or "")
    value = (params.get("range") or ["6mo"])[0]
    return {
        "5d": 13,
        "1mo": 1,
        "3mo": 3,
        "6mo": 6,
        "1y": 12,
        "2y": 36,
        "5y": 60,
        "10y": 60,
        "max": 60,
    }.get(value, 60 if "period1" in params else 6)


def _timestamp(value):
    if not value:
        return None
    text = str(value).strip()[:10]
    for pattern in ("%Y-%m-%d", "%d.%m.%Y"):
        try:
            return int(time.mktime(time.strptime(text, pattern)))
        except ValueError:
            pass
    return None


def _number(value):
    try:
        number = float(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


def _search(query):
    payload = _post("/api/funds/fonUnvanAra", {"aramaMetni": query})
    rows = payload.get("resultList") or []
    quotes = []
    for row in rows:
        code = _clean_code(row.get("fonKod") or row.get("fonKodu") or row.get("kod"))
        name = str(row.get("unvan") or row.get("fonUnvan") or row.get("fonAdi") or "").strip()
        if not code or not name:
            continue
        quotes.append({
            "symbol": "TEFAS-" + code,
            "name": name,
            "exchange": "TEFAS",
            "type": "MUTUALFUND",
            "provider": "TEFAS",
        })
        if len(quotes) >= 5:
            break
    return {"quotes": quotes, "provider": "TEFAS"}


def _price(symbol, query):
    code = _clean_code(symbol)
    if not code:
        raise ValueError("Geçersiz TEFAS fon kodu.")
    periyod = _period(query)
    payload = _post("/api/funds/fonFiyatBilgiGetir", {
        "fonKodu": code,
        "dil": "TR",
        "periyod": periyod,
    })
    points = []
    fund_name = code
    for row in payload.get("resultList") or []:
        stamp = _timestamp(row.get("tarih"))
        price = _number(row.get("fiyat"))
        if stamp is None or price is None:
            continue
        fund_name = str(row.get("fonUnvan") or fund_name).strip()
        points.append((stamp, price))
    points.sort(key=lambda item: item[0])
    unique = []
    for point in points:
        if unique and unique[-1][0] == point[0]:
            unique[-1] = point
        else:
            unique.append(point)
    if not unique:
        raise LookupError("TEFAS fon fiyatı bulunamadı.")

    timestamps = [point[0] for point in unique]
    closes = [point[1] for point in unique]
    last_time = timestamps[-1]
    result = {
        "chart": {
            "result": [{
                "meta": {
                    "currency": "TRY",
                    "symbol": "TEFAS-" + code,
                    "shortName": code,
                    "longName": fund_name,
                    "exchangeName": "TEFAS",
                    "fullExchangeName": "Türkiye Elektronik Fon Alım Satım Platformu",
                    "instrumentType": "MUTUALFUND",
                    "regularMarketTime": last_time,
                    "regularMarketPrice": closes[-1],
                    "chartPreviousClose": closes[-2] if len(closes) > 1 else closes[-1],
                    "priceHint": 6,
                    "timezone": "Europe/Istanbul",
                    "exchangeTimezoneName": "Europe/Istanbul",
                    "dataGranularity": "1d",
                    "range": str(periyod),
                    "dataProvider": "TEFAS",
                    "tefasFund": True,
                },
                "timestamp": timestamps,
                "indicators": {
                    "quote": [{
                        "open": closes,
                        "high": closes,
                        "low": closes,
                        "close": closes,
                        "volume": [None] * len(closes),
                    }],
                    "adjclose": [{"adjclose": closes}],
                },
                "events": {},
            }],
            "error": None,
        },
        "_finansTool": {
            "provider": "TEFAS",
            "asOf": last_time,
            "servedAt": int(time.time() * 1000),
            "stale": False,
            "tefasFund": True,
        },
    }
    return result


class handler(BaseHTTPRequestHandler):
    def _json(self, status, payload, cache="public, max-age=0, s-maxage=600, stale-while-revalidate=3600"):
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", cache)
        self.send_header("Vercel-CDN-Cache-Control", cache)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        action = (query.get("action") or [""])[0]
        try:
            if action == "search":
                text = str((query.get("q") or [""])[0]).strip()[:40]
                if len(text) < 2:
                    return self._json(200, {"quotes": [], "provider": "TEFAS"})
                return self._json(200, _search(text))
            if action == "price":
                symbol = (query.get("symbol") or [""])[0]
                price_query = (query.get("query") or ["range=6mo&interval=1d"])[0]
                return self._json(200, _price(symbol, price_query))
            return self._json(400, {"error": "Geçersiz TEFAS işlemi."}, "no-store")
        except ValueError as error:
            return self._json(400, {"error": str(error)}, "no-store")
        except LookupError as error:
            return self._json(404, {"error": str(error)}, "no-store")
        except Exception:
            return self._json(503, {"error": "TEFAS veri sağlayıcısına geçici olarak ulaşılamadı."}, "no-store")

