# Özer Finans v7.2 Önizleme

Özer Finans; piyasa verilerini izlemek, hisse ve ETF fiyat grafiklerini teknik göstergelerle incelemek, Favorileri takip etmek ve kişisel portföy performansını hesaplamak için geliştirilmiş responsive web uygulamasıdır.

## Canlı uygulama

- Vercel: https://finanstool.vercel.app
- Arayüz dili: Türkçe
- Güncel kalıcı sürüm: **v7.0**
- İncelenen sürüm: **v7.2 Önizleme**

## v7.2 önizleme: davetli üyelik ve şifreli eşitleme

- Açılışta kullanıcı, doğrudan Özer Finans e-posta/şifresiyle giriş yapabilir veya hiçbir veri göndermeden yerel kullanıma devam edebilir.
- Clerk ve Neon kullanılmaz. Şifre özetleri, davetler, oturumlar ve şifrelenmiş uygulama kayıtları Vercel’e bağlı ücretsiz Upstash Redis üzerinde tutulur.
- İlk yönetici tek kullanımlık kurulum koduyla oluşturulur. Sonraki kullanıcılar yalnız yöneticinin ürettiği 24 saat geçerli davet bağlantısıyla kayıt olabilir.
- Şifreler güçlü `scrypt` parametreleriyle tek yönlü özetlenir; finans verisi Upstash’e yazılmadan önce AES-256-GCM ile şifrelenir.
- Oturum 30 gün süreli `HttpOnly`, `Secure`, `SameSite=Lax` çerezle hatırlanır; giriş denemeleri oran sınırına tabidir.
- İlk girişte mevcut cihaz verisinin hesaba aktarılıp aktarılmayacağı kullanıcıya sorulur. Yerel misafir verisi ayrı tutulur ve çıkışta geri yüklenir.
- Bulut kayıtları iyimser sürüm denetimi kullanır; başka cihazdaki daha yeni kayıt sessizce ezilmez. Bağlantı kesilirse yerel kopya korunur.
- Hesap açma zorunlu değildir. Yönetici, Diğer sayfasındaki Kullanıcı Yönetimi kartından davet bağlantısı oluşturabilir.
- Bu çalışma yalnız önizlemedir; kullanıcı onayı gelene kadar ana v7.0 yayını değiştirilmez.

## v7.0 açılır Portföy Özet Analizi ve hedef portföy seçimi

- Portföy Özet Analizi tablosunun içeriği ve hesapları değiştirilmeden korunur.
- Analiz, aktif portföyün özet kutusuna görsel olarak bağlıdır ve kutunun alt kenarındaki ince, uzun çift ok barıyla aşağı doğru açılıp kapanır.
- Analiz tablosu üstteki Bugün/Toplam görünümünden bağımsız olarak daima toplam maliyet, toplam net ve yüzde kâr-zarar ile hafta başından beri net ve yüzde kâr-zararı gösterir.
- Kapalı durumda portföy sayfasında daha az dikey alan kullanılır; para birimi dönüşüm düğmesi bağımsız çalışmaya devam eder.
- Açma barı `aria-expanded` ve `aria-controls` ile ekran okuyucuya doğru durum bilgisini verir.
- Favori bilgi kartındaki “Portföye Ekle” işlemi birden fazla portföy varsa hedef portföy seçimini gösterir; tek portföyde ek adım oluşturmadan devam eder.

## v6.8 portföy gizliliği ve kâr-zarar dönemi

- Toplam Portföy kartındaki göz düğmesi finansal tutarları, adetleri, tarihleri, temettüleri ve portföy grafiklerini `*****` ile maskeler.
- “Bugün” seçimi günlük kâr-zararı; “Toplam” seçimi maliyet başlangıcından itibaren toplam kâr-zararı aktif portföy satırlarında, aktif portföy özetinde ve birleşik Toplam Portföy kartında gösterir.
- Üç küçük kontrol Toplam Portföy başlığıyla aynı hizada sağda; para birimi dönüşüm düğmesi alt sırada sağda konumlanır. Kart kompakt yüksekliğini korur.
- Gizlilik ve dönem seçimleri cihazda ve JSON yedeğinde saklanır.

## v6.7 bağımsız para birimi görünümleri

