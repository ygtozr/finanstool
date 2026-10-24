# Özer Finans v9.0.5

Menü ve işlem ikonları, yazı hiyerarşisi ve görsel ölçüler iOS diline yaklaştırıldı. Kullanıcının onayladığı v9.0.5-preview.3 düzeni kalıcı sürüme alındı.

- Ortak 20/22 px özgün SVG ikonlar; aktif alt sekmede dolu ikon ve tema vurgusu.
- Yenileme, ayar, favori, portföy yönetimi, gizlilik, para birimi ve kaldırma işlemlerinde tutarlı ikonlar.
- Başlık/fiyat/yardımcı metinlerde yeni boyut ve ağırlık hiyerarşisi; iPhone sistem fontu korunur.
- 34 px marka simgesi, 38 px yumuşak kare hisse rozeti ve tema rengine uyumlu favori/işlem tuşları.
- Mevcut 44 px dokunma alanları, sabit alt menü, safe-area, renk/materyal ve yazı boyutu tercihleri korunur.
- Hazır tema kısayolları eklenmedi. Figma kullanılmadı; resmî Apple ikon/font dosyası veya yeni dependency yoktur.
- Finans hesapları, API/cache/auth/Upstash ve kullanıcı/yedek şemaları değişmedi.

Doğrulama: önizlemede build, birim ve tam tarayıcı regresyonu; 375/390/430/1024 açık/koyu dört ekran, ikon/tipografi, finans işlemleri, favori/seans verileri, katmanlar, safe-area/PWA ve hata kurtarma geçti. Kalıcı sürüm hazırlığında build/birimler ve hedefli iOS testi yeniden çalıştırılır. Sentetik testler fiziksel iPhone veya gerçek sağlayıcı kabulü değildir.

Önceki v9.0.4, mevcut etiketi/Release kaydı ve archive/v9.0.4-before-ios-v9.0.5 dalında korunur.
