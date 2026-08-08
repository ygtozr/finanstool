# FinansTool — Ürün ve Teknik Tasarım Belgesi

**Belge sürümü:** 4.0  
**Uygulama sürümü:** v4.0  
**Durum:** Kullanıcı tarafından onaylandı  
**Canlı adres:** https://finanstool.vercel.app  
**Kaynak depo:** https://github.com/ygtozr/finanstool  
**Son güncelleme:** 8 Ağustos 2026

Bu belge FinansTool uygulamasının amacını, kullanıcı tercihlerini, mevcut işlevlerini, görsel tasarımını, veri modelini ve teknik mimarisini tek yerde tanımlar. Hedefi, mevcut kaynak kod görülmeden uygulama sıfırdan geliştirilse bile aynı davranışın ve mümkün olduğunca aynı görünümün yeniden üretilebilmesidir.

## 1. Ürün amacı

FinansTool; hisse senedi, ETF, endeks, emtia ve döviz verilerini tek ekranda izlemek, farklı varlıkları karşılaştırmak, teknik göstergeleri incelemek ve kullanıcının kişisel portföyünü takip etmek için geliştirilmiş Türkçe bir finans uygulamasıdır.

Temel hedefler:

- Sembol veya şirket adıyla hızlı arama yapmak.
- Fiyat geçmişini seçilen zaman aralığında anlaşılır bir grafikle göstermek.
- Birden fazla varlığı aynı grafikte, para birimi farklarını doğru ele alarak karşılaştırmak.
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
9. Özet, Grafik Ve Teknik Analiz ve Portföy bağımsız sabit sayfalardır; mobilde alt gezinme, masaüstünde sol menü kullanılır.
10. Karma para birimli karşılaştırmalarda yanıltıcı eksen kullanılmaz; seriler USD bazında ortaklaştırılır.

### 2.1 Sürümleme ve arşiv standardı

- Güncel onaylı sürüm: **v4.0**.
- Sonraki özellik sürümü, kullanıcı farklı bir ad vermedikçe **v4.1** olur.
- Depo kökü her zaman canlı sürümü temsil eder.
- Arşiv yolu: `archive/vX.Y/`.
- Bir sürüm onaylandığında en az şu dosyalar arşivlenir:
  - `index.html`
  - `README.md`
  - `api/price.js`
  - `api/search.js`
  - `URUN_VE_TEKNIK_TASARIM.md`
- Arşiv kopyaları geçmiş sürümü temsil eder; daha sonraki geliştirmelerde geriye dönük değiştirilmez.

## 3. Kullanıcı deneyimi ve bilgi mimarisi

### 3.1 Ana gezinme

Uygulamada üç bağımsız ana sayfa bulunur:

- **Özet:** Piyasa Özeti ilk sırada, Favoriler hemen altında gösterilir. Mobilde piyasa kartları her satırda iki adet olacak şekilde aşağı doğru devam eder.
- **Grafik Ve Teknik Analiz:** Arama, teknik analiz seçenekleri, fiyat grafiği, RSI ve dönem seçenekleri doğrudan görünür.
- **Portföy:** Toplam portföy, Portföy Özet Analizi, hisseler, dağılım, performans karşılaştırması ve Temettü Takvimi sırasıyla gösterilir.

Masaüstünde 216 px genişliğinde sabit sol menü; mobilde Özet, Grafik, Portföy ve Diğer seçeneklerinden oluşan sabit alt gezinme kullanılır.

Veri yedekleme işlevi ayrıca erişilebilen bir iletişim kutusu olarak sunulur. Tema düğmesi sağ üstte sabit konumdadır.

### 3.2 Genel görsel dil

Arayüz koyu tema öncelikli, finans terminali hissi veren, sade kart tabanlı bir tasarımdır. Yuvarlatılmış paneller, ince sınırlar, okunaklı büyük fiyatlar ve turkuaz vurgu rengi kullanılır.

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
- Ana arama alanının yanındaki ayrıca konmuş karşılaştırma ikonu kaldırılmıştır; karşılaştırma Favoriler kartlarındaki ikon üzerinden yönetilir.

### 4.3 Fiyat grafiği

