# Özer Finans v9.0.3

- Görünüm > Vurgu rengi altında Siyah Beyaz seçeneği eklendi.
- Açık temada siyah, koyu temada beyaz vurgu; nötr gri kart ve kontrol yüzeyleri.
- Mevcut düzen, düğme ölçüleri, yüzey stilleri ve kayıtlı tercihler korunur. Finansal yükseliş/düşüş ve uyarı renkleri değişmez.
- Finans hesaplamaları, API/cache/batch fiyat sorguları, auth/Upstash, kullanıcı ve yedek formatları korunur. Yeni dependency yoktur.
- Reddedilen Safir/iOS Sade tasarımı dahil değildir. v9.0.2, etiketi ve archive/v9.0.2 dalında korunur.

Doğrulama: Onaylanan preview üzerinde tam tarayıcı regresyonu; 375/390/430/1024 px açık/koyu görünüm, kontrast, Özet/Portföy/Ayarlar, kayıtlı tercih ve veri koruma, gezinme/katmanlar, PWA safe-area. Kalıcı sürüm numarasıyla build, finans regresyonu ve hedefli renk testi. Tarayıcı kontrolleri sentetik verilerle çalışır.
