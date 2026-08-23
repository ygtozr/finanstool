# Özer Finans v5.6

Özer Finans; piyasa verilerini izlemek, hisse ve ETF fiyat grafiklerini teknik göstergelerle incelemek, Favorileri takip etmek ve kişisel portföy performansını hesaplamak için geliştirilmiş responsive web uygulamasıdır.

## Canlı uygulama

- Vercel: https://finanstool.vercel.app
- Arayüz dili: Türkçe
- Güncel kalıcı sürüm: **v5.6**

## v5.6 otomatik temettü yatırımı, altın ve portföy düzenleme

- Portföy pozisyonlarına alış tarihi, maliyet para birimi ve temettüyü yeniden yatırma tercihi eklenmiştir. Vergi oranı ile kesirli/tam pay seçimi desteklenir; geçmiş dağıtımlar ödeme tarihindeki kapanışla pozisyon adedine yansıtılır.
- Temettü geçmişi Nasdaq verisiyle, uygun olmayan sembollerde Yahoo dağıtım olayları yedeğiyle alınır. `MINT` dahil Nasdaq dışı ETF'lerde yedek akış doğrulanmıştır.
- Gram altın `XAU/USD × USD/TRY ÷ 31,1034768` yöntemiyle TL/gram hesaplanır. Çeyrek, yarım, tam, Cumhuriyet, ata ve gremse altın ürünleri alış fiyatıyla takip edilebilir.
- Portföydeki hisse ve nakit kartlarına dokunarak kayıt bilgileri düzenlenebilir. Nakit silme düğmesi kart sınırları içinde kompaktlaştırılmıştır.
- iOS giriş alanlarında odaklanma yakınlaştırması kaldırılmış, web-app ölçeği sabitlenmiştir; normal kaydırma ve aşağı çekerek yenileme korunur.

## v5.5 logo sürekliliği ve çekerek yenileme

- Favori, portföy, hızlı detay ve grafik varlık listelerindeki logolar FMP ve EODHD kaynaklarını sırayla dener; ikisi de başarısızsa baş harf rozeti korunur.
- BIST logoları için TradingView sembol meta verisini kullanan aynı kaynaklı üçüncü yedek servis bulunur. `BJKAS.IS` canlı önizlemede doğrulanmıştır.
- Logolar Safari'nin gecikmeli görünürlük tahminine bırakılmadan yüklenir.
- Mobilde ekranın en üstündeyken aşağı çekip bırakmak aktif Özet, Grafik, Portföy veya Diğer sayfasının verilerini yeniler.
- Çekme eşiği boyunca “Yenilemek için çekin”, “Yenilemek için bırakın”, “Yenileniyor” ve sonuç durumu gösterilir.

## v5.4 portföy yenileme performansı

- Portföy fiyat kartları ve özet hesapları, yavaş temettü sorgularını beklemeden güncellenir.
- Güncel değer, günlük değişim ve hafta başı hesabı için gerekli fiyat geçmişi 1 yıllık yerine 1 aylık aralıkla alınır.
- Temettü takvimi portföy özetinden bağımsız olarak arka planda yüklenir.
- Otomatik 15 saniyelik portföy yenilemesi performans kıyasını ve temettü servislerini yeniden çalıştırmaz; bu ağır bölümler sayfa açılışında veya ilgili kullanıcı işlemlerinde yenilenir.
- TL/asıl para birimi dönüşümü mevcut fiyat verisiyle yalnız portföy özetini yeniden hesaplar.

## v5.3 Özer Finans marka ve portföy özeti sürümü

- Uygulamanın görünen adı Özer Finans olarak güncellendi. Beyaz zeminli ÖF ve yeşil onay sembolü, Özet, Grafik Ve Teknik Analiz, Portföy ve Diğer sayfalarının üstünde ortalı gösterilir.
- Sürüm bilgisi rozet olmadan, küçük ve düşük kontrastlı biçimde marka satırının sağ altında yer alır.
- Piyasa Özeti, Favoriler, Grafik Ve Teknik Analiz ve Portföyüm başlıkları ortak `18.72px` boyut kullanır.
- Portföy üst özeti çerçeveli karta dönüştürüldü; toplam değer ve günlük değişim büyütüldü. `⇄` düğmesi özet, kâr/zarar ve dağılım değerlerini çapraz kurla TL bazında gösterebilir.
- Özet sayfasındaki iki Yenile düğmesi 38 px yüksekliğe küçültüldü.
- Fiyat ve RSI grafiklerinin lejant renk örnekleri seri rengiyle tamamen dolu gösterilir.

## v5.2 mobil ekran verimliliği

- Mobilde eski 48 px sabit üst marj kaldırıldı; yalnız cihazın gerçek güvenli üst alanı korunur.
- Dış gövde, ana çerçeve ve Piyasa Özeti yatay dolguları azaltılarak içerik alanı genişletildi.
- Mobil içerik ekranın üstüne daha yakın başlar; alt gezinmenin iOS güvenli alan davranışı değişmez.
- 320 px, 390 px ve 760 px genişliklerde yatay taşma olmadığı doğrulandı.

## v5.1 veri doğruluğu ve kompakt arayüz sürümü