Grafik Ve Teknik Analiz sayfası seçilen varlığın fiyat geçmişini gösterir. Arama, gösterge kontrolleri, grafik ve dönem seçenekleri sayfa açıldığında görünürdür.

Zaman aralığı seçenekleri:

- 1 Hafta
- 1 Ay
- 3 Ay
- 6 Ay
- 1 Yıl
- 5 Yıl
- Şu Tarihten İtibaren

Tarih alanı davranışı:

- Kullanıcı dostu `GG.AA.YYYY` biçimi kullanılır.
- Tarih seçildiğinde kontrolün üzerinde seçilen tarihten itibaren olduğu belirtilir.
- Başlangıç tarihi gelecekte olamaz.
- Grafik başlığı/değişim metni sabit “5 aylık değişim” yerine seçili döneme göre hesaplanır.

Grafik kuralları:

- X ekseninde yıl bilgisi gerektiğinde açıkça görünür.
- Tek varlıkta fiyat ekseni varlığın doğal para birimindedir.
- Birden çok varlık ve farklı para birimleri varsa tüm seriler USD bazında ortaklaştırılır.
- Karşılaştırma amacıyla birden fazla favori aynı grafiğe eklenebilir.
- Her seri farklı ve ayırt edilebilir renkte çizilir.
- Serinin zaman aralığı ana grafikle aynıdır.
- 1 ve 5 yıllık karşılaştırmalarda veri güncelliği korunur; kısa veya eksik ikinci seri ana seriyi kesmemelidir.
- Grafik, otomatik yenilemede yeniden kurulup yanıp sönmemeli; mümkün olduğunda yalnızca veri kümeleri güncellenmelidir.

### 4.4 Favoriler

Favoriler sağ sütunda bağımsız bir paneldir. Veriler uygulama kapatıldığında silinmez.

Her favori kartı:

- Solda yuvarlak alanı dolduran şirket/fon logosu; logo yoksa tutarlı bir sembol rozeti gösterir.
- Sembolü büyük, varlık adını daha küçük gösterir.
- Sağda güncel fiyatı; altında günlük net ve yüzde değişimi gösterir.
- Favoriden çıkarma için yıldız kontrolü içerir.
- Ana grafiğe karşılaştırma serisi ekleyip çıkarmak için ayrı bir karşılaştırma ikonu içerir.
- Karşılaştırma ikonunun seçili ve seçili değil durumları renk veya dolulukla açıkça ayrılır.

Favoriler panelinde Piyasa Özeti ile aynı biçimde saniyeli “Son Güncelleme” bilgisi ve senkron yenile düğmesi bulunur.

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

- RSI ana grafiğin içinde değil, hemen altında bağımsız bir grafik olarak çizilir.
- Zaman aralığı ana grafikle birebir aynıdır.
- RSI serisi ana fiyat serisiyle aynı renktedir.
- Yaygın 30 ve 70 eşikleri yardımcı çizgilerle gösterilir.
- RSI kapatıldığında alt grafik alanı kaldırılır; ana grafik etkilenmez.

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

Ağırlıklı maliyet formülü:

```text
yeni birim maliyet =
((eski adet × eski maliyet) + (eklenen adet × eklenen maliyet))
÷ (eski adet + eklenen adet)
```

### 5.3 Kompakt portföy kartları

Masaüstünde kartlar üç sütunlu kompakt yapıda gösterilir. Kart tasarımı, daha önce seçilen “C” alternatifini temel alır ve “B” alternatifindeki şirket/fon adı bilgisini de içerir.

Her kartta:

- Sembol ve yanında/altında varlık adı,
- Kaldırma düğmesi,
- Güncel toplam değer,
- Net kâr/zarar,
- Yüzde kâr/zarar,
- Adet ve birim maliyet

bulunur. Kartlar gereksiz dikey boşluk içermez.

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

Grafiklerin özet bilgileri tıklama gerektirmeden sürekli görünür. Her öğe için renk işareti, ad, dönüştürülmüş değer ve yüzde payı grafik yanında/altında listelenir.

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

- 1 Ay
- 3 Ay
- 6 Ay
- 1 Yıl

Portföy ve kıyaslama serileri başlangıç gününde `%0` olacak şekilde normalize edilir. Sonuç alanı portföy getirisi, ölçüt getirisi ve aradaki göreceli farkı gösterir. Para birimleri farklıysa hesap USD bazında yapılır.

