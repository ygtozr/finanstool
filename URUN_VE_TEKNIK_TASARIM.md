# Özer Finans — Ürün ve Teknik Tasarım Belgesi

**Belge sürümü:** 5.8 Önizleme
**Uygulama sürümü:** v5.8 Önizleme
**Durum:** Kullanıcı tarafından onaylandı
**Canlı adres:** https://finanstool.vercel.app
**Kaynak depo:** https://github.com/ygtozr/finanstool
**Son güncelleme:** 24 Ağustos 2026

Bu belge Özer Finans uygulamasının amacını, kullanıcı tercihlerini, mevcut işlevlerini, görsel tasarımını, veri modelini ve teknik mimarisini tek yerde tanımlar. Hedefi, mevcut kaynak kod görülmeden uygulama sıfırdan geliştirilse bile aynı davranışın ve mümkün olduğunca aynı görünümün yeniden üretilebilmesidir.

## 1. Ürün amacı

Özer Finans; hisse senedi, ETF, endeks, emtia ve döviz verilerini tek ekranda izlemek, teknik göstergeleri incelemek ve kullanıcının kişisel portföyünü takip etmek için geliştirilmiş Türkçe bir finans uygulamasıdır.

Temel hedefler:

- Sembol veya şirket adıyla hızlı arama yapmak.
- Fiyat geçmişini seçilen zaman aralığında anlaşılır bir grafikle göstermek.
- Portföy performansını seçilen piyasa ölçütleriyle, para birimi farklarını doğru ele alarak karşılaştırmak.
- Favorileri, fiyat alarmlarını ve portföyü tarayıcıda kalıcı olarak saklamak.
- Piyasa özeti, portföy dağılımı ve performans karşılaştırmasını tek uygulamada sunmak.
- Masaüstü ve mobil ekranlarda aynı işlevlerin erişilebilir olmasını sağlamak.
- Kurulum gerektirmeden web üzerinden çalışmak ve GitHub–Vercel akışıyla yayımlanmak.

Uygulama bilgilendirme ve kişisel takip aracıdır; yatırım tavsiyesi vermez ve aracı kurum işlemi gerçekleştirmez.

## 2. Sabit ürün tercihleri ve çalışma kuralları

Kullanıcı tarafından belirlenen ve sonraki geliştirmelerde korunması gereken tercihler şunlardır:

1. Bütün kalıcı kod değişiklikleri GitHub deposu üzerinden yürütülür.
2. Kullanıcı tarafından onaylanmayan çalışma, kalıcı bir sürüm olarak yayımlanmaz.
3. Her onaylı sürüm GitHub içinde ayrı bir arşiv klasöründe saklanır.
4. Bu belge her onaylı sürümde güncellenir; hem depo kökünde güncel kopya hem de ilgili sürümün arşivinde değişmez kopya bulunur.
5. Özellikler aşamalar halinde geliştirilir; her aşamanın ardından kullanıcı kontrolü ve onayı beklenir.
6. Arayüz dili Türkçedir.
7. Kullanıcı tercihleri ve kişisel veriler uygulama kapatıldığında kaybolmamalıdır.
8. Fiyatlar otomatik yenilenirken kartların, logoların ve metin yerleşiminin zıplamaması gerekir; yalnızca değişen sayısal alanlar güncellenir.
9. Özet, Grafik Ve Teknik Analiz, Portföy ve Diğer bağımsız sabit sayfalardır; mobilde alt gezinme, masaüstünde sol menü kullanılır.
10. Karma para birimli karşılaştırmalarda yanıltıcı eksen kullanılmaz; seriler USD bazında ortaklaştırılır.

### 2.1 Sürümleme ve arşiv standardı

- Güncel onaylı sürüm: **v5.7**.
- İncelenen sürüm: **v5.8 Önizleme**.
- Sonraki özellik sürümü, kullanıcı farklı bir ad vermedikçe **v5.8** olur.
- Depo kökü her zaman canlı sürümü temsil eder.
- Arşiv yolu: `archive/vX/` veya `archive/vX.Y/`.
- Bir sürüm onaylandığında en az şu dosyalar arşivlenir:
  - `index.html`
  - `README.md`
  - `api/price.js`
  - `api/search.js`
  - `api/fundamentals.js`
  - `api/dividends.js`
  - `api/dividend-history.js`
  - `api/gold.js`
  - `api/logo.js`
  - `tests/regression.test.js`
  - `URUN_VE_TEKNIK_TASARIM.md`
- Arşiv kopyaları geçmiş sürümü temsil eder; daha sonraki geliştirmelerde geriye dönük değiştirilmez.

## 3. Kullanıcı deneyimi ve bilgi mimarisi

### 3.1 Ana gezinme

Uygulamada dört bağımsız ana sayfa bulunur:

- **Özet:** Piyasa Özeti ilk sırada, Favoriler hemen altında gösterilir. Mobilde piyasa kartları her satırda iki adet olacak şekilde aşağı doğru devam eder.
- **Grafik Ve Teknik Analiz:** Arama, teknik analiz seçenekleri, fiyat grafiği, RSI ve dönem seçenekleri doğrudan görünür.
- **Portföy:** Aktif portföy seçici, toplam portföy, Portföy Özet Analizi, hisseler, dağılım, performans karşılaştırması ve Temettü Takvimi sırasıyla gösterilir. Her bağımsız portföyün hisse ve nakit kayıtları ayrıdır.
- **Diğer:** Tema, otomatik yenileme, varsayılan grafik dönemi, alarm denetimi, veri yedekleme, yardım ve sürüm bilgilerini içerir.

Uygulama her yeni açılışta varsayılan olarak **Özet** sayfasını gösterir. Önceki oturumda açık kalan Grafik veya Portföy görünümü açılış tercihini değiştirmez.

Masaüstünde 216 px genişliğinde sabit sol menü; mobilde Özet, Grafik, Portföy ve Diğer seçeneklerinden oluşan sabit alt gezinme kullanılır. Veri yedekleme ve üç seçenekli tema kontrolü, açılır pencere yerine sabit Diğer sayfasında sunulur.

### 3.2 Genel görsel dil

Arayüz koyu tema öncelikli, finans terminali hissi veren, sade kart tabanlı bir tasarımdır. Yuvarlatılmış paneller, ince sınırlar, okunaklı büyük fiyatlar ve turkuaz vurgu rengi kullanılır.

Marka kimliği beyaz, yuvarlatılmış kare zemin üzerindeki koyu ÖF monogramı ve yeşil onay işaretinden oluşur. Özer Finans marka satırı dört ana sayfanın üstünde ortalanır; mobilde logo `50px` boyutundadır. Sürüm bilgisi çerçevesiz, yaklaşık `9.8px`, ikincil renkte ve marka satırının sağ altına hizalıdır.

Yazı tipi yığını:

```css
font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
```

Ana renk değişkenleri:

| Rol | Koyu tema | Açık tema |
|---|---:|---:|
| Sayfa zemini | `#101827` | `#eef3f8` |
| Panel zemini | `#192337` | `#ffffff` |
| Sınır/ayraç | `#2b3a55` | `#cbd5e1` |
| Ana metin | `#eef3fb` | `#172033` |
| İkincil metin | `#aebbd0` | `#5f6f86` |
| Olumlu/vurgu | `#52d5b1` | `#0f9f7f` |
| Olumsuz/tehlike | `#ff8f9c` | `#c9344f` |

Temel ölçüler:

- Ana içerik genişliği masaüstünde yaklaşık `min(1440px, 100%)`; içerik alanı sol menünün yanında akışkan genişliktedir.
- Büyük panel köşe yarıçapı: yaklaşık `18px`.
- Masaüstünde 216 px sol menü ve `minmax(0, 1fr)` içerik sütunu bulunur. Özet sayfasında Piyasa Özeti ve Favoriler dikey sıralanır.
- Kartlar ve düğmeler yeterli dokunma alanı bırakmalı, dar ekranda taşmamalıdır.
- Başlıklarda her anlamlı kelimenin ilk harfi büyük yazılır: “Hisse Fiyat Grafiği”, “Piyasa Özeti”, “Portföy Özet Analizi” gibi.
- Piyasa Özeti, Favoriler, Grafik Ve Teknik Analiz ve Portföyüm başlıkları `1.17rem` (`18.72px`) ortak boyut kullanır.
- Başlıkların altındaki açıklama cümleleri kaldırılmıştır; ekran gereksiz metinle kalabalıklaştırılmaz.

### 3.3 Tema davranışı

- Sağ üstte güneş/ay anlamında bir tema ikonu bulunur.
- Koyu ve açık tema arasında anında geçiş yapar.
- Tercih `localStorage` içinde saklanır.
- Açık temada seçili zaman aralığı, yenile düğmesi ve diğer aktif kontroller yeterli kontrastla açıkça görünmelidir.

### 3.4 Mobil davranış