- Portföy toplamları eksik fiyat veya kur bulunduğunda yanıltıcı biçimde yayımlanmaz; eksik varlıklar açıkça belirtilir.
- Portföy performansı temettü ve bölünme düzeltilmiş kapanışlarla, bütün serilerin ortak başlangıç tarihinde hesaplanır; kısmi veriyle kesin sonuç gösterilmez.
- Maliyet para birimi ve isteğe bağlı alım tarihi kaydedilir; tarihî maliyet kuru desteklenir.
- Kısa dönem RSI için görünür aralık öncesinden veri alınır; 1 haftalık görünümde de RSI hesaplanabilir.
- Fiyat, temel veri ve temettü servislerinde “veri yok”, “desteklenmiyor” ve “sağlayıcı hatası” durumları ayrılır; BIST için bağımsız fiyat/temettü yedeği eklenmiştir.
- Favori, piyasa ve portföy kartları mobilde daha kompakt hale getirilmiştir. Piyasa fiyatı ile yüzde değişimi yan yana; portföy puntoları Favoriler ile aynı boyuttadır.
- Küçültülen işlem/silme düğmelerinin görünmez dokunma alanları en az 44×44 piksel olarak korunur.

## v5 ürün ve ayar merkezi sürümü

- Favori kartlarına hızlı işlem menüsü ve sade ekonomik gösterge paneli eklendi; ana grafik karşılaştırma akışı kaldırıldı.
- RSI ana grafiğin altında sürekli görünür; MA50/100/200 kontrolü grafik içine, Favoriler ve Portföy varlık seçicileri grafik sayfasının altına yerleştirildi.
- Portföye TRY, USD, EUR ve GBP nakit ekleme; bütün grafik dönemleriyle performans karşılaştırması ve yaklaşan temettü listesi eklendi.
- Portföy varlık kartları iki satırlı kompakt düzene, dağılım grafikleri yan yana mini halka görünümüne geçirildi. İlk üç kalem doğrudan, diğerleri açılır özetle gösterilir.
- Grafik veri balonları şirketin uzun adı yerine yalnız sembolü kullanır.
- “Diğer” bağımsız dördüncü sayfadır. Açık, Koyu ve Sistem temaları; otomatik yenileme süresi; varsayılan grafik dönemi; alarm denetimi; JSON yedekleme ve yardım bilgileri burada bulunur.
- Tüm yeni tercihler cihazda kalıcıdır ve JSON yedeğine dahil edilir.

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

Uygulama dört ana sayfaya ayrılmıştır:

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
4. **Diğer**
   - Açık, Koyu ve Sistem tema seçenekleri.
   - Otomatik yenileme ve varsayılan grafik dönemi tercihleri.
   - Fiyat alarmı denetimi, veri yedekleme, yardım ve sürüm bilgisi.

Masaüstünde sabit sol menü; mobilde Özet, Grafik, Portföy ve Diğer seçeneklerinden oluşan alt gezinme kullanılır.

Piyasa Özeti, v4.0 güncellemesi ilk açıldığında eski veya eksik yerel listeyi bir kez onararak şu sabit sekiz değeri otomatik yükler: USD/TRY, EUR/TRY, GBP/TRY, EUR/USD, S&P 500, Nasdaq, BIST 100 ve Bitcoin. Bu ilk geçişten sonra kullanıcı listeyi dişli düğmesinden yeniden özelleştirebilir.

## Finans verileri

- ABD hisseleri ve ETF'leri: `AAPL`, `MSFT`, `VOO`, `GLD`
- BIST hisseleri: `.IS` ekiyle, örneğin `THYAO.IS`, `ASELS.IS`
- Grafik süreleri: 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, 5 yıl veya özel başlangıç tarihi
- Ana grafik aynı anda tek seçili ürünü sade biçimde gösterir; portföy performansı seçilen piyasa ölçütüyle karşılaştırılabilir.
- Portföy ve ölçüt farklı para birimlerindeyse performans serileri USD bazına dönüştürülür.
- Piyasa, Favoriler, açık grafik ve açık Portföy kullanıcı seçimine göre 5–60 saniyede yenilenir veya kapatılabilir.

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

Favoriler, hisse/nakit portföyü, pozisyonların alım tarihleri ve temettü yeniden yatırım ayarları, fiyat alarmları, Piyasa Özeti, tema, yenileme ve grafik dönemi tercihleri tarayıcının `localStorage` alanında saklanır. Bu alanların tamamı JSON dosyası olarak dışa aktarılır; geri yüklerken birleştirme veya değiştirme seçilebilir. Birleştirmede aynı sembol yedekte de bulunuyorsa pozisyon ve temettü ayarları yedekteki kayıtla geri yüklenir.

## Teknik yapı

- Tek sayfalı HTML/CSS/Vanilla JavaScript ön yüz
- Chart.js 4.4.4
- Vercel Serverless Functions
- `api/price.js`: fiyat ve geçmiş veri
- `api/search.js`: sembol ve şirket/fon araması
- GitHub `main` dalından Vercel üretim yayını

Ayrıntılı ürün isterleri, tasarım sistemi, veri modeli, hesaplamalar ve kabul testleri için `URUN_VE_TEKNIK_TASARIM.md` belgesine bakın.