### 5.7 Temettü Takvimi

Portföydeki varlıklar için en fazla beş satır gösterilir. Sağlayıcıdan gelen son dağıtım/temettü olayları listelenir.

**Veri anlamı:** Sağlayıcı kesin bir gelecek kurumsal eylem takvimi sunmadığında bu alan yakın geçmiş dağıtım kayıtlarını gösterebilir; kesin gelecek temettü taahhüdü olarak yorumlanmaz.

## 6. Veri Yedekleme

Kullanıcı verileri JSON dosyası olarak dışa aktarılabilir ve daha sonra geri yüklenebilir.

Yedek kapsamı:

- Favoriler,
- Portföy,
- Fiyat alarmları,
- Piyasa Özeti öğeleri,
- Tema tercihi.

Şema sürümü 1 için örnek:

```json
{
  "schemaVersion": 1,
  "appVersion": "4.0",
  "exportedAt": "2026-08-08T00:00:00.000Z",
  "data": {
    "favorites": [
      { "symbol": "AAPL", "name": "Apple Inc." }
    ],
    "portfolio": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "quantity": 1,
        "unitCost": 100
      }
    ],
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
    "theme": "dark"
  }
}
```

Geri yükleme seçenekleri:

- **Birleştir:** Mevcut kayıtları korur, yedekteki kayıtları ekler/günceller.
- **Değiştir:** Mevcut yerel veriyi yedek içeriğiyle değiştirir.

Yüklenen dosya JSON olarak doğrulanır, beklenmeyen alanlar ayıklanır ve yaklaşık 1 MB dosya sınırı uygulanır.

## 7. Teknik mimari

### 7.1 Genel yapı

Uygulama hafif, bağımlılığı az bir mimariye sahiptir:

```text
Tarayıcı
  ├─ index.html
  │   ├─ HTML arayüz
  │   ├─ CSS tema ve responsive düzen
  │   └─ Vanilla JavaScript uygulama durumu
  ├─ Chart.js 4.4.4 (jsDelivr CDN)
  └─ /api/* istekleri
      ├─ api/search.js  → sembol/ad arama ve sağlayıcı yedekleme
      └─ api/price.js   → fiyat geçmişi, meta veri ve sağlayıcı yedekleme
```

- Ön yüz tek sayfalı statik bir `index.html` dosyasında HTML, CSS ve JavaScript olarak bulunur.
- Harici grafik kütüphanesi Chart.js 4.4.4'tür.
- Sunucu tarafı uçlar Vercel Serverless Functions üzerinde CommonJS modülleri olarak çalışır.
- Mevcut yapıda ayrı bir veritabanı, kullanıcı hesabı veya sunucu tarafı oturum yönetimi yoktur.
- `package.json` veya bir derleme sistemi zorunlu değildir; depo doğrudan Vercel tarafından yayımlanabilir.

### 7.2 API uçları

#### `GET /api/search`

Amaç: Sembol veya şirket/fon adına göre arama önerileri üretmek.

Beklenen davranış:

- Girdi normalize edilir ve güvenli uzunlukta tutulur.
- Yahoo Finance araması birincil kaynaktır.
- Nasdaq otomatik tamamlama desteklenen ABD varlıklarında yedek kaynaktır.
- İkinci Yahoo alan adı son yedek olarak denenebilir.
- Sonuçlar sembol, kısa/uzun ad, piyasa ve tür bilgisine indirgenir.
- Yinelenen semboller kaldırılır.
- İstemci ana aramada ilk beş sonucu gösterir.
- Hata durumunda kullanıcıya yalnızca “Failed to fetch” değil, anlaşılır Türkçe geri bildirim verilir.

#### `GET /api/price`

Amaç: Bir sembol için grafik verisi ve meta veri sağlamak.

Beklenen sorgular:

- `symbol`: doğrulanmış finans sembolü.
- `range`: `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd` veya `max`.
- `interval`: çoğunlukla `1d`, gerektiğinde `1wk`.

Beklenen davranış:

- Yahoo chart API birincil kaynaktır.
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
| `finans-grafigi-portfolio` | Portföy adet ve maliyet kayıtları |
| `finans-grafigi-market-items` | Özelleştirilmiş piyasa kartları |
| `finans-grafigi-market-defaults-version` | Sekiz sabit piyasa değerinin bir defalık v4.0 taşıma işareti |
| `finans-grafigi-portfolio-benchmark` | Seçili karşılaştırma ölçütü |

Kişisel veriler varsayılan olarak sadece kullanıcının tarayıcısında kalır. Tarayıcı verileri temizlenirse JSON yedeği yoksa geri getirilemez.

### 7.5 Zamanlayıcılar ve yenileme

| İşlem | Aralık |
|---|---:|
| Piyasa Özeti ve Favoriler | 15 saniye |
| Açık ana grafik | 15 saniye |
| Fiyat alarmlarını kontrol | 60 saniye |

Yenileme çağrıları üst üste binmemeli; önceki istek sürerken gereksiz yeni istek başlatılmamalıdır. Geç gelen eski yanıt, daha yeni seçimin grafiğini ezmemelidir.

## 8. Hesaplama ve veri birleştirme kuralları

### 8.1 Para birimi dönüşümü

- Aynı para birimindeki tek grafik doğal fiyatıyla gösterilir.
- Farklı para birimlerindeki varlıklar aynı grafikteyse her seri ilgili tarihin mümkün olan en yakın kuruyla USD'ye çevrilir.
- TRY fiyatlı varlık için genel dönüşüm `TRY fiyat ÷ USDTRY` şeklindedir.
- Eksik günlerde gelecekteki kur kullanılmamalı; aynı gün veya önceki en yakın geçerli değer tercih edilmelidir.
- Grafik etiketi, eksen başlığı ve araç ipucu hesap birimini açıkça belirtir.

### 8.2 Karşılaştırma serileri

- Seriler aynı görünür tarih penceresine kırpılır.
- Bir varlığın tatil günü diğer varlığın serisini silmez.
- Tarihler doğrudan dizi indeksiyle değil tarih anahtarıyla eşleştirilir.
- Bir seride son gün verisi yoksa diğer serinin güncel verisi kesilmez.
- Fiyat karşılaştırmasında gerçek USD değerleri; portföy performans karşılaştırmasında başlangıca göre yüzde normalize değerler kullanılır.

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
- “Karşılaştırma verisi alınamadı; ana grafik gösterilmeye devam ediyor.”

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
- Kalıcı Favoriler, çoklu karşılaştırma, karma para birimini USD'ye dönüştürme.
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

Bu bölüm yalnız doğrulanmış sürüm özelliklerini kaydeder; geçmişte kullanılan geçici masaüstü paket numaraları güncel web ürününün sürüm standardı değildir.

## 14. Bilinen sınırlar ve ertelenen işler

- Üçüncü taraf ücretsiz finans verilerinde gecikme, piyasa kapsamı ve oran sınırı olabilir.
- Gerçek zamanlı borsa verisi garantisi verilmez; gösterilen değer sağlayıcının son kaydıdır.
- Uygulama kapalıyken fiyat alarmı çalışmaz; Web Push/e-posta alarmı kullanıcı kararıyla ertelenmiştir.
- Yerel veri cihazlar arasında otomatik eşitlenmez.
- Gelecek temettü tarihleri kesin olmayabilir; veri sağlayıcısının sunduğu olaylar gösterilir.
- Kullanıcı hesabı, bulut veritabanı, emir gönderme ve aracı kurum entegrasyonu mevcut kapsamda yoktur.
- Mobil platform için yerel iOS/Android uygulaması yoktur; responsive web uygulaması kullanılır.

## 15. Kabul testi kontrol listesi

### Özet ve Grafik