- Mobilde Özet, Grafik, Portföy ve Diğer seçeneklerinden oluşan sabit alt gezinme bulunur.
- Özet sayfasında Piyasa Özeti kartları iki sütunda gösterilir; Favoriler bütün piyasa kartlarının altında yer alır.
- Portföy kartları yaklaşık 760 px altında iki, 500 px altında tek sütuna iner.
- Arama önerileri, iletişim kutuları, grafikler ve tarih alanı ekran genişliğine sığar.
- Dokunmatik kullanımda ikonlar birbirine çok yakın konumlandırılmaz.
- iOS'ta Ana Ekrana Ekle ile bağımsız uygulama görünümünde alt gezinme ekranın fiziksel altına sabit kalır; sayfa kaydırma veya dinamik viewport değişimi sırasında içeriğin ortasına sıçramaz.
- Çentik ve ana ekran göstergesi için güvenli alan, menünün tamamını yukarı taşımak yerine menünün iç alt dolgusuna eklenir.
- Mobil gövde `100svh` ve `100dvh` ile dinamik ekran yüksekliğini izler; içerik alt menünün arkasında kalmaması için güvenli alanlı alt boşluk bırakır.

## 4. Özet ve Grafik Sayfaları

### 4.1 Piyasa Özeti

Varsayılan gösterim sırası:

1. USD/TRY
2. EUR/TRY
3. GBP/TRY
4. EUR/USD
5. S&P 500
6. Nasdaq
7. BIST 100
8. Bitcoin

v4.0 güncellemesi ilk açıldığında uygulama, önceki sürümden kalmış eksik veya farklı Piyasa Özeti listesini bir defaya mahsus bu sekiz varsayılana taşır. Taşıma tamamlandığında sürümlü bir yerel işaret yazılır; sonraki açılışlarda kullanıcının dişli düğmesiyle yaptığı özelleştirmeler korunur.

Her kart güncel değeri ve uygun olduğunda değişim bilgisini gösterir. Bölümde:

- Saniye dahil “Son Güncelleme” zamanı bulunur.
- Yenile düğmesi vardır.
- Dişli düğmesi “Piyasa Özetini Düzenle” penceresini açar.
- Düzenleme ekranında mevcut varlıklar satır halinde listelenir ve satır sonundaki çarpıyla kaldırılabilir.
- En alttaki arama alanından yeni piyasa verisi eklenebilir.
- Seçim ve sıra tarayıcıda kalıcıdır.
- Veriler otomatik olarak 15 saniyede bir yenilenir.

Piyasa Özeti ve Favoriler yenile düğmeleri senkron çalışır. Bunlardan herhangi birine basıldığında iki bölüm de aynı yenileme işlemini ve aynı güncelleme zamanını kullanır.

### 4.2 Ana arama çubuğu

- Alan hem sembol hem şirket/fon adı içinde arama yapar.
- Yazılan harflere göre en fazla beş olası seçenek gösterilir.
- BIST sembolleri `.IS` uzantısıyla desteklenir; örneğin `THYAO.IS`.
- ABD sembolleri doğrudan kullanılır; örneğin `AAPL`, `MSFT`, `GLD`.
- Bir öneriye tıklamak veya geçerli sembolü göndermek ana grafiği açar.
- Arama alanının yanında içi boş/dolu yıldız bulunur.
- Yıldız seçili sembolü favorilere ekler veya çıkarır.
- Grafik karşılaştırma ikonu ve ana grafik çoklu karşılaştırma akışı kaldırılmıştır.

### 4.3 Fiyat grafiği

Grafik Ve Teknik Analiz sayfası seçilen varlığın fiyat geçmişini gösterir. Arama, gösterge kontrolleri, grafik ve dönem seçenekleri sayfa açıldığında görünürdür.

Kontrol araç çubuğu **Gelişmiş Arama**, **Fiyat Alarmı**, **CSV İndir** ve **PNG İndir** işlemlerini içerir. MA50/100/200 küçük bir kontrol olarak fiyat grafiğinin içine gömülüdür; RSI ayrıca düğme gerektirmeden sürekli açıktır.

Zaman aralığı seçenekleri:

- 1 Hafta
- 1 Ay
- 3 Ay
- 6 Ay
- 1 Yıl
- 5 Yıl
- Şu Tarihten İtibaren

Zaman aralığı düğmeleri grafik sayfasında Dönem Özeti kartının hemen üzerinde yer alır.

Tarih alanı davranışı:

- Kullanıcı dostu `GG.AA.YYYY` biçimi kullanılır.
- Tarih seçildiğinde kontrolün üzerinde seçilen tarihten itibaren olduğu belirtilir.
- Başlangıç tarihi gelecekte olamaz.
- Grafik başlığı/değişim metni sabit “5 aylık değişim” yerine seçili döneme göre hesaplanır.

Grafik kuralları:

- X ekseninde yıl bilgisi gerektiğinde açıkça görünür.
- Tek varlıkta fiyat ekseni varlığın doğal para birimindedir.
- Fiyat grafiği aynı anda tek seçili varlığı gösterir; nokta balonunda uzun ad yerine yalnız finans kodu yazılır.
- Grafik, otomatik yenilemede yeniden kurulup yanıp sönmemeli; mümkün olduğunda yalnızca veri kümeleri güncellenmelidir.

Grafiğin altında **Dönem Özeti** kartı bulunur. Kartta Son Kapanış, Dönem Düşük ve Dönem Yüksek değerleri gösterilir; her değerin gerçekleştiği tarih aynı satırda küçük puntoyla yazılır. Düşük–yüksek aralığı üzerindeki konum çubuğu, güncel fiyatın seçili dönem içindeki yüzdesel konumunu sürekli görünür kılar.

### 4.4 Favoriler

Favoriler sağ sütunda bağımsız bir paneldir. Veriler uygulama kapatıldığında silinmez.

Her favori kartı:

- Solda yuvarlak alanı dolduran şirket/fon logosu; logo yoksa tutarlı bir sembol rozeti gösterir.
- Sembolü büyük, varlık adını daha küçük gösterir.
- Sağda güncel fiyatı; altında günlük net ve yüzde değişimi gösterir.
- Favoriden çıkarma için yıldız kontrolü içerir.
- Yıldızın yanında hızlı işlem menüsü bulunur; bu menü grafik açma, alarm kurma ve portföye ekleme işlemlerine erişim sağlar.
- Favori kartına dokunulduğunda fiyat, günlük değişim, piyasa değeri ve uygun ürünlerde F/K gibi sade ekonomik göstergeleri sunan alt panel açılır.

Favoriler panelinde Piyasa Özeti ile aynı biçimde saniyeli **Son Güncelleme** bilgisi ve senkron yenile düğmesi bulunur. Bu başlık zamanı yenileme işleminin tamamlandığı anı gösterir. Ayrıca her favori kartında, fiyatın veri sağlayıcıda oluştuğu gerçek zaman küçük puntoyla ayrı ayrı yazılır; piyasa kapalıysa son işlem kaydının tarihi ve saati korunur.

Yenileme sırasında kart DOM'u, logo ve sabit metinler yeniden yaratılmaz; sadece fiyat ve değişim rakamları güncellenir. Böylece kartlar hareket etmez ve logolar tekrar yüklenmez.

### 4.5 Teknik göstergeler

Gösterge adları ve düğmeleri sola dayalı, birbirine bitişik bir kontrol grubu gibi görünür.

#### MA50/100/200

- Tek düğmeyle üç hareketli ortalama birlikte açılır/kapanır.
- MA50: yeşil.
- MA100: sarı.
- MA200: kırmızı.
- Ortalamalar ana fiyat grafiğinin içinde çizilir.
- Gösterge açılırken ana fiyat serisi kaybolmaz.
- Uzun dönem ortalamalarını hesaplamak için ek geçmiş veri gerekirse kullanıcıya gösterilen başlangıç aralığından önceki veriler hesaplamaya dahil edilir, fakat grafik seçilen aralıkla sınırlı kalır.

#### RSI

- RSI ana grafiğin içinde değil, ana fiyat grafiğine bitişik ve hemen altında bağımsız bir grafik olarak çizilir.
- Zaman aralığı ana grafikle birebir aynıdır.
- RSI serisi ana fiyat serisiyle aynı renktedir.
- Yaygın 30 ve 70 eşikleri yardımcı çizgilerle gösterilir.
- RSI sürekli açıktır; ayrı bir açma/kapatma düğmesi bulunmaz.

### 4.6 Gelişmiş Arama

Gelişmiş arama ekranında:

- Sembol veya ad sorgusu,
- Piyasa filtresi: Tümü, BIST, ABD,
- Tür filtresi: Tümü, Hisse, ETF

bulunur. Sonuçtan seçilen varlık ana grafiğe aktarılır.

### 4.7 Fiyat Alarmı

Alarm düğmesi bir iletişim kutusu açar ve şu bilgileri ister:

- Sembol,
- Koşul: hedefin üstüne çıkınca veya altına inince,
- Hedef fiyat.

Alarmlar tarayıcıda saklanır ve uygulama açıkken yaklaşık dakikada bir kontrol edilir. Bildirim izni varsa tarayıcı bildirimi, yoksa uygulama içi uyarı kullanılır. Tetiklenen alarm tekrar tekrar bildirim üretmemelidir.

**Mevcut sınır:** Uygulama kapalıyken sunucu tabanlı Web Push veya e-posta alarmı gönderilmez. Kullanıcı bu özelliğin şimdilik değiştirilmemesini istemiştir.

### 4.8 Veri dışa aktarma

- **CSV İndir:** Seçili grafik serilerinin tarih ve değerlerini dışarı aktarır.
- **PNG İndir:** Kullanıcının gördüğü ana grafiği eksiksiz indirir; RSI açıksa ana grafik ve RSI tek bir görselde uygun aralıkla birleştirilir.
- PNG üretimi boş veya kırpılmış görsel oluşturmamalıdır.

