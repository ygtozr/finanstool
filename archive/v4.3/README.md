# FinansTool v4.3

FinansTool; piyasa verilerini izlemek, hisse ve ETF fiyat grafiklerini teknik göstergelerle incelemek, Favorileri takip etmek ve kişisel portföy performansını hesaplamak için geliştirilmiş responsive web uygulamasıdır.

## Canlı uygulama

- Vercel: https://finanstool.vercel.app
- Arayüz dili: Türkçe
- Güncel kalıcı sürüm: **v4.3**

## v4.3 iOS ana ekran düzeltmesi

- Mobil alt gezinme iOS bağımsız web uygulamasında ekranın fiziksel altına sabitlenir.
- Çentik ve ana ekran göstergesi güvenli alanı menünün konumunu değiştirmek yerine iç dolguya eklenir.
- Dinamik viewport birimleri, `viewport-fit=cover` ve Apple web uygulaması meta bilgileri kullanılır.
- Sayfa içeriği alt menünün altında kalmaması için güvenli alan kadar boşluk bırakır.

## v4.2 dönem özeti ve arayüz kararlılığı

- Uygulama her açılışta Özet sayfasıyla başlar.
- Grafik dönem düğmeleri Dönem Özeti'nin üzerine taşınmıştır.
- Son kapanış, dönem düşük ve dönem yüksek değerleri kendi tarihleriyle; güncel fiyatın dönem içindeki yeri ise düşük–yüksek konum çubuğuyla gösterilir.
- Favoriler başlığı yenileme anını, her favori kartı sağlayıcıdaki gerçek son fiyat zamanını gösterir.
- RSI ana fiyat grafiğine bitişik ve hemen altındadır.
- Grafik araç çubuğu Gelişmiş Arama, Fiyat Alarmı, MA50/100/200, RSI, CSV ve PNG sırasındadır; düğmeler ortak tipografi ve ortalı hizalama kullanır.
- Portföy araması varlık listesinin altındadır; üç performans sonucu tek satırda gösterilir.
- Portföy yenilemesi görünümü kaydırmaz ve dağılım grafiklerini tekrar oynatmaz.

## v4.1 teknik kararlılık

Bu sürüm yeni ürün özelliği eklemez. v4.0 denetiminde bulunan fiyat, kur, portföy, gösterge, eşzamanlılık, performans ve erişilebilirlik sorunlarını düzeltir:

- Eski grafik ve arama yanıtlarının yeni kullanıcı seçimini ezmesi engellenir.
- Piyasa kartı seçildiğinde Grafik Ve Teknik Analiz sayfası açılır.
- Portföy ve ölçüt farklı para birimlerindeyse iki seri de USD bazında karşılaştırılır.
- Eksik geçmiş kur günlerine gelecekteki kur yazılmaz; kur alınamazsa yanıltıcı portföy toplamı gösterilmez.
- MA değerleri para birimi dönüşümünden sonra, RSI ise Wilder yöntemiyle hesaplanır.
- Portföy açıkken 15 saniyelik yenilemeye katılır.
- Fiyat istekleri kısa süreli önbellek ve eşzamanlı istek birleştirmesi kullanır; grafik nesneleri silinmeden güncellenir.
- Arama önerileri klavye ve ekran okuyucu kullanımını destekler.
- Chart.js bütünlük doğrulaması, API yöntem/oran koruması ve regresyon testleri eklenir.

v4.1 teknik kararlılık düzeltmeleri v4.2'de korunur.

## v4.0 arayüzü

Uygulama üç ana sayfaya ayrılmıştır:

1. **Özet**
   - Piyasa Özeti ilk sırada gösterilir.
   - Mobilde piyasa kartları her satırda iki kart olacak şekilde dört satır halinde görünür.
   - Favoriler Piyasa Özeti'nin altında yer alır.
2. **Grafik Ve Teknik Analiz**
   - Sembol veya şirket/fon adıyla arama yapılır.
   - Fiyat grafiği, dönem seçenekleri ve teknik analiz kontrolleri doğrudan görünür.
   - MA50/100/200, RSI, gelişmiş arama, fiyat alarmı, CSV ve PNG dışa aktarma desteklenir.
3. **Portföy**
   - Toplam portföy büyüklüğü ve günlük değişim.
   - Portföy Özet Analizi.
   - Portföydeki hisseler.
   - Varlık ve para birimi dağılımı.
   - Performans karşılaştırması.
   - Temettü Takvimi.

Masaüstünde sabit sol menü; mobilde Özet, Grafik, Portföy ve Diğer seçeneklerinden oluşan alt gezinme kullanılır.

Piyasa Özeti, v4.0 güncellemesi ilk açıldığında eski veya eksik yerel listeyi bir kez onararak şu sabit sekiz değeri otomatik yükler: USD/TRY, EUR/TRY, GBP/TRY, EUR/USD, S&P 500, Nasdaq, BIST 100 ve Bitcoin. Bu ilk geçişten sonra kullanıcı listeyi dişli düğmesinden yeniden özelleştirebilir.

## Finans verileri

- ABD hisseleri ve ETF'leri: `AAPL`, `MSFT`, `VOO`, `GLD`
- BIST hisseleri: `.IS` ekiyle, örneğin `THYAO.IS`, `ASELS.IS`
- Grafik süreleri: 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, 5 yıl veya özel başlangıç tarihi
- Birden fazla ürün aynı grafikte karşılaştırılabilir.
- Farklı para birimlerindeki karşılaştırmalar USD bazına dönüştürülür.
- Piyasa, Favoriler ve açık grafik 15 saniyede bir yenilenir.

## Portföy özellikleri

- Adet ve birim maliyetle varlık ekleme
- Ağırlıklı ortalama maliyet
- Güncel değer, net ve yüzde kâr/zarar
- Günlük ve hafta başından itibaren değişim
- Varlık ve para birimi dağılım grafikleri
- S&P 500, Nasdaq, BIST 100, Altın veya özel ölçütle performans karşılaştırması
- En fazla beş satırlık temettü/dağıtım listesi

## Veri sağlayıcı sürekliliği

Yahoo Finance birincil veri kaynağıdır. Desteklenen ABD hisse ve ETF'lerinde Nasdaq, diğer durumlarda ikincil Yahoo erişim noktası yedek olarak kullanılır. Arama servisi de Yahoo ve Nasdaq arasında otomatik geçiş yapar.

## Yerel veri ve yedekleme

Favoriler, portföy, fiyat alarmları, Piyasa Özeti ve tema ayarı tarayıcının `localStorage` alanında saklanır. Veriler JSON dosyası olarak dışa aktarılabilir; geri yüklerken birleştirme veya değiştirme seçilebilir.

## Teknik yapı

- Tek sayfalı HTML/CSS/Vanilla JavaScript ön yüz
- Chart.js 4.4.4
- Vercel Serverless Functions
- `api/price.js`: fiyat ve geçmiş veri
- `api/search.js`: sembol ve şirket/fon araması
- GitHub `main` dalından Vercel üretim yayını

Ayrıntılı ürün isterleri, tasarım sistemi, veri modeli, hesaplamalar ve kabul testleri için `URUN_VE_TEKNIK_TASARIM.md` belgesine bakın.
