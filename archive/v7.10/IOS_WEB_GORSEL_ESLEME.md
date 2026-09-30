# iOS → Web görsel eşleme

30 Eylül 2026 — kullanıcı onayıyla kalıcı v7.9 tasarım çalışması.

Referans: `ios/OzerFinans/RootView.swift` ve `ios/OzerFinans/Screens.swift` kaynaklarındaki iOS arayüzü ile kullanıcının paylaştığı grafik ekran görüntüleri. Web: `index.html`, `assets/appearance.js`. Native v7.7 ve web v7.8 veri/sürüm farkı nedeniyle karşılaştırma yerleşim ve stil odaklıdır; aynı veriyle otomatik piksel farkı değildir.

## v7.10 — bağımsız görünüm ve iOS ekran eşlemesi

Mod, vurgu rengi, kart malzemesi ve yazı yoğunluğu ayrı tercihler olarak çözülür. `assets/appearance.js` yalnız seçilen malzemenin boya tokenlarını atar; `assets/component-system.css` kartları tek boya yolundan çizer. Arka plan rengi, desen/geçiş, gölge, kontur ve bulanıklık ayrı CSS özellikleridir. Bu ayrım, sonradan gelen ortak kart kuralının seçili stili ezmesini engeller. Native AppCard'da Mat ve İnce Çizgi aynı malzemeyi kullandığı için webde de aynı görünür; diğer altı malzeme kendi görsel tokenlarına sahiptir. Camın CSS bulanıklığı SwiftUI `ultraThinMaterial` için yaklaşık karşılıktır, birebir ölçüm değildir.

Kullanıcının altı yeni iOS ekranına karşı `assets/ios-screen-alignment.css` bileşen düzeyi farkları giderir: iki sütunlu kompakt piyasa ve favori satırları, tam ekran favori ayrıntısında fiyat/temel bilgi kartları, grafik altındaki tek sütunlu logo–kod–ad–ok listesi, Portföy “Varlıklar” satırları ve Diğer sayfasındaki bölüm/segman/seçici düğmeleri. Favori ayrıntısı fiyat, değişim, zaman ve sağlayıcı adını favori kartıyla aynı kompakt fiyat katmanından alır; yıllık sınırlar ve teknik göstergeler grafik geçmişinden gelir. Günlük aralık, hacim ve RSI dahil bütün dokuz gösterge temel bilgi kartında doğrudan görünür. Görünüm renk/yüzey seçicileri diğer ayar seçicileri gibi tam genişlikte çerçeveli düğmelerdir. Web düzeni için yapılan sapmalar aşağıdadır; gerçek iPhone Safari/PWA görüntüsü ayrıca kullanıcı tarafından denetlenmelidir.

| Ölçü / rol | iOS kaynak noktası | Web mobil uygulama | Not |
|---|---:|---:|---|
| Ana kart köşesi / sınır | 12 / 1 | 12 / 1 px | Malzeme değişirken geometri sabit. |
| Genel kart iç boşluğu | 12 | 12 px | Piyasa kartı istisnadır. |
| Piyasa kartı iç boşluğu | 8 | dikey 3, yatay 8–10 px | İki satırlı iOS kartına göre görsel uyarlama. |
| Piyasa kartı asgari yüksekliği | sabit değil | 48 px | İçerik gerekirse kart büyür. |
| Piyasa kartı sütunu | 2 | mobil 2, tablet 3, masaüstü 4 | Tablet/masaüstü web uyarlaması. |
| Piyasa kartı etiketi/fiyat/değişim | 11 / 16 / 10 temel punto | standart 11 / 16 / 10 px | SwiftUI `@ScaledMetric` fiziksel CSS pikseli değildir. |
| Mobil fiyat çizim alanı | 240 | 240 px | Başlık, meta ve dış kart yüksekliği dahil değil. |
| Mobil RSI çizim alanı | 100 | 100 px | Fiyatla aynı tarih aralığı korunur. |

Webin piyasa yazı rolleri küçük/standart/büyük tercihlerinde sırasıyla 10–11–12 px etiket, 15–16–17 px fiyat ve 10–10–11 px değişim kullanır. Bu roller kök `rem` ölçeğiyle ikinci kez çarpılmaz. Mobil ≤600 px, tablet 601–1023 px ve masaüstü ≥1024 px eşikleri web düzeni içindir. Açık/koyu × beş renk × sekiz malzemenin 80 hesaplanmış CSS durumu ve sistem modunun iki OS görünümü test edilir; gerçek iPhone Safari/PWA doğrulaması ayrı kalır.

## v7.9 ortak tasarım sistemi