## 5. Portföy sekmesi

### 5.1 Portföy başlığı

“Portföyüm” başlığının hemen altında:

1. Büyük puntoda toplam güncel portföy büyüklüğü,
2. Daha küçük puntoda bugünkü net değişim ve yüzde değişim

gösterilir. Günlük değişim mümkün olan son iki geçerli kapanış kullanılarak hesaplanır.

### 5.2 Varlık ekleme

- Portföyde ana ekrandakine benzer sembol/ad arama alanı bulunur.
- `+` düğmesi seçilen varlık için ekleme penceresini açar.
- Kullanıcı adet ve birim alış maliyetini girer.
- Aynı sembol tekrar eklenirse yeni miktar toplam miktara eklenir ve birim maliyet ağırlıklı ortalamayla güncellenir.
- Geçersiz, negatif veya sayısal olmayan girdiler kabul edilmez.
- Portföye varlık arama ve ekleme alanı, mevcut portföy kartlarının en altındaki son varlıktan sonra konumlanır.

Ağırlıklı maliyet formülü:

```text
yeni birim maliyet =
((eski adet × eski maliyet) + (eklenen adet × eklenen maliyet))
÷ (eski adet + eklenen adet)
```

### 5.3 Kompakt portföy kartları

Masaüstünde kartlar üç sütunlu kompakt yapıda gösterilir. Her kart iki satır kullanır ve mobil ekranda bilgi kaybetmeden daralır.

Her kartta:

- Yuvarlak logo/rozet, sembol ve varlık adı,
- Kaldırma düğmesi,
- Güncel toplam değer,
- Net kâr/zarar,
- Yüzde kâr/zarar,
- Adet ve birim maliyet

bulunur. Kartlar gereksiz dikey boşluk içermez.

### 5.3.1 Nakit bakiyeleri

Portföye TRY, USD, EUR ve GBP cinsinden nakit eklenebilir. Aynı para birimi yeniden eklenirse bakiye artırılır. Nakit; toplam değer, varlık dağılımı, para birimi dağılımı ve performans hesaplarına dahil edilir.

### 5.4 Portföy Özet Analizi

Özet tabloda en az şu değerler bulunur:

- Toplam maliyet,
- Güncel toplam değer,
- Net kâr/zarar,
- Yüzde kâr/zarar,
- Hafta başından itibaren net kâr/zarar,
- Hafta başından itibaren yüzde kâr/zarar.

Temel hesaplar:

```text
maliyet = adet × birim alış maliyeti
güncel değer = adet × güncel fiyat
net kâr/zarar = güncel değer − maliyet
yüzde kâr/zarar = (net kâr/zarar ÷ maliyet) × 100
```

Haftalık değişim, haftanın ilk erişilebilir geçerli kapanışı ile güncel değer arasında hesaplanır.

### 5.5 Portföy Dağılımı

İki halka grafik bulunur:

- **Varlık Bazında:** Her varlığın portföy içindeki ağırlığı.
- **Para Birimi Bazında:** USD, TRY ve bulunan diğer para birimlerine göre dağılım.

Grafikler masaüstü ve mobilde yan yana duran mini halka kartlarıdır. Halka merkezinde en büyük payın yüzdesi ve ilgili ürün/para birimi adı bulunur. İlk üç kalem sürekli görünür; diğerleri **Tümünü Göster** ile açılıp **Daralt** ile kapanır. Her öğe için renk işareti, ad, dönüştürülmüş değer ve yüzde payı listelenir.

Portföy değerleri otomatik yenilenirken mevcut halka grafik nesneleri korunur ve veriler animasyonsuz güncellenir. Yenileme sayfayı dağılım bölümüne kaydırmaz, açık konumu veya kart düzenini değiştirmez.

Karma para birimli portföyde toplamlar ortak hesap birimi olarak USD'ye çevrilir. Tek para birimli portföy doğal para biriminde gösterilebilir.

### 5.6 Performans Karşılaştırması

Portföy getirisi aşağıdaki standart ölçütlerle kıyaslanabilir:

- S&P 500 (`^GSPC`)
- Nasdaq (`^IXIC`)
- BIST 100 (`XU100.IS`)
- Altın (`GLD`)
- Aramayla seçilen özel bir varlık

Bitcoin standart ölçüt listesinden kaldırılmıştır.

Karşılaştırma dönemleri:

- 1 Hafta
- 1 Ay
- 3 Ay
- 6 Ay
- 1 Yıl
- 5 Yıl
- Şu Tarihten İtibaren

Portföy ve kıyaslama serileri başlangıç gününde `%0` olacak şekilde normalize edilir. Sonuç alanındaki **Portföy Getirisi**, **Ölçüt Getirisi** ve **Fark** bilgileri tek satırda üç eşit, kompakt kutu halinde yan yana gösterilir. Para birimleri farklıysa hesap USD bazında yapılır.

### 5.7 Temettü Takvimi

Portföydeki varlıklar için sağlayıcının açıkladığı yaklaşan hak kullanım veya ödeme tarihleri yakından uzağa sıralanır ve en fazla beş satır gösterilir. Veri bulunamadığında açık boş durum metni kullanılır; tarih kesin bir temettü taahhüdü olarak yorumlanmaz.

## 6. Veri Yedekleme

Kullanıcı verileri JSON dosyası olarak dışa aktarılabilir ve daha sonra geri yüklenebilir.

Yedek kapsamı:

- Favoriler,
- Bütün bağımsız portföyler; her birinin hisse ve çoklu para birimli nakit kayıtları, pozisyon alım tarihi, maliyet para birimi, temel adedi ve temettü yeniden yatırım ayarları,
- Fiyat alarmları,
- Piyasa Özeti öğeleri,
- Açık/Koyu/Sistem tema tercihi,
- Otomatik yenileme süresi,
- Varsayılan grafik dönemi,
- Alarm denetimi tercihi.

Şema sürümü 2 için özet örnek:

```json
{
  "schemaVersion": 2,
  "appVersion": "5.7",
  "exportedAt": "2026-08-08T00:00:00.000Z",
  "data": {
    "favorites": [
      { "symbol": "AAPL", "name": "Apple Inc." }
    ],
    "portfolios": [
      {
        "id": "portfolio-main",
        "name": "Portföyüm",
        "positions": [
          {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "quantity": 1,
            "baseQuantity": 1,
            "unitCost": 100,
            "costCurrency": "USD",
            "purchaseDate": "2026-01-15",
            "dripEnabled": true,
            "dripTaxRate": 15,
            "dripFractional": true
          }
        ],
        "cashBalances": [
          { "currency": "USD", "amount": 100 }
        ]
      }
    ],
    "activePortfolioId": "portfolio-main",
    "alarms": [
      {
        "id": "benzersiz-kimlik",
        "symbol": "AAPL",
        "target": 200,
        "condition": "above",
        "triggered": false
      }
    ],
    "marketItems": [
      { "symbol": "TRY=X", "label": "USD/TRY" }
    ],
    "theme": "system",
    "refreshInterval": 15000,
    "defaultRange": "6mo",
    "alarmsEnabled": true
  }
}
```

Geri yükleme seçenekleri:

- **Birleştir:** Mevcut portföyleri korur ve yeni portföyleri ekler. Aynı portföy kimliği iki tarafta da varsa portföyün hisseleri, nakdi, maliyetleri, tarihleri ve temettü ayarları yedekteki kayıtla geri yüklenir.
- **Değiştir:** Mevcut yerel veriyi yedek içeriğiyle değiştirir.

Yüklenen dosya JSON olarak doğrulanır, beklenmeyen alanlar ayıklanır ve yaklaşık 1 MB dosya sınırı uygulanır. Şema v1 tek portföylü yedekleri `Portföyüm` kaydına dönüştürülerek geriye uyumlu biçimde desteklenir.

## 7. Teknik mimari
…497 tokens truncated…aktır.
- Desteklenen ABD hisse/ETF'lerinde Nasdaq geçmiş fiyat uç noktası yedek kaynaktır.
- İkinci Yahoo alan adı ek yedek olarak kullanılır.
- Nasdaq cevabı istemcinin beklediği Yahoo-benzeri grafik yapısına dönüştürülür.
- Zaman damgaları ve kapanış değerleri eşleştirilir; boş fiyatlar ayıklanır.
- Para birimi, sembol, piyasa zamanı ve güncel fiyat gibi meta bilgiler korunur.
- Temettü ve bölünme olayları mümkün olduğunda cevaba dahil edilir.
- Yanıtlar eski fiyat göstermemek için `no-store` yaklaşımıyla gönderilir.

### 7.3 Sağlayıcı stratejisi

Bir sağlayıcı CORS, oran sınırı veya geçici erişim hatası verdiğinde uygulama tamamen bozulmamalıdır. Yedek sırası merkezi API uçlarında uygulanır; tarayıcı doğrudan üçüncü taraf finans servisine bağlanmaz.

Temel ilke:

```text
Birincil Yahoo → destekleniyorsa Nasdaq → ikincil Yahoo → açıklayıcı hata
```

Sağlayıcı yanıt biçimleri tek bir iç modele dönüştürülmelidir. Böylece grafik, favoriler ve portföy kodu sağlayıcıya özel ayrıntılar bilmeden çalışır.