- Aktif portföyün yanındaki dönüşüm düğmesi yalnız o portföyün görünümünü değiştirir ve diğer portföylere dokunmaz.
- Toplam Portföy dönüşüm düğmesi yalnız bütün portföylerin birleşik toplam kartını değiştirir.
- Ayarlardaki tercih edilen para birimi seçimi bütün portföylerin ve Toplam Portföy alanının önceki yerel seçimlerinin üzerine yazar.
- Portföy bazlı ve toplam alanına ait seçimler cihazda saklanır; JSON yedeği bağımsız portföy para birimlerini ve toplam görünüm tercihini korur.

## v6.6 portföy ve kullanım geliştirmeleri

- Para birimi tercihi bütün bağımsız portföylere ortak uygulanır; TRY ve USD yanında ürün, nakit ve temettü tutarlarını kendi para biriminde bırakan seçenek bulunur.
- Yaklaşan temettü bulunmadığında son geçmiş temettüler tarih ve tutar bilgisiyle yedek olarak gösterilir.
- Çok sayıdaki portföy düğmesi satırlara yayılır ve Favoriler gibi uzun basıp yumuşak sürüklemeyle sıralanabilir.
- Portföy silme işlemi kısa süreli geri alma bildirimi sunar; ayarlar, bildirim anahtarları ve yedekleme akışı mobil kullanıma göre düzenlenmiştir.
- Teknik denetimde bulunan fiyat/kur tarihi, düzeltilmiş kapanış, RSI ön geçmişi, veri tazeliği ve sağlayıcı dayanıklılığı sorunları giderilmiştir.

## v6.5 yeni siyah-beyaz marka sembolü

- Uygulamadaki eski ÖF monogramının yerini, dört piyasa çubuğunu kesen simetrik akıştan oluşan harfsiz A sembolü aldı.
- Aynı sembol dört ana sayfanın marka satırında, masaüstü menüsünde, tarayıcı ikonunda ve iPhone Ana Ekrana Ekle simgesinde ortak kullanılır.
- Apple Touch Icon 180×180; PWA ikonları 192×192 ve 512×512 boyutlarında beyaz zeminli, siyah sembollü ve güvenli kenar boşluklu olarak üretildi.
- İkon URL'leri `v6.5` sorgusuyla yenilendi; daha önce eklenmiş iPhone kısayollarında eski Safari ikon önbelleğini temizlemek için kısayolun silinip yeniden eklenmesi gerekebilir.

## v6.4 gerçek fiyat zamanları ve genişletilmiş favori adı

- BIST kartlarında uygulamanın sorgu saati gösterilmez. TradingView gecikmeli fiyat iletim zamanı, Yahoo’nun borsadaki gerçek son işlem zamanı ile sınırlandırılır; piyasa kapandıktan sonra kart saati ilerlemez.
- BIST fiyatı, mutlak değişimi ve yüzde değişimi aynı TradingView anlık görüntüsünden gelmeye devam eder; Yahoo yalnız zaman doğrulaması için kullanılır.
- Gram altının güncel fiyat zamanı, `XAU/USD` ile `USD/TRY` bileşenlerinden daha eski olanın gerçek `last_bar_update_time` değeridir. Günlük `GC=F` mumunun Türkiye saatindeki 07:00 başlangıcı kart zamanı olarak kullanılmaz.
- Favori kartında zaman satırı şirket/fon adı sütununun genişlik hesabından çıkarılmış ve kartın altına ölçülü biçimde yerleştirilmiştir. Böylece kart yüksekliği korunurken uzun adlara daha fazla yatay alan kalır.

## v6.3 doğrulanmış BIST ve TEFAS fiyatları

- Bütün BIST hisselerinde kısa fiyat, mutlak değişim ve yüzde değişim aynı TradingView Türkiye anlık görüntüsünden alınır. Böylece fiyat doğru görünürken eksik bir tarihsel işlem günü nedeniyle yüzde işaretinin yanlış hesaplanması engellenir.
- TradingView erişilemezse Yahoo geçmişi yalnız beklenen önceki iş günü gerçekten bulunuyorsa günlük değişim hesaplar; eksik gün başka bir kapanışla değiştirilmez.
- Bütün TEFAS fonlarında açık TEFAS aynası ile resmî TEFAS servisi paralel kontrol edilir. En güncel tarihli kayıt seçilir; tarihler eşitse resmî TEFAS değeri önceliklidir.
- Fon fiyatları kartlarda gerçek zamanlı fiyat gibi sunulmaz; “Son resmî” tarihi, BIST fiyatlarında ise gerektiğinde gecikme bilgisi gösterilir.
- Aynı doğrulanmış fiyat katmanı Piyasa Özeti, Favoriler ve Portföy hesaplarında ortak kullanılır. BJKAS ve ENR yalnız kabul testleri için örnek sembollerdir; kural tüm BIST hisseleri ve TEFAS fonları için geçerlidir.