- `assets/design-tokens.css`: iOS AppPalette renkleri, boşluk/köşe, yazı/kontrol ölçekleri, yüzey malzemeleri ve grafik paleti. Kullanıcının renk, görünüm ve A−/A+ tercihleri korunur.
- `assets/component-system.css`: kart, kontrol, gezinme, grafik, portföy ve ayar düzenleri. Mobilde ≤600px iki sütun piyasa ve alt gezinme; tablette 601–1023px üç sütun piyasa ve üst sekmeler; masaüstünde ≥1024px dört sütun piyasa ve sol menü.
- `assets/chart-theme.js`: fiyat, RSI, MA, portföy kıyası ve dağılım grafiklerinin ortak renk ve temel çizim ayarları. Mevcut kısa/yatay tarih ekseni, sağ değer ekseni ve eşzamanlı fiyat–RSI incelemesi korunur. Mobil fiyat/RSI çizimleri, kullanıcının gönderdiği ekran ölçülerine yakın kalması için 360/165px'dir.
- Fiyat bilgisi fiyat grafiği kartı içindedir. Portföy seçimi ve işlemleri tek kartta, pozisyon listesi ve ekleme alanı ayrı tek kartta yer alır. Sekme değişiminde mobil/masaüstü etkin gezinme durumu birlikte güncellenir.

## Bulunan farklar ve uygulanan karşılıklar

| Alan | Önceki web | iOS referansı / web değişikliği |
|---|---|---|
| Temel yüzey | Vurgu rengiyle karıştırılan tüm yüzeyler | Nötr AppPalette zeminleri; açık #eef3f8, koyu #101827; kart #fff / #0d1523 |
| Vurgu | Klasik açık modda farklı yeşil | Her iki modda aynı #52d5b1; diğer dört vurgu korunur |
| Mat / İnce Çizgi | Kalın iç sınır, kartlarda renkli şeritler | iOS AppCard gibi 1 px sınır; bu iki seçenek iOS'ta da aynı temel yüzeyi kullanır |
| Hafif Cam | Parlak çizgiler ve güçlü gölge | Saydam yüzey, arka plan bulanıklığı |
| Seramik | Kabartmalı, çok yönlü gölge | Hafif çapraz vurgu geçişi, tek yumuşak gölge |
| Çift Çerçeve | Kalın renkli iç çerçeve | 4 px içeride düşük opaklıklı ince ikinci çerçeve |
| Köşe Işığı / Ton Katmanı | Sağ üst ışık / keskin yatay bant | Sol üstten başlayan yumuşak çapraz geçiş |
| Mikro Doku | 7 px aralıklı sık noktalar | 14 px aralık, 2 px noktalar; açık modda daha düşük opaklık |
| Kart geometrisi | Farklı yarıçaplar, güçlü gölgeler | Ana kart 12 px; pozisyon satırı 10 px; düğme 9 px |
| Marka | 50 px logo, daha büyük boşluk | 42 px logo, 8 px ara, 23 px kalın başlık |
| Yazı ölçeği | Dağınık sabit puntolar | 18 px gövde, 22 px başlık, 15 px kontrol tokenları; A− / A+ tercihi korunur |
| Yenile düğmeleri | Farklı kontrol gölgeleri | Ortak vurgu, 38 px yükseklik, 10 px yatay dolgu |
| Piyasa kartları | Stil seçimine bağlı güçlü şerit | Her stilde 3 px ince vurgu; 8 px kart arası |
| Kazanç/kayıp | Metin altında renkli dolgu ve çerçeve | Sadece semantik renk; vurgu seçimiyle anlamı değişmez |
| Favoriler | Daha geniş aralık, havalanırken büyüme/dönme | 6 px aralık, 42 px logo; sağda seçenek/yıldız; büyüme ve dönüş yok |
| Sıralama | Hareketli DOM yer tutucusu ve uzun yaylanma | Başlangıçta sabit konumlar, 400 ms basılı tutma, 180 ms komşu / 160 ms bırakma; üç listede ortak |
| Sıralama iptali | Eski akışta iptalde bile kayıt riski | Escape, touchcancel veya pointercancel sıralamayı kaydetmez |
| Piyasa düzenleme | Arama altta; sürükleme yok | Arama üstte; mevcut öğeler ve çarpılar; uzun basıp sıralama |
| Alt gezinme | Karakter simgeleri, yüzen çerçeve | Çizgi SVG simgeler, kenardan kenara zemin, 48 px seçili alan |
| Grafik araçları | Tek sırada dört işlem | İki sütun, iki sıra; ayrı tam genişlikte Getir düğmesi |
| Grafik kartları | Açıkta grafikler | Fiyat ve RSI ayrı, başlık/içerik birleşik kartlar |
| Fiyat / RSI | Alan dolgusu, eğri yumuşatma | Dolgusuz doğrusal çizgiler, gizli lejant, sağ değer ekseni ve ortak tarih işaretleri; RSI 70 kırmızı, 30 yeşil |
| MA ve inceleme | Grafik üstünde yüzen düğme | Grafik altında anahtar; yeşil/sarı/kırmızı MA; imleçte tarih çizgisi ve mevcut değer balonu |
| Süre seçimleri | Ekrana göre iki sütun / serbest sarma | Üç sütun kapsül; özel tarih tam genişlik; kıyas sürelerinde aynı düzen |
| Dönem özeti | Masaüstünde dört sütun | İki sütun metrik; turuncudan vurguya geçişli 8 px konum çubuğu |
| Portföy seçimi | Seçici ve kısayollar ayrı | Tek kart; bir satırda üç portföy; uzun adlarda taşmama |
| Pozisyonlar | Koyu düz kart | %23 sınır rengi karışımı; 8×9 px iç boşluk; kırmızı yumuşak silme düğmesi |
| Analiz açma | Kart kenarına yapışık bar | İçeride 32 px, 7 px yarıçaplı çift şevron |
| Karşılaştırma | Mavi ölçüt | Turuncu ölçüt; portföy vurgu rengi; hesaplar değişmedi |
| Görünüm tercihleri | Büyük renk/stil düğme ızgarası | Seçili değerli açılır menüler; Sistem/Koyu/Açık bölümlü seçim |
| Para birimi | Açılır kutu | Yerel / TRY / USD bölümlü seçim; mevcut değişiklik/yedek hattı |
| Alarm ayarları | Küçük onay kutusu | 46×28 px anahtar; açıklamalar ve denetim sıklığı |
| Ayar grupları | Sayı biçimi ve alarm kısayolu ayrı | Sayı biçimi yenileme kartında; alarm kısayolu alarm kartında |
| İletişim pencereleri | Ortada masaüstü kutusu | Mobilde alttan açılan, tutamaçlı ve güvenli alanlı panel; masaüstünde ortada |
| Hareket azaltma | Bazı JavaScript animasyonları istisna | Yeni sürükleme ve CSS geçişleri sistem tercihini izler |