### 7.4 İstemci durumu ve kalıcılık

Yerel saklama anahtarları:

| Anahtar | İçerik |
|---|---|
| `finans-grafigi-theme` | `light` veya `dark` |
| `finans-grafigi-favorites` | Favori sembol ve adları |
| `finans-grafigi-alarms` | Fiyat alarmı kayıtları |
| `finans-grafigi-portfolios-v2` | Bağımsız portföy kimlikleri, adları, pozisyonları ve nakit bakiyeleri |
| `finans-grafigi-active-portfolio` | Son seçilen aktif portföy kimliği |
| `finans-grafigi-portfolio` | v5.6 geriye uyumluluğu için aktif portföyün eski biçimli kopyası |
| `finans-grafigi-cash-balances` | v5.6 geriye uyumluluğu için aktif nakit bakiyelerinin eski biçimli kopyası |
| `finans-grafigi-market-items` | Özelleştirilmiş piyasa kartları |
| `finans-grafigi-market-defaults-version` | Sekiz sabit piyasa değerinin bir defalık v4.0 taşıma işareti |
| `finans-grafigi-portfolio-benchmark` | Seçili karşılaştırma ölçütü |

Kişisel veriler varsayılan olarak sadece kullanıcının tarayıcısında kalır. Tarayıcı verileri temizlenirse JSON yedeği yoksa geri getirilemez.

### 7.5 Zamanlayıcılar ve yenileme

| İşlem | Aralık |
|---|---:|
| Piyasa Özeti, Favoriler, açık grafik ve açık Portföy | Kullanıcı seçimine göre 5, 15, 30 veya 60 saniye; istenirse kapalı |
| Fiyat alarmlarını kontrol | Alarm denetimi açıksa 60 saniye |

Yenileme çağrıları üst üste binmemeli; önceki istek sürerken gereksiz yeni istek başlatılmamalıdır. Geç gelen eski yanıt, daha yeni seçimin grafiğini ezmemelidir.

## 8. Hesaplama ve veri birleştirme kuralları

### 8.1 Para birimi dönüşümü

- Aynı para birimindeki tek grafik doğal fiyatıyla gösterilir.
- Portföy ve karşılaştırma ölçütü farklı para birimlerindeyse iki performans serisi de ilgili tarihin mümkün olan en yakın kuruyla USD'ye çevrilir.
- TRY fiyatlı varlık için genel dönüşüm `TRY fiyat ÷ USDTRY` şeklindedir.
- Eksik günlerde gelecekteki kur kullanılmamalı; aynı gün veya önceki en yakın geçerli değer tercih edilmelidir.
- Grafik etiketi, eksen başlığı ve araç ipucu hesap birimini açıkça belirtir.

### 8.2 Portföy performans karşılaştırması

- Seriler aynı görünür tarih penceresine kırpılır.
- Bir varlığın tatil günü diğer varlığın serisini silmez.
- Tarihler doğrudan dizi indeksiyle değil tarih anahtarıyla eşleştirilir.
- Bir seride son gün verisi yoksa diğer serinin güncel verisi kesilmez.
- Portföy ve ölçüt serileri başlangıca göre yüzde normalize değerler kullanır.

### 8.3 Değişim hesapları

- Dönemsel değişim: son geçerli kapanış ile seçilen dönemin ilk geçerli kapanışı.
- Günlük değişim: son iki geçerli kapanış.
- Yüzde hesaplarında sıfıra bölme engellenir.
- Sayı biçimi Türkçe yerelleştirmeye uygun virgüllü ondalıkla gösterilir; sembolün para birimi korunur.

## 9. Hata yönetimi ve durumlar

Her veri alanı en az şu durumları ayırt etmelidir:

- Başlangıç/boş durum,
- Yükleniyor,
- Başarılı,
- Veri bulunamadı,
- Ağ veya sağlayıcı hatası,
- Kısmi başarı/yedek sağlayıcı kullanımı.

Hata mesajları kullanıcıya eylem önerir. Örnek:

- “Bu sembol için veri bulunamadı. Kodu ve piyasa uzantısını kontrol edin.”
- “Fiyat servisine şu anda ulaşılamıyor. Biraz sonra yeniden deneyin.”
- “Karşılaştırma verisi alınamadı; portföy bilgileri gösterilmeye devam ediyor.”

Bir yardımcı özellikteki hata ana grafiği veya mevcut başarılı veriyi silmemelidir. JavaScript değişkenleri kullanılmadan önce tanımlanmalı; daha önce karşılaşılan `compareData`, `lastPrices` benzeri çalışma zamanı hataları regresyon testinde özellikle kontrol edilmelidir.

## 10. Güvenlik ve gizlilik

- Sembol ve sorgu parametreleri sunucuda doğrulanır ve izin verilen karakterlerle sınırlandırılır.
- Dış servis yanıtları güvenilmez veri kabul edilerek normalize edilir.
- Kullanıcı tarafından gelen adlar HTML olarak enjekte edilmez; metin olarak yazılır.
- JSON geri yükleme boyutu ve şeması doğrulanır.
- API anahtarı gerekirse istemci koduna yazılmaz; Vercel ortam değişkeninde tutulur.
- Portföy ve favoriler sunucuya kalıcı olarak kaydedilmez; fiyat sorgusu için sadece gerekli semboller API'ye gider.
- Bu uygulamada giriş hesabı bulunmadığından cihazlar arası otomatik senkronizasyon yoktur.

## 11. Erişilebilirlik

- Yalnız ikon içeren düğmelerde Türkçe `aria-label` veya görünür ipucu bulunur.
- Klavyeyle sekmeler, arama önerileri, iletişim kutuları ve düğmeler kullanılabilir.
- İletişim kutusu açıldığında odak içine alınır; kapandığında çağıran kontrole döner.
- Seçili durum yalnız renkle anlatılmaz; doluluk, sınır veya ikon durumu da değişir.
- Açık ve koyu temada metin/sınır kontrastı korunur.
- Grafik bilgileri yalnız araç ipucuna bırakılmaz; portföy dağılımında kalıcı metin özeti bulunur.

## 12. Yayınlama mimarisi

1. Onaylanan değişiklikler GitHub `main` dalına eklenir.
2. Vercel bağlı depodan otomatik üretim/yayın yapar.
3. Canlı adres `https://finanstool.vercel.app` üzerinden doğrulanır.
4. GitHub Pages iş akışı etkinse ayrıca e-posta üretebilir; ana canlı ortam Vercel'dir.
5. Yayın öncesinde mevcut onaylı sürümün arşivi ve bu belgenin sürüm kopyası doğrulanır.

Bir sürüm yayımlandıktan sonra en az şu kontroller yapılır:

- Canlı sayfa yeni sürüm başlığını gösteriyor mu?
- `/api/search` geçerli sonuç veriyor mu?
- `/api/price` ABD ve BIST örneklerinde veri veriyor mu?
- Mobil ve masaüstü görünüm açılıyor mu?
- Favori/portföy verileri sayfa yenilemesinden sonra korunuyor mu?
- Eski önbellek yüzünden önceki arayüz görünüyorsa önbellek kırıcı sürüm parametresi veya uygun cache başlıkları çalışıyor mu?

## 13. Güncel sürümün gelişim özeti

Mevcut ürün; ilk basit “sembol gir, son ayları çiz” aracından aşağıdaki doğrulanmış aşamalarla genişlemiştir:

- Web ve masaüstü denemeleri, veri sağlayıcı/CORS sorunlarına karşı sunucu uçları.
- Zaman aralığı kontrolleri, kolay tarih girişi, dönemsel değişim ve yıllı X ekseni.
- Kalıcı Favoriler, fiyat/kur dönüşümü ve portföy ölçüt karşılaştırmasının temelleri.
- MA50/100/200 ve bağımsız RSI grafiği.
- Sabit Ana Sayfa/Portföy sekmeleri, kompakt portföy kartları ve temettü alanı.
- Piyasa Özeti özelleştirme, senkron 15 saniyelik yenileme ve tema desteği.
- CSV/PNG dışa aktarma, gelişmiş arama, fiyat alarmları ve JSON yedekleme.
- **v2.5:** Kompakt portföy kart tasarımının kesinleştirilmesi ve temel ürün görünümünün onayı.
- **v3.3:** Güncellenen favori kartları, veri sürekliliği ve yedekleme akışının olgunlaştırılması.
- **v3.4:** Varlık ve para birimi bazında portföy dağılımı.
- **v3.5:** S&P 500, Nasdaq, BIST 100, Altın ve özel ölçütle portföy performans karşılaştırması.
- **v3.6:** Portföy başlığında toplam büyüklük ile günlük net/yüzde değişim; dağılım grafiklerinde kalıcı özet bilgiler.
- **v4.0:** Mobil A ve Masaüstü B tasarımlarının üç sayfalı yapıda birleştirilmesi; Özet sayfasında iki sütunlu Piyasa Özeti ve Favoriler, açık Grafik Ve Teknik Analiz sayfası, istenen sırada tam Portföy sayfası. Aynı onaylı sürüm içinde Piyasa Özeti'nin USD/TRY, EUR/TRY, GBP/TRY, EUR/USD, S&P 500, Nasdaq, BIST 100 ve Bitcoin değerlerine bir defalık otomatik geçişi kesinleştirilmiştir.
- **v4.1:** Finansal hesaplama doğruluğu, istek yarışları, fiyat/kur önbelleği, sağlayıcı dayanıklılığı, portföy yenilemesi, Wilder RSI, para birimi sonrası MA, API koruması ve erişilebilirlik regresyonları giderilmiştir.
- **v4.2:** Varsayılan Özet açılışı; tarihli Dönem Özeti ve düşük–yüksek konum çubuğu; favori bazında gerçek fiyat zamanı; dönem düğmelerinin özet üstüne taşınması; RSI'ın ana grafiğe bitiştirilmesi; grafik araç çubuğunun yeniden sıralanıp eşitlenmesi; portföy aramasının listenin altına alınması; üçlü getiri özetinin tek satıra sıkıştırılması; yenilemede kaydırma ve halka grafik animasyonunun kaldırılması.
- **v4.3:** iOS Ana Ekrana Ekle görünümünde alt gezinmenin içerik ortasına sıçraması giderildi; `viewport-fit=cover`, Apple web uygulaması meta bilgileri, dinamik viewport yüksekliği ve güvenli alanı menü iç dolgusuna alan sabit alt yerleşim eklendi.
- **v5:** Favorilerde hızlı işlem ve ekonomik gösterge paneli; tek varlıklı sade ana grafik, sürekli RSI ve grafik içi MA; çoklu para birimli nakit, geniş dönemli portföy kıyası ve yaklaşan temettüler; iki satırlı portföy kartları ve mini dağılım halkaları; Açık/Koyu/Sistem temalı, yenileme ve alarm tercihlerini içeren sabit Diğer ayar merkezi tamamlandı.