## v6.2 ortak gram altın, sade BIST kodları ve iPhone ikonu

- Piyasa Özeti ve Favoriler gram altın için aynı `ALTIN-GRAM` fiyat URL'sini, aynı bir aylık son fiyat serisini ve aynı eşzamanlı istek kaydını kullanır. İki bölümün ayrı süre önbelleklerinden farklı rakam göstermesi engellenir.
- Kullanıcı `THYAO`, `ASELS` veya `BJKAS` gibi ek içermeyen bir kod yazdığında arama sonucu ilgili Borsa İstanbul sembolünü bulursa `.IS` eki otomatik uygulanır.
- `.IS` sağlayıcı eki veri isteklerinde ve saklanan kayıtlarda korunur; kartlar, öneriler ve portföy satırlarında kullanıcıya sade BIST kodu gösterilir.
- Özer Finans logosu iPhone için 180×180, PWA için 192×192 ve 512×512 PNG ikonlarıyla paketlenmiştir.
- `manifest.webmanifest`, bağımsız uygulama görünümü, Özer Finans adı, tema rengi ve standart PWA ikonlarını tanımlar. Safari `apple-touch-icon` üzerinden ana ekran simgesini doğrudan kullanır.

## v6.1 hızlı TEFAS ve portföy açılışı

- YVD dahil TEFAS fonları kod, resmî uzun ad, banka ve portföy yönetim şirketi ifadeleriyle aranabilir; yaygın fonlar ağ yanıtı beklenmeden yerel katalogdan önerilir.
- TEFAS arama ve fiyat akışı düşük gecikmeli Edge işlevine taşındı. Açık TEFAS veri aynası birincil, resmî TEFAS uçları yedek kaynak olarak kullanılır.
- Bir portföydeki en fazla 25 TEFAS fonunun fiyatı tek bir toplu istekte ve sunucu tarafında paralel alınır. CDN önbelleği 15 dakika taze, kaynak geçici olarak yavaşladığında 24 saate kadar yeniden doğrulama sırasında kullanılabilir.
- Aktif portföyün son başarılı kartları ve toplamları cihazda anlık görünüm olarak saklanır. Portföy yeniden açıldığında bu görünüm hemen gösterilir; güncel fiyatlar arka planda yerleşimi bozmadan yenilenir.
- Fiyat ve temettü yeniden yatırım hesapları paralel başlatılarak portföy kartlarının temettü servislerini gereksiz yere beklemesi önlenir.

## v6.0 TEFAS fonları, varlık logoları ve mobil arama

- Altın ürünleri, seçilen D alternatifindeki üçlü külçe çiziminin yüksek çözünürlüklü yerel rozetini kullanır.
- TEFAS fonlarında fon adından yönetim şirketi tanınır; Ak, Yapı Kredi, İş, QNB/Enpara, Garanti, Ziraat, Vakıf, Halk, Deniz, TEB ve Fiba logoları uygulamanın yerel varlıklarından gösterilir. Ağ erişimi gerekmez; yalnız tanınmayan yönetici için nötr `FON` rozeti kullanılır.
- Altın ve fon rozetleri yerel/veri URI tabanlıdır; fiyat yenilemelerinde yeniden indirilmez ve kart yerleşimini oynatmaz.
- Mobil arama önerileri iOS klavyesi ve sabit alt menü için kalan alanı ölçer; aşağıda yeterli yer yoksa listenin tamamı arama kutusunun üzerinde açılır.

