import json
import re
import threading
import time
import unicodedata
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen


BASE_URL = "https://www.tefas.gov.tr"
FUND_CODE = re.compile(r"^[A-Z0-9]{2,8}$")
CACHE_TTL = 10 * 60
FUND_LIST_TTL = 6 * 60 * 60
KNOWN_FUND_NAMES = {
    "YLB": "YAPI KREDİ PORTFÖY PARA PİYASASI FONU",
    "YVD": "YAPI KREDİ PORTFÖY İKİNCİ PARA PİYASASI (TL) FONU",
    "ENR": "QNB PORTFÖY ENPARA PARA PİYASASI (TL) FONU",
}
SEARCH_SYNONYMS = {
    "PARA": ("MONEY",),
    "PIYASASI": ("MARKET",),
    "PORTFOY": ("ASSET", "MANAGEMENT"),
    "HISSE": ("EQUITY", "STOCK"),
    "SENEDI": ("EQUITY", "STOCK"),
    "ALTIN": ("GOLD",),
    "GUMUS": ("SILVER",),
    "KATILIM": ("PARTICIPATION",),
    "DEGISKEN": ("VARIABLE",),
    "BORCLANMA": ("DEBT", "BOND"),
    "ARACLARI": ("INSTRUMENTS",),
    "BIRINCI": ("FIRST",),
    "IKINCI": ("SECOND",),
    "UCUNCU": ("THIRD",),
}
MANAGER_SEARCH_ALIASES = (
    (("AK PORTFOY", "AK ASSET MANAGEMENT"), "AKBANK AK BANK"),
    (("YAPI KREDI PORTFOY", "YAPI KREDI ASSET MANAGEMENT"), "YAPI KREDI BANKASI YKB"),
    (("IS PORTFOY", "IS ASSET MANAGEMENT"), "ISBANK IS BANKASI TURKIYE IS BANKASI"),
    (("GARANTI PORTFOY", "GARANTI ASSET MANAGEMENT"), "GARANTI BBVA GARANTI BANKASI"),
    (("QNB PORTFOY", "QNB ASSET MANAGEMENT"), "QNB FINANSBANK"),
    (("ZIRAAT PORTFOY", "ZIRAAT ASSET MANAGEMENT"), "ZIRAAT BANKASI"),
    (("VAKIF PORTFOY", "VAKIF ASSET MANAGEMENT"), "VAKIFBANK VAKIF BANKASI"),
    (("HALK PORTFOY", "HALK ASSET MANAGEMENT"), "HALKBANK HALK BANKASI"),
    (("DENIZ PORTFOY", "DENIZ ASSET MANAGEMENT"), "DENIZBANK DENIZ BANK"),
    (("TEB PORTFOY", "TEB ASSET MANAGEMENT"), "TEB TURK EKONOMI BANKASI"),
    (("FIBA PORTFOY", "FIBA ASSET MANAGEMENT"), "FIBABANKA FIBA BANKA"),
)

_lock = threading.Lock()
_cache = {}


def _post(path, body, cache_ttl=CACHE_TTL):
    key = path + "|" + json.dumps(body, sort_keys=True, ensure_ascii=False)
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < cache_ttl:
        return cached[1]

    request_body = json.dumps(body, ensure_ascii=False).encode("utf-8")
    last_error = None
    for attempt in range(2):
        try:
            request = Request(
                BASE_URL + path,
                data=request_body,
                method="POST",
                headers={
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Origin": BASE_URL,
                    "Referer": BASE_URL + "/tr/fon-verileri",
                    "User-Agent": "Mozilla/5.0",
                },
            )
            with urlopen(request, timeout=8) as response:
                content_type = response.headers.get("content-type") or ""
                response_body = response.read().decode("utf-8")
            if "json" not in content_type.lower() or not response_body:
                raise RuntimeError("TEFAS geçici olarak boş yanıt verdi.")
            payload = json.loads(response_body)
            if payload.get("errorCode") or payload.get("errorMessage"):
                raise RuntimeError(payload.get("errorMessage") or "TEFAS veri hatası.")
            with _lock:
                _cache[key] = (time.time(), payload)
            return payload
        except Exception as error:
            last_error = error
            if attempt == 0:
                time.sleep(0.25)
    raise RuntimeError(str(last_error or "TEFAS verisine ulaşılamadı."))