Bu bölüm yalnız doğrulanmış sürüm özelliklerini kaydeder; geçmişte kullanılan geçici masaüstü paket numaraları güncel web ürününün sürüm standardı değildir.

## 14. v4.1 Teknik Kararlılık Sürümü

Bu aşama yeni ürün özelliği içermez. v4.0 bağımsız kod denetimindeki önemli sorunları kapatır.

### 14.1 Veri doğruluğu

- Piyasa kartı bir sembol seçtiğinde Grafik Ve Teknik Analiz görünümüne geçer.
- Ana grafik yüklemesi istek kimliği ve iptal denetleyicisi kullanır; eski yanıt yeni sembolü veya dönemi ezemez.
- Portföy ve performans ölçütü arasında para birimi farkı varsa hem portföy hem ölçüt USD bazına dönüştürülür.
- Kur dizisinde yalnız aynı gün veya önceki geçerli kur ileri taşınabilir; gelecekteki kur geçmiş boşluklara yazılamaz.
- Gerekli kur alınamazsa eksik pozisyonu dışlayan yanıltıcı toplam yerine açık hata durumu gösterilir.
- Hareketli ortalamalar karma para biriminde günlük fiyatlar USD'ye çevrildikten sonra hesaplanır.
- RSI(14), Wilder yumuşatma yöntemiyle hesaplanır.
- Sağlayıcının `N/A` ve benzeri eksik değerleri sıfır fiyat kabul edilmez.

### 14.2 Eşzamanlılık ve performans

- Grafik ve dört otomatik tamamlama akışı eski yanıt korumasına sahiptir.
- Aynı karşılaştırma sembolü istek sürerken ikinci kez eklenemez.
- Aynı fiyat/kur isteği istemcide tek Promise altında birleştirilir ve yaklaşık 12 saniye paylaşılır.
- Fiyat API cevabı Vercel CDN'de 15 saniye, eski-yanıt toleransıyla 30 saniye tutulabilir.
- Sağlayıcı zaman aşımı 4,5 saniyedir; Nasdaq hisse/ETF denemeleri paralel yürür.
- Chart.js nesneleri her yenilemede yok edilmez; veri `update('none')` ile yerinde güncellenir.
- Sayfa görünür değilken Piyasa, Favoriler, Grafik ve Portföy otomatik yenilemeleri başlatılmaz.
- v4.1'de Portföy açıkken değerler 15 saniyede yenilenir; v5'te bu aralık kullanıcı tarafından seçilebilir. Aynı pozisyon verisi mümkün olduğunda benchmark hesabında yeniden kullanılır.

### 14.3 Güvenlik ve erişilebilirlik

- API uçları yalnız GET kabul eder ve temel IP bazlı oran sınırı uygular.
- Chart.js dosyası SHA-384 Subresource Integrity ile doğrulanır ve istemciye sınırlayıcı CSP uygulanır.
- Hata metinleri HTML olarak enjekte edilmez.
- Ana sayfa sekmeleri WAI-ARIA tab semantiği, ok tuşları ve görünüm odağı desteğine sahiptir.
- Otomatik tamamlama alanları combobox/listbox semantiğiyle Yukarı, Aşağı, Enter ve Escape tuşlarını destekler.
- Sık yenilenen sekiz piyasa kartı topluca `aria-live` değildir; yalnız güncelleme zamanı duyurulur.
- Grafik renkleri tema değişkenlerinden alınır, animasyon azaltma tercihi ve sayısal grafik özetleri desteklenir.

### 14.4 Regresyon doğrulaması

`tests/regression.test.js` aşağıdaki temel kuralları denetler:

- İstemci ve API JavaScript sözdizimi,
- Gelecek kurun geçmişe taşınmaması,
- Eksik pencerede MA üretilmemesi,
- RSI sonucunun geçerli aralıkta olması,
- Eksik Nasdaq fiyatının sıfır kabul edilmemesi,
- `fresh` önbellek kırıcı parametresinin kaldırılması,
- Grafik yarış koruması, karşılaştırma kilidi ve listbox semantiğinin bulunması.

## 15. v4.2 Dönem Özeti ve Arayüz Kararlılığı

Bu sürüm v4.1'in doğruluk ve dayanıklılık temelini koruyarak grafik ve portföy kullanım akışlarını kesinleştirir.

- Başlangıç görünümü her zaman Özet sayfasıdır.
- Dönem düğmeleri, Dönem Özeti ve fiyat/RSI grafiklerinin dikey sırası sabittir.
- Son kapanış, dönem düşük ve dönem yüksek değerleri kendi tarihleriyle sunulur; fiyatın dönem aralığındaki yeri görsel çubukla gösterilir.
- Favoriler başlık zamanı yenileme anını, kart zamanı ise sağlayıcının son fiyat oluşum anını ifade eder.
- Grafik araç çubuğundaki altı işlem aynı düğme tipografisini kullanır ve kararlaştırılan sırayı korur.
- Portföy otomatik yenilemesi görünür sayfa konumunu değiştirmez; dağılım grafikleri animasyonsuz yerinde güncellenir.
- Portföy arama alanı varlık listesinin sonunda, üç getiri metriği ise tek satırda gösterilir.

## 16. v4.3 iOS Ana Ekran Yerleşim Düzeltmesi

Bu sürüm, iPhone'da Safari üzerinden Ana Ekrana Ekle ile açılan bağımsız web uygulamasının alt gezinmesini kararlı hale getirir.

- Viewport tanımı `viewport-fit=cover` içerir.
- Apple bağımsız web uygulaması ve durum çubuğu meta bilgileri bulunur.
- Mobil alt gezinme `bottom: 0` ile fiziksel ekran altına sabitlenir.
- `safe-area-inset-bottom` menünün konumuna değil iç dolgusuna uygulanır.
- Mobil gövde grid yerine blok akış kullanır ve `100svh` / `100dvh` yüksekliğini izler.
- Sayfa alt boşluğu menü yüksekliği ile güvenli alanı birlikte hesaba katar.
- WebKit kompozit katmanı ve backdrop uyumluluğu menünün kaydırma sırasında kararlı kalmasını destekler.

## 17. v5 Ürün ve Ayar Merkezi

- Favori yıldızının yanındaki hızlı işlem menüsü Grafik Aç, Alarm Kur ve Portföye Ekle işlemlerini sunar; kart dokunuşu sade ekonomik gösterge panelini açar.
- Ana grafik karşılaştırma akışı kaldırılmıştır. Ana grafik tek varlığa odaklanır, veri balonu yalnız sembolü gösterir, RSI sürekli açıktır ve MA kontrolü grafik içindedir.
- Grafik sayfasının altındaki Favoriler ve Portföy açılır listeleri kayıtlı varlığı tek dokunuşla ana grafiğe taşır.
- Portföy TRY, USD, EUR ve GBP nakit bakiyelerini destekler; performans karşılaştırması bütün grafik dönemlerini ve özel başlangıç tarihini kullanabilir.
- Yaklaşan temettü/hak kullanım olayları en yakın beş kayıtla gösterilir.
- Portföy kartları iki satırlı kompakt düzendedir. Varlık ve para birimi dağılımları yan yana mini halkalar, merkez ürün adı/yüzdesi, ilk üç kalem ve açılır tam liste kullanır.
- Diğer dördüncü sabit sayfadır. Açık, Koyu ve Sistem temaları; 5–60 saniyelik veya kapalı otomatik yenileme; varsayılan grafik dönemi; alarm denetimi; JSON yedekleme ve yardım bilgilerini içerir.
- Tema, yenileme, grafik dönemi ve alarm tercihleri `localStorage` içinde kalıcıdır ve JSON yedeğine eklenir.