- [ ] Uygulama koyu ve açık temada hatasız açılıyor.
- [ ] Seçili zaman düğmesi iki temada da açıkça görülüyor.
- [ ] Sembol ve ad araması en fazla beş uygun öneri gösteriyor.
- [ ] BIST ve ABD örnekleri ana grafikte çiziliyor.
- [ ] 1 hafta–5 yıl ve özel tarih aralıkları çalışıyor.
- [ ] X ekseni gerektiğinde yılı gösteriyor.
- [ ] Birden fazla favori karşılaştırmaya eklenebiliyor.
- [ ] Karma TRY/USD serileri USD bazında doğru görünüyor.
- [ ] 1 ve 5 yıllık karşılaştırma güncel son veriyi kaybetmiyor.
- [ ] MA50/100/200 birlikte açılıyor ve doğru renklerde.
- [ ] RSI altta, ana grafikle aynı dönemde çiziliyor.
- [ ] İlk v4.0 açılışında Piyasa Özeti tam sekiz varsayılan değeri doğru sırada gösteriyor; sonraki kullanıcı özelleştirmeleri korunuyor.
- [ ] Piyasa ve Favoriler 15 saniyede yenileniyor; kartlar zıplamıyor.
- [ ] İki yenile düğmesi aynı işlemi tetikliyor.
- [ ] CSV ve PNG indirmeleri geçerli dosya oluşturuyor.

### Portföy

- [ ] Yeni varlık adet ve maliyetle ekleniyor.
- [ ] Aynı varlık eklenince ağırlıklı maliyet doğru hesaplanıyor.
- [ ] Kartlar masaüstünde üç sütunlu ve mobilde uyumlu.
- [ ] Toplam büyüklük ile günlük net/yüzde değişim doğru.
- [ ] Toplam ve haftalık kâr/zarar tablosu doğru.
- [ ] Dağılım grafiklerinin her öğesi kalıcı metin özetiyle görünüyor.
- [ ] Standart ölçütlerde Altın var, Bitcoin yok.
- [ ] Performans serileri başlangıçta `%0` olacak şekilde normalize.
- [ ] Temettü alanı en fazla beş satır gösteriyor.

### Kalıcılık ve dayanıklılık

- [ ] Favoriler, portföy, alarmlar, tema ve piyasa kartları yenilemeden sonra korunuyor.
- [ ] JSON dışa aktarma ve birleştir/değiştir geri yükleme çalışıyor.
- [ ] Bir karşılaştırma isteği hata verince ana grafik kaybolmuyor.
- [ ] Sağlayıcı yedeği birincil servis başarısız olduğunda devreye giriyor.
- [ ] Tarayıcı konsolunda tanımsız değişken veya işlenmemiş Promise hatası yok.

## 16. Sıfırdan yeniden geliştirme için tamamlanma tanımı

Bir yeniden yapım, ancak aşağıdaki koşulların tamamı sağlandığında mevcut FinansTool ile eşdeğer kabul edilir:

1. Bu belgedeki iki sabit sekme ve tüm ana bölümler uygulanmıştır.
2. Arama, fiyat, favori, çoklu karşılaştırma, göstergeler, portföy ve yedekleme uçtan uca çalışır.
3. Karma para birimi ve tarih eşleme kuralları test edilmiştir.
4. Koyu/açık tema ve mobil düzen görsel olarak doğrulanmıştır.
5. Kişisel veriler tarayıcıda kalıcıdır ve JSON ile taşınabilir.
6. Yahoo/Nasdaq yedek sağlayıcı zinciri sunucu tarafında çalışır.
7. Otomatik yenileme yalnız gerekli sayısal alanları değiştirir; görünür yerleşim hareket etmez.
8. v4.0 kabul testi kontrol listesi geçer.
9. Güncel belge depo kökünde, aynı belge `archive/v4.0/` altında bulunur.
10. Kullanıcı canlı sürümü kontrol edip onaylamıştır.

## 17. Belge bakım kuralı

Her onaylı sürüm için şu işlem zorunludur:

1. Belgedeki “Belge sürümü”, “Uygulama sürümü”, tarih ve özellik tanımları güncellenir.
2. Yeni özelliklerin işlevsel isterleri, teknik etkileri, kalıcılık alanları ve kabul testleri eklenir.
3. Kaldırılan özellikler güncel tasarımdan çıkarılır; önemli kararlar gelişim özetinde korunur.
4. Kök kopya güncellenir.
5. Aynı kopya ilgili `archive/vX.Y/` klasörüne eklenir.
6. GitHub ve canlı Vercel sürümü kontrol edilip kullanıcı onayına sunulur.

Bu belge kullanıcı onayı olmadan “onaylı sürüm belgesi” statüsü kazanmaz.