## Korunanlar ve platform farkları

- Veri servisleri, finans hesapları, yedek şeması, hesap senkronizasyonu ve kullanıcı kayıtları değiştirilmedi.
- Webin masaüstü sol menüsü, CSV/PNG indirme, dosya seçimi, tanılama ve önbellek araçları korunur. iOS'ta olmayan yararlı web araçları kaldırılmaz.
- SwiftUI ile tarayıcı farklı yazı/çizim motorları kullanır. Sistem menüsü, tarih/dosya seçici, paylaşım ekranı, klavye ve `ultraThinMaterial` piksel düzeyinde aynı değildir. Web eşdeğerleri uygulanmıştır.
- Webde her vurgu rengi için okunabilir seçili metin rengi korunur; düşük kontrastlı native rengi körlemesine kopyalamaz.
- Çevrimdışı görsel testlerde fiyat ve portföyler sentetiktir. Logolar dış ağdan alınmaz. Gerçek finans kaynağı, bulut hesabı ve fiziksel iPhone Safari/PWA bu testlerin kapsamı değildir.
- iOS kaynakları ve imzalama ayarları bu görevde değiştirilmedi. Önceden kalan iOS değişiklikleri korunmuştur.

## Doğrulama

30 Eylül son durumu: aşağıdaki üç test başarılı. Açılır menülerin cam stilde diğer kartların arkasına düşmesini önleyen önceki düzeltme korunur.

- `node tests/regression.test.js`: finans/veri/sözdizimi regresyonları.
- `node tests/appearance.browser.cjs`: 3 mod × 5 renk × 8 yüzey; taşma, geometri, kalıcılık, yedek geri yükleme.
- `node tests/ios-visual.browser.cjs`: izole Chromium; dört ekran, açık/koyu, 320–1440 px, seçimler, yeniden yükleme, üç listeyi sürükleme, iptal, dokunmatik dokunma/sürükleme, MA ve grafik balonu, hareket azaltma.
- Ortamda hazır tarayıcı CLI bulunmadığından mevcut Playwright paketi ve geçici test tarayıcısı kullanıldı; uygulama bağımlılığı eklenmedi.
- Windows tasarım testinin görselleri `C:/Users/YigitOzer/AppData/Local/Temp/ozer-v79-design-parity` altında; örnek veri içerir. Mac'te native UI testi ve dört ekran görüntüsü ayrıca alınmıştır; bu Windows çalışma alanında native kaynak dosyaları yoktur.
- Fiziksel iPhone Safari/PWA ve canlı veri sağlayıcıları bu çevrimdışı testlerin kapsamında değildir.