### 17.1 v5.1 Veri Doğruluğu ve Kompakt Arayüz

- Portföy toplamı yalnız bütün pozisyon fiyatları ve gerekli kurlar mevcutsa kesin değer olarak yayımlanır. Eksik semboller kullanıcıya gösterilir; eksik pozisyon sessizce toplamdan çıkarılmaz.
- Performans karşılaştırması `adjclose` verisini öncelikli kullanır. Portföy ile ölçüt aynı ortak geçerli tarihte `%0` tabanına alınır; eksik varlık veya kur varsa kısmi sonuç kesin portföy getirisi gibi gösterilmez.
- Pozisyon veri modeli `costCurrency` ve isteğe bağlı `purchaseDate` alanlarını içerir. Maliyet, uygun olduğunda alım tarihindeki kurla özet para birimine çevrilir; eski kayıtlar açık varsayımla uyarlanır.
- RSI için seçili dönemin öncesinden en az 14 işlem günlük hazırlık verisi alınır; hesap geniş seri üzerinde yapılıp görünür döneme kırpılır.
- Fiyat yanıtı veri zamanı, servis zamanı ve tazelik bilgisini ayırır. Temel veri ile temettü servisleri `ok`, `unsupported`, `provider_error` ve boş sonuç durumlarını birbirinden ayırır.
- BIST fiyat ve kur sürekliliği için Yahoo ailesinden bağımsız TradingView yedeği; BIST yaklaşan temettüleri için ayrı sağlayıcı akışı bulunur.
- Favori kartları yaklaşık 80 px yüksekliğinde kompakt satır kullanır. Hızlı işlem ve yıldız düğmeleri 36 px görünür; `::before` katmanıyla 44 px dokunma alanı korunur.
- Piyasa kartları mobilde 60 px asgari yüksekliğe sahiptir. Ürün adı/kodu üst satırda, fiyat ve yüzde değişimi alt satırda yan yana gösterilir.
- Portföy kartlarında sembol 16 px, ad ve ikincil ayrıntı 12 px, güncel değer 16,32 px, kâr/zarar 12,16 px kullanır; bu değerler Favori kartlarıyla eşleşir.
- Portföy silme düğmesi 32 px görünür ve 44 px etkili dokunma alanına sahiptir.

### 17.2 v5.2 Mobil Ekran Verimliliği

- Mobil ana çerçevedeki eski `48px` sabit üst marj kaldırılmıştır. İçerik yalnız `safe-area-inset-top` kadar cihaz güvenli alanı bırakır.
- Mobil gövdenin sağ ve sol dış boşluğu 8 px'ten 4 px'e, ana çerçeve yatay dolgusu 12 px'ten 6 px'e düşürülmüştür.
- Piyasa Özeti mobil iç dolgusu 10 px'tir; kart yapısı ve iki sütunlu bilgi düzeni korunur.
- Mobil ana çerçeve üst dolgusu 10 px, alt dolgusu 20 px ve köşe yarıçapı 12 px'tir.
- Alt gezinme konumu, dokunma hedefleri ve `safe-area-inset-bottom` davranışı değiştirilmez.
- 320 px, 390 px ve 760 px genişliklerde yatay taşma olmaması kabul koşuludur.

### 17.3 v5.3 Özer Finans Marka ve Portföy Özeti

- Görünen ürün adı ve web-app başlığı Özer Finans'tır. Beyaz zeminli ÖF/onay sembolü dört ana sayfanın üstünde ve masaüstü yan menüsünde kullanılır.
- Dört ana sayfadaki marka satırı ortalanır; sürüm bilgisi çerçevesiz, küçük ve silik olarak marka satırının sağ altındadır.
- Piyasa Özeti, Favoriler, Grafik Ve Teknik Analiz ve Portföyüm başlıkları ortak `18.72px` boyutundadır.
- Portföyüm, toplam portföy değeri ve günlük değişim tek çerçeveli üst kartta gösterilir. Toplam değer `24px`, günlük değişim `14.4px` kullanır.
- Üst kartın sağındaki `⇄` düğmesi asıl özet para birimi ile TL görünümü arasında geçiş yapar. TL tutarları özet para biriminin USD kuru ile TRY/USD kuru üzerinden çapraz kurla hesaplanır; kayıtlı adet, maliyet ve nakit verileri değiştirilmez.
- TL görünümü portföy toplamı, günlük/net/haftalık parasal sonuçlar ve dağılım değerlerine uygulanır. Yüzde getiriler değişmez; yerel varlık kartları kendi işlem para birimini korur.
- Özet sayfasındaki Piyasa ve Favoriler Yenile düğmeleri `38px` yüksekliğindedir.
- Fiyat ve RSI grafiklerinin lejant renk kutuları yalnız çerçeve/tarama yerine seri renginde tamamen doludur.

### 17.4 v5.4 Portföy Yenileme Performansı

- Portföy üst özeti ve varlık kartları yalnız fiyat verisini bekler; temettü uç noktası bu kritik yenileme yolundan ayrılmıştır.
- Özet hesabı için `range=1mo&interval=1d` fiyat serisi kullanılır. Bu aralık son fiyat, önceki kapanış ve hafta başı değerini hesaplamak için yeterlidir; gereksiz 1 yıllık veri aktarılmaz.
- Yaklaşan temettüler ayrı `renderPortfolioDividends` akışıyla yüklenir. Eski asenkron yanıtların yeni takvimi ezmesini önlemek için bağımsız istek kimliği kullanılır.
- Portföy sayfası açıkken çalışan otomatik yenileme yalnız fiyatları, toplamları ve dağılım değerlerini günceller. Temettü sorguları ve tarihsel performans kıyası her 15 saniyede yeniden başlatılmaz.
- Sayfa ilk açıldığında temettü ve performans bölümleri yine arka planda güncellenir. Ölçüt/dönem değişikliği performans kıyasını açıkça yeniler.
- Para birimi dönüşüm düğmesi yeni ağ isteği gerektirmeyen alt bölümleri korur ve yalnız portföy özetini yeniden hesaplar.

### 17.5 v5.5 Logo Sürekliliği ve Çekerek Yenileme

- Favori, portföy, favori hızlı detay ve grafik varlık seçici logoları ortak `appendSymbolLogo` işleviyle oluşturulur.
- Logo zinciri önce Financial Modeling Prep, ardından EODHD kaynağını dener. BIST `.IS` sembolleri EODHD için `IS/{ticker}` biçimine dönüştürülür.
- İki genel kaynakta logo bulunamazsa BIST sembolleri `/api/logo` uç noktasına düşer. Bu servis TradingView Türkiye tarayıcısından doğrulanmış `logoid` alanını alır, SVG'yi sunucu üzerinden aktarır ve uzun süreli CDN önbelleği uygular.
- Logo uç noktası yalnız `1–12` karakterli `.IS` sembollerini kabul eder; istek oranı, dosya türü ve azami görsel boyutu denetlenir.
- Logo kaynaklarının tamamı başarısızsa kırık görsel gösterilmez; sembolün baş harf rozeti görünür kalır.
- Mobilde sayfa en üst konumdayken aşağı çekme hareketi `72px` eşiğini geçtiğinde aktif ekran yenilenir. Açık iletişim kutularında hareket devre dışıdır.
- Özet ekranında Piyasa ve Favoriler, Grafik ekranında açık sembol, Portföy ekranında portföy verileri yenilenir. Diğer ekranında arka plandaki özet verileri tazelenir; kullanıcı bulunduğu sayfadan çıkarılmaz.
- Hareket sırasında erişilebilir canlı durum göstergesi çekme, bırakma, yenileme ve sonuç durumunu bildirir. Dokunma hareketi yalnız sayfa en üstteyken tarayıcı sıçramasını engeller.

### 17.6 v5.6 Otomatik Temettü Yatırımı, TL Altın ve Kayıt Düzenleme

- Portföy pozisyonu veri modeline `purchaseDate`, `costCurrency`, `dripEnabled`, `dripTaxRate` ve `dripFractional` alanları eklenmiştir. Eski kayıtlar geriye uyumlu biçimde normalleştirilir.
- Temettüyü yeniden yatırma seçildiğinde alış tarihinden sonraki nakit dağıtımları kronolojik işlenir. Net tutar kullanıcı vergi oranıyla hesaplanır ve ödeme günündeki veya izleyen ilk işlem günündeki düzeltilmiş kapanış üzerinden kesirli ya da tam paya çevrilir.
- `/api/dividend-history` önce Nasdaq temettü geçmişini kullanır; boş veya desteklenmeyen sembollerde Yahoo grafik olaylarına geçer. Sağlayıcı ve tazelik bilgisi yanıtta korunur.
- Sentetik gram altın fiyatı `/api/gold` içinde `XAU/USD × USD/TRY ÷ 31,1034768` formülüyle TL/gram üretilir. Fizikî çeyrek, yarım, tam, Cumhuriyet, ata ve gremse ürünlerinin gram karşılıkları aynı bazdan alış fiyatı olarak hesaplanır ve açık biçimde alış fiyatı etiketi taşır.
- Portföy varlık kartına dokunmak mevcut adet, maliyet, maliyet para birimi, alış tarihi ve yeniden yatırım ayarlarını düzenleme formunda açar. Kaydetme yeni kayıt eklemek yerine ilgili pozisyonu günceller.
- Nakit kartına dokunmak para birimi ve bakiye tutarını düzenleme formunda açar. Aynı para biriminden ikinci kayıt oluşturulmaz; silme düğmesi kart içinde `24×24px` görünür boyutta kalır.
- iOS'un 16 pikselden küçük girişlere odaklanırken yaptığı otomatik yakınlaştırmayı önlemek için mobil form kontrolleri en az `16px` kullanır. Viewport ölçeği 1'e sabitlenmiş ve iki parmak yakınlaştırması engellenmiştir; kaydırma ve çekerek yenileme davranışları korunur.

