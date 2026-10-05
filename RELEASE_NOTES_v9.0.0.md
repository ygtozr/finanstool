# Özer Finans v9.0.0

React + Framework7 iOS arayüz geçişi ve önceki ön izlemelerde doğrulanan düzeltmeler kalıcı sürüme alınır. Finans hesaplamaları, mevcut API/Vercel Functions, Chart.js, cache/batch, auth/Upstash ve kullanıcı/yedek formatları korunur.

- Ayarlar önceki ayrı kart düzenine döner; beş birleşik grup kaldırılır.
- Görünüm ve para birimi üçlü seçimleri satırı doldurur, seçili alan mevcut vurgu rengini kullanır. Kompakt görünüm, kayan geçiş ve 44 px dokunma alanı korunur.
- Özet, favori kartları, ayrıntı kaydırması, mobil navigasyon, Grafik/Portföy/Diğer kabukları ve ortak kontrol tasarımları güncellenir.
- Tarih/DRIP doğrulaması, grafik hata/dışa aktarım davranışı ve arama hata/tekrar durumları düzeltilir; kullanılmayan kod temizlenir.

Kalıcı adres: https://finanstool.vercel.app
Önceki kalıcı sürüm: v8.0, a80b5c386523ef6cc0669f17d2484bd0f6caa305 (v8.0 etiketi ve archive/v8.0 dalı).

Doğrulama: build, genel regresyon ve 375/390/430/1024 px açık/koyu tarayıcı akışı. Tarayıcı testleri sentetik veri kullanır; fiziksel iPhone ve canlı hesap/sağlayıcı kabul testi değildir.