def _clean_code(value):
    code = str(value or "").upper().replace("TEFAS-", "").strip()
    return code if FUND_CODE.fullmatch(code) else ""


def _search_text(value):
    text = str(value or "").strip().replace("ı", "i").replace("İ", "I")
    return "".join(
        character for character in unicodedata.normalize("NFKD", text)
        if unicodedata.category(character) != "Mn"
    ).upper()


def _matches_search(query, code, name):
    searchable = _search_text(code + " " + name)
    for markers, aliases in MANAGER_SEARCH_ALIASES:
        if any(marker in searchable for marker in markers):
            searchable += " " + aliases
    if query in searchable:
        return True
    for token in query.split():
        alternatives = (token,) + SEARCH_SYNONYMS.get(token, ())
        if not any(alternative in searchable for alternative in alternatives):
            return False
    return True


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
    normalized_query = _search_text(query)

    # Tam listede unvani Ingilizce donen ozel fonlari resmi Turkce adlariyla
    # arat ve cok sayidaki banka fonu arasinda ilk onerilere tasi.
    for code, official_name in reversed(KNOWN_FUND_NAMES.items()):
        searchable = _search_text(code + " " + official_name)
        if normalized_query in searchable or all(
            token in searchable for token in normalized_query.split()
        ):
            rows.insert(0, {"fonKod": code, "unvan": official_name})

    # Bos arama, aktif TEFAS islem listesinin disinda kalabilen ancak kodla
    # fiyatlanabilen fonlari da iceren genel unvan katalogunu dondurur.
    try:
        catalog_payload = _post(
            "/api/funds/fonUnvanAra",
            {},
            cache_ttl=FUND_LIST_TTL,
        )
        for row in catalog_payload.get("resultList") or []:
            code = _clean_code(row.get("fonKod") or row.get("fonKodu") or row.get("kod"))
            name = str(row.get("unvan") or row.get("fonUnvan") or row.get("fonAdi") or "").strip()
            if normalized_query and _matches_search(normalized_query, code, name):
                rows.append(row)
    except Exception:
        pass

    # TEFAS'in hizli ad aramasi, alim-satimi sinirli veya dagitimi kapali
    # bazi yatirim fonlarini (ornegin YLB/ENR) her zaman dondurmuyor.
    # Tam YAT fon listesini uzun sureli onbellekten okuyup yerelde aramak,
    # bu fonlari da izlenebilir tutarken TEFAS istek sayisini sinirlar.
    try:
        full_payload = _post(
            "/api/statistics/tefas/getFplFonList",
            {"fonTipi": "YAT"},
            cache_ttl=FUND_LIST_TTL,
        )
        full_rows = full_payload.get("data") or full_payload.get("resultList") or []
        if isinstance(full_rows, dict):
            full_rows = full_rows.get("data") or full_rows.get("resultList") or []
        for row in full_rows:
            code = _clean_code(row.get("fonKod") or row.get("fonKodu") or row.get("kod"))
            name = str(row.get("unvan") or row.get("fonUnvan") or row.get("fonAdi") or "").strip()
            if normalized_query and _matches_search(normalized_query, code, name):
                rows.append(row)
    except Exception:
        # Hizli arama calisiyorsa tam liste kesintisi sonuclari engellememeli.
        pass

    quotes = []
    seen = set()
    for row in rows:
        code = _clean_code(row.get("fonKod") or row.get("fonKodu") or row.get("kod"))
        name = str(row.get("unvan") or row.get("fonUnvan") or row.get("fonAdi") or "").strip()
        if not code or not name or code in seen or not _matches_search(normalized_query, code, name):
            continue
        seen.add(code)
        quotes.append({
            "symbol": "TEFAS-" + code,
            "name": name,
            "exchange": "TEFAS",
            "type": "MUTUALFUND",
            "provider": "TEFAS",
        })
    quotes.sort(key=lambda item: (
        0 if item["symbol"] == "TEFAS-" + normalized_query else
        1 if item["symbol"].replace("TEFAS-", "").startswith(normalized_query) else
        2 if _search_text(item["name"]).startswith(normalized_query) else
        3 if _matches_search(normalized_query, item["symbol"], item["name"]) else 4
    ))
    return {"quotes": quotes[:5], "provider": "TEFAS"}


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