- Portföy araması artık TEFAS fon kodu veya uzun fon adıyla arama yapar; sonuçlar `TEFAS-MAC` gibi sağlayıcısı belirgin kodlarla gösterilir.
- TEFAS'ın hızlı aramasında görünmeyebilen YLB ve ENR gibi yatırım fonları, resmî tam fon listesindeki kod ve unvan eşleşmesiyle de bulunur.
- Fon araması `Yapı Kredi`, `Yapi Kredi`, `QNB` ve `Enpara` gibi banka/portföy yöneticisi ifadelerinde Türkçe karakter farklarını önemsemez.
- YLB ve ENR resmî Türkçe unvanlarıyla eş anlamlı kaydedilir ve banka adıyla gelen kalabalık sonuçlarda ilk önerilere taşınır.
- Bu iki fon kod, banka veya ürün adıyla eşleştiğinde ağ yanıtı beklenmeden anında önerilir; TEFAS ve piyasa sonuçları arka planda listeye eklenir.
- Hızlı YLB/ENR eşleşmesi yalnız Portföy alanıyla sınırlı değildir; Grafik, Favoriler, Piyasa ve Performans Kıyaslama aramaları da aynı öneriyi kullanır.
- Bu alanların tamamı ayrıca TEFAS'ın tam YAT yatırım fonu aramasını piyasa aramasıyla aşamalı birleştirir; YLB/ENR dışındaki fonlar da kod veya uzun unvanla bulunabilir.
- Fon unvanı araması kelime sırasından bağımsızdır ve `para piyasası`/`money market`, `portföy`/`asset management` gibi Türkçe–İngilizce finans terimlerini eşleştirir; örneğin `para piyasası yapı` YVD dahil ilgili Yapı Kredi fonlarını getirir.
- Aktif TEFAS işlem listesi, boş sorguyla alınan genel fon unvan kataloğuyla birleştirilir; YVD gibi kodla fiyatlanabilen fakat tam işlem listesinde görünmeyen fonlar da özellik/yönetici aramasına katılır.
- Banka markaları ilgili portföy yönetim şirketleriyle eşleştirilir; örneğin `Akbank` araması Ak Portföy, `İş Bankası` araması İş Portföy ve `Garanti BBVA` araması Garanti Portföy fonlarını getirir.
- Arama kutuları sonuçsuz sorgularda “Eşleşen ürün bulunamadı”, sağlayıcı kesintisinde ise ayrı bir bağlantı hatası gösterir.
- TEFAS fonlarının resmî günlük fiyat geçmişi Özer Finans fiyat biçimine dönüştürülerek portföy değeri, günlük/haftalık değişim ve grafik akışlarında kullanılabilir.
- TEFAS’ın güncel bot korumasına uyum için ayrı Python sunucu işlevi, Chrome uyumlu TLS oturumu, kısa süreli istek birleştirme ve CDN önbelleği kullanılır.
- TEFAS fonlarında otomatik temettü geri yatırımı uygulanmaz; bu ürünlerde dağıtım etkisi fon fiyatının içindedir ve seçenek arayüzde devre dışıdır.

## v5.7 çoklu bağımsız portföy ve favori sıralaması

- Tek cihazda en fazla 50 bağımsız portföy oluşturulabilir; her portföyün hisseleri, nakit bakiyeleri, maliyetleri, alış tarihleri ve temettü yeniden yatırım ayarları ayrı tutulur.
- Portföy sayfasındaki kompakt seçiciyle aktif portföy değiştirilir; yanındaki kontroller yeni portföy oluşturur, adını değiştirir veya son portföy dışında seçili portföyü siler.
- Seçicinin üstündeki Toplam Portföy kartı bütün portföylerin birleşik güncel değerini ve günlük değişimini USD veya TL bazında gösterir. Seçicinin altındaki yatay kısayol düğmeleri portföyler arasında tek dokunuşla geçiş sağlar.
- Aktif portföyün dönüşüm düğmesi TL ağırlıklı portföyde USD karşılığını, USD veya karma portföyde TL karşılığını gösterir; ikinci dokunuş asıl para birimine döner.
- v5.6 ve daha eski tek portföy verileri ilk açılışta otomatik olarak `Portföyüm` adlı portföye taşınır; eski yerel kayıtlar silinmez.
- JSON yedek şeması v2'ye yükseltilmiştir. Bütün portföyler tek dosyaya dahil edilir; v1 yedekleri geriye dönük olarak geri yüklenebilir.
- Grafik sayfasındaki Portföy varlık seçicisi yalnız aktif portföyün hisselerini gösterir.
- Favori kartları tutamaç olmadan basılı tutulup sürüklenerek sıralanır. iPhone için bağımsız TouchEvent akışı, 60 FPS iki eksenli takip, görünmez yer tutucu, yumuşak komşu geçişleri ve kalıcı sıra kaydı kullanılır; sağ işlem düğmeleri kartla birlikte görünür kalır.

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
- Favori kartları ayrı bir tutamaç olmadan yaklaşık 0,4 saniye basılı tutulup sürüklenerek sıralanabilir; iPhone için bağımsız TouchEvent akışı gerçek kartı ve sağ işlem düğmelerini 60 FPS yaylı ara karelerle parmağın yatay ve dikey hareketinde birlikte taşır. Görünmez yer tutucu ikinci bir kart oluşturmaz; metin seçimi ve dokunma çağrı balonu engellenir. Yeni sıra otomatik olarak cihazda saklanır.
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
