# Özer Finans v9.0.2

- Portföy, grafik ve ayar kontrolleri kompakt, sabit ölçülü ve yumuşak köşeli hale geldi.
- Aktif Portföy ikonları yakınlaştırıldı; para birimi ve gizleme tuşları eş görünüm kullanıyor. Aktif Portföy başlığına mevcut tercihle eşleşen gizlilik tuşu eklendi.
- Hisse ayrıntısı eylemleri seçili vurgu rengine uyuyor ve görünen yüksekliği 38 px. Uzun portföy adları düğmeyi büyütmeden kısalıyor; tam ad erişilebilir adda ve araç ipucunda korunuyor.
- İşlem paneli görünüm alanı altında sabit kalıyor ve gerektiğinde kaydırılıyor.
- Kullanılmayan 37 ön izleme/tasarım dosyası, boş requirements.txt ve kullanılmayan altın ikon seçenek görseli güncel daldan temizlendi (yaklaşık 7,2 MB). Önceki kaynak archive/v9.0.1 ve özgün v9.0.1 etiketinde korunuyor.
- Finans hesapları, API/veri kaynakları, cache/batch, auth ve kullanıcı/yedek formatları korunuyor; yeni dependency yok.

Kalıcı adres: https://finanstool.vercel.app

Doğrulama: build, genel regresyon ve sentetik Chromium tarayıcı akışları; 375/390/430/1024 px, açık/koyu tema, üç yazı boyutu, tıklanabilirlik, hisse/portföy işlemleri, katmanlar ve PWA safe-area. Fiziksel iPhone ve canlı veri sağlayıcısı kabul testi kapsam dışı.