### 17.7 v5.7 Çoklu Bağımsız Portföy ve Favori Sıralaması

- Portföy sayfasının üstünde aktif portföy seçicisi ile oluşturma, yeniden adlandırma ve silme kontrolleri bulunur. En az bir portföy zorunludur; son portföy silinemez.
- Aktif portföy seçicisinin üstünde, bütün portföylerdeki hisse ve nakit değerlerini USD bazında birleştiren **Toplam Portföy** kartı bulunur. Kart güncel toplamı ve bugünkü net/yüzde değişimi gösterir; kendi dönüşüm düğmesiyle USD ve TL arasında geçer.
- Açılır portföy seçicisinin hemen altında bütün portföy adları yatay, kaydırılabilir ve tıklanabilir kısayol düğmeleri olarak sunulur. Aktif portföy turkuaz dolgu ile belirtilir.
- Her portföy `id`, `name`, `positions`, `cashBalances` ve `createdAt` alanlarına sahiptir. Pozisyonlar, nakit, toplamlar, dağılım, performans kıyası, temettü takvimi ve Grafik sayfasındaki Portföy seçicisi yalnız aktif kaydı kullanır.
- Aktif portföy yalnız TRY değerlerinden oluşuyorsa dönüşüm düğmesinin hedefi USD, USD veya karma para birimliyse TRY olur. Çapraz dönüşüm `özet para birimi → USD / hedef para birimi → USD` oranıyla yapılır; böylece tek para birimli TL portföyde düğmenin görünürde hiçbir şey yapmaması engellenir.
- Eski `finans-grafigi-portfolio` ve `finans-grafigi-cash-balances` kayıtları ilk açılışta otomatik olarak `portfolio-main / Portföyüm` kaydına taşınır. Eski anahtarlar geçiş güvenliği için aktif portföyün uyumlu kopyası olarak güncellenmeye devam eder.
- Aktif portföy değiştiğinde eski fiyat, temettü ve performans isteklerinin yeni portföyü ezmemesi için ilgili istek kimlikleri geçersizleştirilir.
- JSON yedek şeması 2, bütün portföyleri ve aktif portföy kimliğini saklar. Şema 1 yedekleri tek bir varsayılan portföye dönüştürülerek açılır; birleştirmede eşleşme portföy kimliğiyle yapılır.
- Favoriler yaklaşık `400ms` basılı tutmayla tutamaçsız sıralanır. iPhone için pasif olmayan bağımsız `TouchEvent` akışı, diğer girişlerde Pointer Events kullanılır.
- Sürüklenen gerçek kart `requestAnimationFrame` döngüsüyle parmağı X/Y eksenlerinde izler. Görünmez yer tutucu liste yüksekliğini korur; komşu kartlar FLIP geçişiyle yer açar ve bırakılan kart hedefe oturur.
- Mobil `nth-child` görünürlük kuralları havadaki karta uygulanmaz; kart ile hızlı işlem/yıldız düğmeleri sürükleme boyunca görünür kalır. Metin seçimi, dokunma çağrı balonu ve ikinci yer tutucu görünümü engellenir.
- Bırakılan favori sırası `localStorage` içindeki favori dizisine yazılır ve yeniden açılışta korunur.

### 17.8 v5.8 TEFAS Fonları

- Portföy araması mevcut piyasa aramasıyla `/api/tefas?action=search` sonucunu paralel çalıştırır; tekrar eden semboller ayıklanır ve ilk beş sonuç gösterilir.
- TEFAS fonları diğer piyasalarla karışmaması için `TEFAS-{FON_KODU}` biçiminde saklanır. Uzun ad, adet, maliyet, alış tarihi ve maliyet para birimi bütün bağımsız portföyler ve JSON yedekleriyle aynen taşınır.
- `/api/tefas.py`, yeni TEFAS sitesinin resmî `/api/funds/fonUnvanAra`, `/api/statistics/tefas/getFplFonList` ve `/api/funds/fonFiyatBilgiGetir` JSON uç noktalarını kullanır. Hızlı aramada görünmeyen YLB/ENR gibi yatırım fonları tam YAT fon listesinde kod ve unvanla aranır; kapatılmış `/api/DB/BindHistoryInfo` akışına bağımlılık yoktur.
- Bütün sembol/ad arama kutuları sonuçsuz sorguyu “Eşleşen ürün bulunamadı”, sağlayıcı kesintisini ise “Arama servisine ulaşılamadı” metniyle birbirinden ayırır.
- TEFAS fon unvanı eşleştirmesi Türkçe karakterlerden bağımsızdır; `Yapı Kredi`/`Yapi Kredi`, `QNB` ve `Enpara` sorguları ilgili fonları bulabilir.
- Grafik, Favoriler, Piyasa, Performans Kıyaslama ve Portföy aramalarının tamamı piyasa sağlayıcısı ile TEFAS'ın tam YAT yatırım fonu sonuçlarını aşamalı biçimde birleştirir. Hızlı gelen sağlayıcının sonucu hemen gösterilir; diğer sağlayıcı tamamlandığında aynı liste sembole göre tekilleştirilerek güncellenir.
- TEFAS bot korumasıyla uyum için Python sunucu işlevinde `curl_cffi` ve Chrome 131 TLS taklidi kullanılır; oturum 9 dakika, başarılı cevaplar 10 dakika işlem belleğinde tutulur. Vercel CDN cevabı 10 dakika taze, bir saate kadar yeniden doğrulama sırasında kullanılabilir.
- Tek fon fiyat servisi, 1 hafta–5 yıl dönem kodlarını TEFAS periyotlarına eşler ve günlük fiyat listesini uygulamanın ortak grafik şemasına dönüştürür. Para birimi TRY, fiyat hassasiyeti altı ondalıktır.
- TEFAS fonlarının dağıtım etkisi fon birim fiyatına işlendiğinden otomatik temettü geri yatırımı sunulmaz. TEFAS pozisyonlarında seçenek devre dışı bırakılır; eski bir yedekten açık ayar gelse bile normalleştirme sırasında kapatılır.
- TEFAS’ın sağladığı değerler gün sonu fon fiyatlarıdır; gerçek zamanlı borsa fiyatı gibi yorumlanmaz.

## 18. Bilinen sınırlar ve ertelenen işler

- Üçüncü taraf ücretsiz finans verilerinde gecikme, piyasa kapsamı ve oran sınırı olabilir.
- Gerçek zamanlı borsa verisi garantisi verilmez; gösterilen değer sağlayıcının son kaydıdır.
- Uygulama kapalıyken fiyat alarmı çalışmaz; Web Push/e-posta alarmı kullanıcı kararıyla ertelenmiştir.
- Yerel veri cihazlar arasında otomatik eşitlenmez.
- Gelecek temettü tarihleri kesin olmayabilir; veri sağlayıcısının sunduğu olaylar gösterilir.
- Kullanıcı hesabı, bulut veritabanı, emir gönderme ve aracı kurum entegrasyonu mevcut kapsamda yoktur.
- Mobil platform için yerel iOS/Android uygulaması yoktur; responsive web uygulaması kullanılır.

## 19. Kabul testi kontrol listesi

### Özet ve Grafik

- [ ] Uygulama Açık, Koyu ve cihazı takip eden Sistem temasında hatasız açılıyor.
- [ ] Seçili zaman düğmesi iki temada da açıkça görülüyor.
- [ ] Sembol ve ad araması en fazla beş uygun öneri gösteriyor.
- [ ] BIST ve ABD örnekleri ana grafikte çiziliyor.
- [ ] 1 hafta–5 yıl ve özel tarih aralıkları çalışıyor.
- [ ] X ekseni gerektiğinde yılı gösteriyor.
- [ ] MA50/100/200 birlikte açılıyor ve doğru renklerde.
- [ ] RSI düğme gerektirmeden altta, ana grafikle aynı dönemde çiziliyor.
- [ ] İlk v4.0 açılışında Piyasa Özeti tam sekiz varsayılan değeri doğru sırada gösteriyor; sonraki kullanıcı özelleştirmeleri korunuyor.
- [ ] Piyasa, Favoriler, Grafik ve açık Portföy seçilen 5–60 saniyelik sürede yenileniyor veya kullanıcı seçimiyle duruyor; kartlar zıplamıyor.
- [ ] Uygulama açıldığında Özet sayfası görünür.
- [ ] Dönem Özeti değerleri tarihleriyle birlikte doğru; konum çubuğu güncel fiyatın düşük–yüksek aralığındaki yerini gösteriyor.
- [ ] Favoriler başlığı yenileme anını, her kart ise gerçek son fiyat zamanını saniye hassasiyetinde gösteriyor.
- [ ] Dönem düğmeleri özet kartının üzerinde; RSI ana grafiğe bitişik ve hemen altında.
- [ ] Grafik araç çubuğundaki dört işlem düğmesi aynı biçimde; MA kontrolü grafik içinde ve veri balonu yalnız sembolle gösteriliyor.
- [ ] iPhone'da Ana Ekrana Ekle ile açıldığında alt gezinme ekranın altında kalıyor; kaydırmada içerik ortasına sıçramıyor.
- [ ] Ana ekran göstergesi/çentik güvenli alanı menü etiketlerini kapatmıyor ve son içerik menünün arkasında kalmıyor.
- [ ] İki yenile düğmesi aynı işlemi tetikliyor.
- [ ] Dört ana sayfanın her birinde en üstten aşağı çekip bırakmak kullanıcıyı sayfadan çıkarmadan ilgili verileri yeniliyor.
- [ ] FMP logosu bulunmayan `BJKAS.IS` gibi bir BIST sembolünde TradingView yedeği görünür logo sağlıyor; tüm kaynaklar başarısızsa baş harf rozeti kalıyor.
- [ ] Piyasa Özeti, Favoriler, Grafik Ve Teknik Analiz ve Portföyüm başlıkları aynı `18.72px` boyutunda görünüyor.
- [ ] Dört ana sayfanın üstünde ortalı Özer Finans marka satırı, beyaz zeminli logo ve silik sürüm bilgisi bulunuyor.
- [ ] Fiyat ve RSI lejant renk kutuları seri rengiyle tamamen dolu görünüyor.
- [ ] CSV ve PNG indirmeleri geçerli dosya oluşturuyor.

### Portföy

- [ ] Yeni varlık adet ve maliyetle ekleniyor.
- [ ] Aynı varlık eklenince ağırlıklı maliyet doğru hesaplanıyor.
- [ ] Kartlar masaüstünde üç sütunlu ve mobilde uyumlu.
- [ ] Kartlar iki satırda logo, ad, değer, adet, maliyet ve kâr/zarar bilgisini kaybetmeden gösteriyor.
- [ ] TRY, USD, EUR ve GBP nakit bakiyeleri toplam ve dağılım hesaplarına katılıyor.
- [ ] Toplam büyüklük ile günlük net/yüzde değişim doğru.
- [ ] Portföy üst özeti çerçeveli kart içinde; `⇄` düğmesi tutarları TL'ye ve asıl özet para birimine doğru çeviriyor.
- [ ] Toplam ve haftalık kâr/zarar tablosu doğru.
- [ ] Mini dağılım halkaları yan yana; merkezde en büyük ürün ve yüzde, altta ilk üç kalem, Tümünü Göster ile kalanlar görünüyor.
- [ ] Standart ölçütlerde Altın var, Bitcoin yok.
- [ ] Performans serileri başlangıçta `%0` olacak şekilde normalize.
- [ ] Temettü alanı en fazla beş satır gösteriyor.
- [ ] Portföy arama alanı son varlık kartının altında.
- [ ] Üç getiri metriği tek satırda üç kompakt kutu halinde.
- [ ] Otomatik yenileme sayfayı dağılım grafiğine taşımıyor ve halka grafikleri yeniden oynatmıyor.
- [ ] Performans kıyasında 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, 5 yıl ve özel tarih çalışıyor.
- [ ] Temettü Takvimi açıklanmış yaklaşan en fazla beş olayı gösteriyor.
- [ ] Portföy fiyat kartları temettü sağlayıcısı yavaşladığında beklemeden güncelleniyor; takvim daha sonra bağımsız tamamlanıyor.
- [ ] 15 saniyelik otomatik yenileme performans kıyası ve temettü isteklerini yeniden başlatmıyor.
- [ ] Portföy kartına dokununca mevcut pozisyon bilgileri düzenleme formunda doğru değerlerle açılıyor ve kayıt yerinde güncelleniyor.
- [ ] Alış tarihi bulunan pozisyonda temettüyü yeniden yatırma, vergi ve kesirli/tam pay tercihleriyle geçmiş dağıtımları doğru adede dönüştürüyor.
- [ ] `MINT` temettü geçmişi Nasdaq boş döndüğünde Yahoo dağıtım olayları yedeğinden alınabiliyor.
- [ ] Gram altın TL/gram formülüyle; çeyrek, yarım ve diğer fizikî altınlar alış fiyatıyla portföye eklenebiliyor.
- [ ] Nakit kartına dokununca tutar ve para birimi düzenlenebiliyor; silme çarpısı kart sınırından taşmıyor.
- [ ] Birden fazla bağımsız portföy oluşturulabiliyor; aktif portföyün hisse, nakit, maliyet ve temettü ayarları diğerlerinden ayrı kalıyor.
- [ ] Toplam Portföy kartı bütün portföyleri birleştiriyor; aktif ve birleşik özetler USD/TL arasında doğru dönüşüyor.
- [ ] Favori kartı iPhone'da basılı tutulunca görünür biçimde parmağı takip ediyor; sağ düğmeler kaybolmuyor, komşular yumuşak yer açıyor ve yeni sıra yenilemeden sonra korunuyor.
- [ ] Portföy aramasında `MAC` kodu veya Marmara Capital adı TEFAS sonucunu gösteriyor ve seçilen fon TRY maliyetle eklenebiliyor.
- [ ] Portföy aramasında `YLB` ve `ENR`, hızlı TEFAS aramasında bulunmasa bile tam YAT fon listesinden öneriliyor ve fiyat geçmişi alınabiliyor.
- [ ] Bütün arama alanlarında sonuçsuz sorgu görünür “Eşleşen ürün bulunamadı” durumu gösteriyor.
- [ ] TEFAS fonu portföy değerine son resmî fiyatla katılıyor; günlük ve haftalık değişim son iş günü verilerinden hesaplanıyor.
- [ ] TEFAS fonu seçildiğinde otomatik temettü geri yatırımı kapalı ve devre dışı görünüyor; JSON yedeği bu ayarı yanlışlıkla yeniden açmıyor.

### Diğer ve Ayarlar

- [ ] Diğer masaüstünde sol menüden, mobilde alt menüden açılan sabit dördüncü sayfadır.
- [ ] Tema, yenileme, varsayılan dönem ve alarm denetimi seçimleri yeniden açılışta korunur.
- [ ] Görünüm, Yenileme, Bildirimler ve Yardım kartları masaüstünde yatay; mobilde dikey ve taşmasızdır.
- [ ] Veri Yedekleme araçları Diğer sayfasında, Yardım Ve Uygulama Bilgileri en alttadır.

### Kalıcılık ve dayanıklılık

- [ ] Favoriler, portföy, nakit, alarmlar, tema, yenileme/dönem tercihleri ve piyasa kartları yenilemeden sonra korunuyor.
- [ ] JSON dışa aktarma ve birleştir/değiştir geri yükleme çalışıyor.
- [ ] Bir karşılaştırma isteği hata verince ana grafik kaybolmuyor.
- [ ] Sağlayıcı yedeği birincil servis başarısız olduğunda devreye giriyor.
- [ ] Tarayıcı konsolunda tanımsız değişken veya işlenmemiş Promise hatası yok.
- [ ] Mobil arama ve form alanlarına dokunmak sayfayı yakınlaştırmıyor; iki parmak hareketi uygulama ölçeğini değiştirmiyor.

## 20. Sıfırdan yeniden geliştirme için tamamlanma tanımı

Bir yeniden yapım, ancak aşağıdaki koşulların tamamı sağlandığında mevcut Özer Finans ile eşdeğer kabul edilir:

1. Bu belgedeki dört sabit sayfa ve tüm ana bölümler uygulanmıştır.
2. Arama, fiyat, favori hızlı işlemleri, göstergeler, portföy performans karşılaştırması ve yedekleme uçtan uca çalışır.
3. Karma para birimi ve tarih eşleme kuralları test edilmiştir.
4. Koyu/açık tema ve mobil düzen görsel olarak doğrulanmıştır.
5. Kişisel veriler tarayıcıda kalıcıdır ve JSON ile taşınabilir.
6. Yahoo/Nasdaq yedek sağlayıcı zinciri sunucu tarafında çalışır.
7. Otomatik yenileme yalnız gerekli sayısal alanları değiştirir; görünür yerleşim hareket etmez.
8. v5.8 kabul testi kontrol listesi geçer.
9. Güncel belge depo kökünde bulunur; kullanıcı onayından sonra aynı belge `archive/v5.8/` altında oluşturulur.
10. Kullanıcı canlı sürümü kontrol edip onaylamıştır.

## 21. Belge bakım kuralı

Her onaylı sürüm için şu işlem zorunludur:

1. Belgedeki “Belge sürümü”, “Uygulama sürümü”, tarih ve özellik tanımları güncellenir.
2. Yeni özelliklerin işlevsel isterleri, teknik etkileri, kalıcılık alanları ve kabul testleri eklenir.
3. Kaldırılan özellikler güncel tasarımdan çıkarılır; önemli kararlar gelişim özetinde korunur.
4. Kök kopya güncellenir.
5. Aynı kopya ilgili `archive/vX.Y/` klasörüne eklenir.
6. GitHub ve canlı Vercel sürümü kontrol edilip kullanıcı onayına sunulur.

Bu belge kullanıcı onayı olmadan “onaylı sürüm belgesi” statüsü kazanmaz.
