# Özer Finans — Yeni sohbet devir notları

## v8.1.0-preview.11 — Kompakt ayar seçimleri

Görünüm ve para birimi seçimleri aynı kompakt segmented tasarımını kullanır. Görünen track 32 px, düğmenin dokunma alanı 44 px; genişlik en çok 300 px. Seçili gösterge 220 ms cubic-bezier geçişle kayar, metin rengi kısa geçişle değişir. Framework7 React Segmented strong göstergesi tema seçiminde, aynı çizim native para birimi grubunda kullanılır. prefers-reduced-motion durumunda mevcut ortak kurallar hareketi kapatır. Kullanıcının tema, renk, yüzey ve veri tercihleri değiştirilmez. Finans/API/cache/batch/auth/Upstash ve kullanıcı/yedek şemaları korunur; yeni dependency yok.

Build, hedefli dört genişlik/iki tema kontrolü ve genel regresyon geçti. Tema/para birimi ölçü eşlemesi, 44 px hedef, kayan göstergenin seçili konumu ve azaltılmış hareket davranışı kontrol edilir. Yalnız migration ön izlemesi; production/main v8.0 korunur. Gerçek iPhone ve canlı servis doğrulaması ayrıca gerekir.

## v8.1.0-preview.10 — Kullanılmayan kod ve kontrol tasarımı

Aktif girişler ve çağrı bağlantıları incelenerek çağrılmayan fetchFavoriteQuote, addPortfolioStat, destroyPortfolioDistributionCharts ve solidLegendLabels yardımcıları; kullanılmayan LoadingState bileşeni; eski detail-toggle/portfolio-detail-controls/show-chart-detail ve portfolio-stat/stats stilleri kaldırıldı. Artık çağrılmayan işlevlerin kaynakta varlığını arayan iki eski test temizlendi; kullanılan toplu fiyat akışı tarayıcı testinde korunuyor. React/native köprü handler’ları ve fallback renderer’ları hâlâ kullanıldığından korundu.

assets/component-system.css dönem/kıyas/tema/para birimi/portföy seçimlerini ortak 44 px geometri, tipografi, pill ve seçili durum kurallarına; eylem/onay/iptal/silme düğmelerini ortak kontrol biçimine bağlar. Mobil tab bar ve renk/yüzey ön izleme seçenekleri kendi amaçlarına uygun stillerini korur. Silme işlemleri kırmızı vurgulanır. Yeni dependency yok; finans/veri/API/cache/batch/auth/Upstash ve kullanıcı/yedek şemaları değişmez.

Build, genel regresyon, mevcut tarayıcı akışı ve tests/control-consistency.browser.cjs geçti. Kontrol tutarlılığı dört genişlik/iki temada gerçek computed style, dokunma yüksekliği, renk, taşma ve ekran görüntüleriyle doğrulandı. Sentetik veri kullanılır; gerçek iPhone/hesap/sağlayıcı doğrulaması değildir. Yalnız migration ön izlemesi; production/main v8.0 korunur.

## v8.1.0-preview.9 — Denetimde bulunan hataların giderilmesi

Alım tarihi ve portföy adındaki özel doğrulama hataları kullanıcı girdiyi düzelttiğinde temizlenir; DRIP kapatıldığında tarih hatası kaydı engellemez. Başarısız manuel grafik sorgusu eski fiyat/RSI grafiklerini ve görüntü verilerini kaldırır; CSV/PNG hem React hem native işlemde kilitlenir. Başarılı sorgu grafik ve dışa aktarımı geri açar. Başarısız arama ile boş sonuç ayrılır; gelişmiş aramada servis hatası tekrar deneme düğmesi sunar. Masaüstü ve ayarlar sürüm bilgisi package.json sürümünü kullanır. 320 px piyasa kartlarında fiyat ve değişim ayrı satırlara alınarak yüksek hassasiyet korunur.

Yeni dependency yok. Finans hesaplama algoritmaları, API/cache/batch, hesap/Upstash ve kullanıcı/portföy/yedek formatları korunur. loadPrice değişikliği kullanıcı sorgusunun hata durumu ve dışa aktarım geçerliliğiyle sınırlıdır; sağlayıcı kontratları değişmez. tests/audit-fixes.browser.cjs tarih/DRIP ve ad düzeltme, grafik hata/başarılı tekrar/dışa aktarım, arama hata/tekrar/boş sonuç, sürüm eşleşmesi ve dar ekran hassasiyetini izole sentetik verilerle doğrular. Build, hedefli test, genel regresyon ve 375/390/430/1024 px açık/koyu tarayıcı akışı geçti. Gerçek sağlayıcı/hesap ve fiziksel iPhone/Safari/PWA doğrulaması yapılmadı.

Yalnız migration/v8.1-framework7-overview ön izlemesi; main/production v8.0 korunur. Kalıcı yayın ayrıca kullanıcı onayı gerektirir.

## v8.1.0-preview.8 — Portföy ve Diğer ekranlarının kontrollü geçişi

`RemainingPages.jsx` kalan iki ekranı React + Framework7 Page kabuğuna alır. Portföy Bugün/Toplam ve rakam gizleme ile Diğer tema/bildirim kontrolleri React/Framework7 üzerinden mevcut işlemleri çağırır. Bildirim anahtarları mevcut tercihlerle eşleşir, klavye odağı ve erişilebilir adları vardır. Framework7 Toggle’ın React 19 kontrollü checkbox olay sırası çakışması, native olay sahibini koruyup dış tercihleri layout effect ile yansıtarak giderilir. Yeni dependency yok; mevcut Framework7 Toggle modülü kullanılır.

Hesap, yedek, portföy formları, varlık/nakit listeleri, portföy sıralama, dağılım/benchmark canvas’ları ve dinleyicileri aynı DOM düğümleriyle korunur. Finans/veri widget’larının JSX içinde yeniden yazılması bu kontrollü geçişin hedefi değildir. `renderPortfolio`, toplam/benchmark/temettü/fiyat hesaplama işlevleri, `createBackup`, `normalizeBackup`, `applyBackup`, portföy kayıt/geçiş işlevleri önceki kaynakla birebir aynıdır. API/cache/batch/auth/Upstash ve kullanıcı/portföy/yedek formatları değişmez. Mobil temel kontroller 44 px dokunma alanı alır; Varlıklar ikonu v8.0 ölçüsündedir. Uzun native formlar kısa iPhone ekranında ve safe-area içinde kaydırılır. Diğer’de sürüm bilgisi gerçek ön izleme sürümünü gösterir.

Hedefli doğrulama ayrı sentetik storage bağlamında: dört genişlik/iki tema, v8.0 finans çıktısı, portföy oluştur/adlandır/sırala/sil/geri al, hisse ekle/düzenle/sil/geri al, nakit, boş ekran, tercih/klavye anahtarları, kısa form/safe-area, yedek indir/geri yükle ve yerel hesap ekranı geçişi. Build, pilot tarayıcı akışı ve genel regresyon geçti; konsol/runtime hatası yok. Fiziksel iPhone kurulumu/klavye/standalone ve gerçek hesap senkronizasyonu ayrıca cihaz/hesap gerektirir; emülasyon bunları doğrulamaz.

Yalnız `migration/v8.1-framework7-overview` ön izlemesi; production/main v8.0 kalır. Kalan iki sayfanın planlanan kabuk geçişi tamamlanır; sonraki adım ön izlemenin gerçek iPhone ve hesapla kabul kontrolüdür. Kullanıcı kalıcı yayın için ayrıca onay vermeden production’a geçilmez.

## v8.1.0-preview.7 — Grafik araması, kayıtlı varlıklar ve Dönem Özeti

Grafik araması ve favori düğmesi ortak `AssetSearch.jsx` ile React’e taşındı. Mevcut arama/çözümleme servisleri ve gecikme kullanılır; kayıtlı varlık veya başka ekrandan seçim, yeni arama sorgusu başlatmadan girişe yansır. `ChartAssets.jsx` Favoriler/Portföy seçicisini Framework7 Segmented/Button ile çizer; seçim paneli kapatıp mevcut `loadPrice` akışına gider. `ChartSummary.jsx` hizmet katmanının biçimlenmiş görüntü modelini gösterir; JSX finans hesabı yapmaz. Gizli eski varlık listeleri boş kalır. Fiyat/RSI canvas’ları, MA, tarih girişi ve dinleyicileri korunur.

`loadPrice`, `fetchFavoriteDetail` ve `calculatePeriodSummary` önceki ön izleme ile birebir aynı. API/cache/batch/auth/Upstash ve kullanıcı/portföy/yedek formatları değişmez. Yeni dependency yok. Hedefli grafik testi ve v8.0 Dönem Özeti yazı/renk/boşluk eşlemesi geçti. Build, genel regresyon ve 375/390/430/1024 px açık/koyu tarayıcı akışı geçti; konsol/runtime hatası yok. Testler sentetik sağlayıcı verisi kullanır.

Yalnız `migration/v8.1-framework7-overview` ön izlemesi; main/production v8.0 korunur. Sonraki öneri Portföy mobil kabuğunu mevcut hesap/veri işlemleriyle taşımaktır; bu sürümde yapılmaz. Diğer ekranı, fiziksel iPhone/Safari/PWA ve canlı hesap/sağlayıcı doğrulaması kalan işlerdir.

## v8.1.0-preview.6 — Ayrıntı kaydırması ve Grafik kabuğu

Hisse ayrıntısında ortak stil gövdenin yükseklik sınırını kaldırıyor, dış dialog `overflow:hidden` ile uzun içeriği kesiyordu. Dialog flex sütun, gövde `min-height:0` ve ayrı scroll alanı oldu; başlık/alt düğmeler yerinde kalır. Mobil alt düğmeler safe-area boşluğu alır; yeni ayrıntı üstten açılır. 375/390/430/1024 px’de 640/500 px yüksekliklerde gerçek wheel/touch olaylarıyla kontrol edilir.

`ChartShell.jsx` Grafik sayfası, araç çubuğu ve dönem/özel tarih düğmelerini React + Framework7 Page/Segmented/Button ile çizer. Mevcut arama formu, fiyat/RSI canvas’ları, MA toggle, dönem özeti ve kayıtlı varlık seçici aynı DOM düğümleri/dinleyicileriyle korunur. Dönem ve araç işlemleri mevcut handler’lara yönlenir. Mobil düğmeler en az 44 px; Framework7 toolbar yüksekliği/katmanları sıfırlanarak grafikle çakışma önlenir. `loadPrice` ve `fetchFavoriteDetail` API/cache/hesaplama işlevleri birebir korunur. Yeni dependency veya veri alanı yok.

Framework7’nin indirme linklerini router olarak yakalaması engellenir (`a[download]` ve mevcut davet bağlantısı tarayıcıya bırakılır); CSV/PNG üretim mantığı değişmez; React PNG düğmesi mevcut hazırlama/kilit durumunu yansıtır. Sheet/popup açıkken eski aşağı çekerek yenileme başlayamaz. Hedefli kapsam: dört genişlik/iki tema, bağımsız ayrıntı kaydırma/odak, gerçek Chart.js/RSI, tek dönem sorgusu, özel tarih, öneri seçimi, favori/MA, mevcut arama/alarm pencereleri, gerçek CSV/PNG indirme ve masaüstü PNG save-picker yazma yolu, popup hareketi, PWA/safe-area, veri/yedek uyumluluğu ve genel regresyon geçti; konsol/runtime hatası yok. Fiziksel iPhone/Safari ve canlı sağlayıcı kontrolü yapılmaz.

Yalnız `migration/v8.1-framework7-overview` ön izlemesi; main/production v8.0 değişmez. Kalan migration işleri: Grafik arama/kayıtlı varlık/özet kontrolleri hâlâ eski DOM ile çalışır; Portföy ve Diğer taşınmadı. Sonraki öneri Grafik araması ve kayıtlı varlık seçimini mevcut servislerle React’e almaktır; bu sürümde uygulanmaz. Fiziksel iPhone kurulum/klavye/standalone ve canlı sağlayıcı uçtan uca kontrolü ayrıca gerekir.

## v8.1.0-preview.5 — React Favori Ayrıntısı

`src/overview/FavoriteDetail.jsx`, mevcut native `favoriteDetailDialog` içeriğini React ile çizer. Dialogun top-layer/arka plan, Escape, odak geri dönüşü ve ortak kaydırma kilidi korunur; Tab/Shift+Tab odağı içeride tutulur. Grafik/Alarm/Portföy düğmeleri adaptör üzerinden mevcut işlemlere gider. Mevcut `fetchFavoriteDetail` sorgu/cache/hesaplama işlevi birebir korunur. Biçimlenmiş görüntü modeli hizmet sınırında hazırlanır; JSX finans hesabı veya yeni fetch/timer içermez. Eski renderer pilot yüklenmezse kullanılabilir. Yeni dependency veya kullanıcı/depolama/yedek alanı yok.

375/390/430/1024 px açık/koyu v8.0 ayrıntı eşlemesi; yükleme/hata, kapatılan sorgunun yeni sembolü ezmemesi, odak/kaydırma kilidi ve üç mevcut ekrana geçiş; temel veri sayı/destek/kaynak/applicability durumları, logo yedek kaynağı ve PWA safe-area emülasyonu hedefli kontrolleri, build ve aşama sonu regresyon geçti. Konsol/runtime hatası yok. Fiziksel iPhone/Safari ve canlı sağlayıcı kontrolü yapılmaz. Yalnız `migration/v8.1-framework7-overview` ön izlemesi; main/production v8.0 değişmez. Sonraki öneri mevcut Chart.js/veri akışını koruyarak mobil Grafik ekranının kabuğunu taşımaktır; bu sürümde uygulanmaz.

## v8.1.0-preview.4 — React arama/piyasa ayarları ve hisse kartı eşlemesi

Favori ve piyasa araması `AssetSearch.jsx`, piyasa düzenleme popup’ı `MarketSettings.jsx` üzerinden React tarafından yönetilir. Mevcut birleşik arama, 400 ms gecikme, veri kaynakları ve kayıt işlemleri adaptör üzerinden kullanılır; geç gelen eski sorgular yeni sonuçları değiştirmez. Popup odak tuzağı, arka plan inert/kaydırma kilidi ve klavye ile sıralama sonrası odak korunur. Finans/API/cache/batch/auth/Upstash, kullanıcı/portföy/yedek formatları ve Portföy/Grafik/Diğer korunur. Yeni dependency yok.

Favori hisse satırları ve mevcut hisse ayrıntı kartı v8.0 ile aynı ölçü/yazı/renk/boşluk değerlerine eşlendi. Framework7’nin genel button genişliğinin eski düğmeleri tam satıra yayması giderildi; ayrıntı alt düğmeleri eski yerleşimini kullanır. Eski ayrıntı veri/hesaplama akışı yeniden yazılmaz.

Build, hedefli tarayıcı testi ve aşama sonu regresyon geçti. 375/390/430/1024 px açık/koyu karşılaştırma, manuel/otomatik yenileme, favori işlemleri, piyasa ekle/çıkar/sırala/boş liste, arama hata/gecikmiş yanıt, klavye odağı, PWA/safe-area emülasyonu ve veri formatı kontrolleri geçti. Fiziksel iPhone/Safari ve canlı sağlayıcı kontrolü yapılmadı. Yalnız `migration/v8.1-framework7-overview` ön izlemesi; main/production v8.0 değişmez. Sonraki öneri mevcut veri akışını koruyarak Favori Ayrıntısı görünümünü React’e taşımaktır; bu sürümde uygulanmaz.

## v8.1.0-preview.3 — DOM’dan bağımsız Özet ve sheet erişilebilirliği

Özet fiyat/favori görüntü modeli doğrudan mevcut quote/veri durumundan ve aynı formatlama/logo işlevlerinden üretilir. React devraldıktan sonra eski piyasa/favori listeleri boş tutulur; yalnız auth, gezinme, tema ve yenileme düğmesi gibi kabuk durumları dar DOM gözlemcisiyle izlenir. Arama formu mevcut dinleyicileriyle kalır. API/cache/batch/zamanlayıcı/finans hesapları, kullanıcı/yedek/portföy şemaları korunur.

Favori logoları mevcut kaynak sırasıyla yedek sağlayıcıya geçer. Framework7 işlem sheet’i dialog olarak etiketlenir; klavye odağı içeride kalır, Escape kapanışı odağı açan düğmeye döndürür. Arka plan inert yapılır ve mevcut modal kaydırma kilidi paylaşılır; eski dialoglara geçişte odak ve kilit çakışmaz. Boş piyasa listesinde ekleme yönlendirmesi, piyasa kartlarında erişilebilir fiyat etiketi vardır. v8.0 görsel eşlemesi korunur.

Hedefli test: DOM boşken fiyat/yenileme/favori işlemleri, logo yedek kaynağı, sheet odağı/arka plan kilidi, eksik önceki kapanış ve resmî fiyat zamanı, 375/390/430/1024px açık/koyu görsel eşleşme ve PWA safe-area emülasyonu. Genel regresyon aşama sonunda çalıştırılır. Canlı sağlayıcı ve fiziksel iPhone kontrolü kapsam dışıdır. Çalışma yalnız migration ön izlemesidir; main/production v8.0 değişmez. Yeni dependency yok. Sonraki aşama için arama ve piyasa ayarları bağımsız React bileşenlerine taşınabilir; Portföy/Grafik/Diğer bu sürümde yeniden yazılmaz.

## v8.1.0-preview.2 — Özet görünüm eşlemesi

React + Framework7 pilotu korunarak Özet ve mobil alt menü v8.0 ortak bileşen stillerine eşlendi. Ek Özet/tema satırı kaldırıldı; marka başlığı, kompakt piyasa kartları, Favoriler satırı, yıldız düğmesi, arama ve masaüstü yerleşimi eski ölçülerdedir. Finans/veri katmanları ve kullanıcı şemaları değişmez. Yalnız migration dalında ön izleme; production v8.0 kalır.

375/390/430/1024 px açık/koyu modda v8.0 etiketi ayrı tarayıcı bağlamında aynı sentetik verilerle karşılaştırılır: ekran görüntüleri ve bileşen ölçüleri/yazı/renk/yüzey/boşluk değerleri, mobil menü sabitliği, favori ve yenileme işlemleri, standalone safe-area ve regresyon kontrolleri. Canlı API ve fiziksel iPhone doğrulaması bu çevrimdışı kontrole dahil değildir.


Güncelleme: 30 Eylül 2026. Bu dosya kaynak kodun yerine geçmez; yeni oturum için başlangıç rehberidir.

## v8.1 pilot çalışması

`migration/v8.1-framework7-overview` yalnız ön izleme dalıdır; kalıcı sürüm v8.0. Kaynaklar `src/overview/{main.jsx,legacy-adapter.js,pilot.css}`; build `scripts/build-overview.mjs`. Dört ana sayfa React + Framework7 kabuğundadır; Özet/Grafik kontrolleri React tarafından çizilir, Portföy/Diğer temel kontrolleri mevcut hizmete yönlenir. Finans, auth ve yedek widget’ları mevcut DOM/dinleyicileri korur. Girişteki dar `OzerOverviewLegacy` sınırı finans, API, batch/cache/timer, auth, Upstash ve yedek şemalarını korur; fiyat görüntü modeli doğrudan hizmet durumundan üretilir; gizli eski fiyat listeleri boştur. JSX içine finans mantığı taşınmaz. `assets/overview-pilot/` üretildiği için Git’e alınmaz; Vercel build aynı çıktıyı oluşturur.

## v8.0 onaylı yayın

Kullanıcı v7.11 ön izlemesini 30 Eylül 2026 tarihinde onayladı ve sürümün **v8.0** (8.0.0) olarak yayınlanmasını istedi. Masaüstü menüsü ekrana sabitlendi; Portföy “Varlıklar” ekleme ikonu tüm ekranlarda 27×27px olarak hizalandı. Önceki v7.10 arşivi korunur; yeni kaynak archive/v8.0 ve v8.0 Git etiketiyle saklanır. Sabit üretim adresi değişmez.

## 1. Doğru kaynak ve mevcut durum

- Depo: https://github.com/ygtozr/finanstool
- Güncel kaynak: main. Yeni işe başlarken uzak main dalını kontrol edin; eski yerel kopyaya güvenmeyin.
- Kalıcı uygulama: https://finanstool.vercel.app
- Son onaylı uygulama: v8.0; sürüm 8.0.0, Git etiketi v8.0. Kullanıcı masaüstü menü ve varlık ikonu düzeltmelerini kalıcı yayın için açıkça onayladı.
- Eski v7.7 etiketi yeniden taşınmaz. Önceki main kaynağı 66a9355a6eb94612467a26e29792b484c607696f, archive/v7.7 altında korunur; yeni kaynak anı archive/v7.8 altındadır.
- Yayın doğrulaması: GitHub main/v8.0 eşleşmesi, Vercel commit durumu, sabit URL başlığı ve asset içerikleri kontrol edilmelidir. Bu belge tek başına dağıtımın başarılı olduğunu kanıtlamaz.
- Yerel doğrulama: regresyon ve 120 kombinasyon görünüm testi ile dört ekran/320–1440px etkileşim testi geçti. Fiziksel iPhone Safari/PWA kontrolü yapılmadı.

## 2. Son değişiklik

v8.0 masaüstü sol menüsünü ekran yüksekliğinde sabit tutar ve geniş ekranlarda ana çerçeveyle hizalar. Varlıklar ekleme düğmesi başlığın sağında 27×27px ölçüdedir; aramaya odaklama korunur.

v7.10, v7.9'un token/ChartTheme temelindeki mobil ekran bileşenlerini iOS fotoğraflarıyla daha yakın eşler. Favori Ayrıntısı, piyasa/favori kartları, grafik altı varlık listesi, portföy satırları ve Görünüm seçicileri güncellenmiştir. Favori ayrıntısındaki dokuz gösterge doğrudan karttadır; fiyat favoriyle aynı kompakt katmandan gelir. Nötr yüzeyler, beş renk/sekiz stil, A−/A+ ve yumuşak sıralama korunur. Ayrıntılar IOS_WEB_GORSEL_ESLEME.md içindedir.

Aktif görünüm dosyaları assets/appearance.js, assets/design-tokens.css, assets/component-system.css, assets/ios-screen-alignment.css, assets/chart-theme.js, assets/ios-parity.css ve assets/ios-parity.js. Eski appearance.css yüklenmez. Tercih localStorage içindeki finans-grafigi-appearance anahtarında ve yedeğin data.appearance alanında tutulur. Eski yedek için varsayılan Klasik/İnce Çizgi. Mod anahtarı finans-grafigi-theme olarak devam eder. API, lib, hesap/şifreleme ve finans hesaplamaları değiştirilmedi.

## 3. Kod haritası

- index.html: ana HTML, CSS, uygulama mantığı, grafikler, portföy, arama, veri yenileme, yedekleme.
- assets/appearance.*: renk ve stil; assets/auth-account.js: hesap/yerel mod/bulut eşitleme; assets/storage-events.js: yerel veri değişikliği bildirimi.
- assets/chart.umd.min.js: Chart.js; grafik gerektiğinde yüklenir.
- api/: Vercel Node.js uçları; prices toplu fiyat, quote grafik, search arama, tefas fonlar, gold altın, dividends-batch ve dividend-history temettü, account hesap yönlendirmesi.
- lib/auth-store.js ve lib/account-routes/: özel davetli e-posta/parola sistemi, oturumlar, Upstash ve şifreli kullanıcı durumu. Aktif altyapı Clerk/Neon değildir.
- manifest.webmanifest ve assets/icon-* / apple-touch-icon.png: PWA kimliği.
- tests/regression.test.js: mevcut regresyonlar. tests/appearance.browser.cjs: son görünüm testleri.
- onizleme/ ve tasarim-onerileri/: tarihsel tasarım örnekleri; gerçek uygulama olarak yayınlamayın.
- archive/: önceki sürüm kaynakları; .vercelignore bunları dağıtımdan dışlar.

Uygulama React/Next.js değildir: statik arayüz + Vercel API işlevleri. Kurulumda mevcut package.json ve pnpm-lock.yaml esas alınır. Finans hesaplama/yenileme altyapısını sırf tasarım için yeniden yazmayın.

## 4. Ürün ve çalışma kuralları

- Dört ana görünüm: Özet (piyasa ve favoriler), Grafik, Portföy, Diğer. Açılış Özet.
- Birden çok portföy, nakit, para birimi tercihleri, temettü yeniden yatırımı, TEFAS ve altın ürünleri vardır. Ayrıntılar teknik belgede.
- Türkçe, mobil öncelikli; kullanıcı çoğunlukla telefondan kontrol eder. Önizleme linki telefonda erişilebilir olmalı; korumalı Vercel linki oturum isteyebilir.
- Yeni tasarım/işlev önce önizleme ve kullanıcı onayı; kalıcı yayın daha sonra. Son sürüm v8.0 olduğundan sonraki sürüm adayı normalde v8.1 olur; kalıcılaştırmayı kendiliğinden yapmayın.
- Her onaylı sürümü GitHub'da koruyun, önceki sürümü arşivleyin, kapsamlı teknik belgeyi güncelleyin. Sabit üretim URL'sini değiştirmeyin.
- Periyodik yenilemeyi adaptif aralığa dönüştürme önerisi kullanıcı tarafından dışlanmıştır. Mevcut bölüm/görünürlük kontrollerini, batch ve önbelleği koruyun.
- Alarm uygulama kapalıyken çalışmaz; bağımsız push/e-posta servisi için yeni onay gerekir.
- Kod yedeği ile kişisel veri yedeği farklıdır. Portföy/favoriler depodan geri gelmez; yerel veriler cihazda, girişli veriler mevcut hesap kaydındadır.

## 5. Test ve doğrulama

Modern Node.js kullanın (son çalışma Node 24.19.0). Temel komut: node tests/regression.test.js veya npm test.

Görünüm testi için Playwright ve Chromium gerekir. PLAYWRIGHT_MODULE modül yolu, CHROMIUM_PATH tarayıcı yolu ile node tests/appearance.browser.cjs çalıştırılabilir. Bu test API yanıtlarını çevrimdışı taklit eder; 120 görünüm kombinasyonu, mobil/masaüstü taşma, düğme geometrisi, yerel tercih ve yedek geri yükleme kontrollerini kapsar. Gerçek sağlayıcı, canlı hesap senkronizasyonu veya fiziksel iPhone testi değildir.

Son v8.0 regresyon ve dört ekran/320–1440px testleri geçti. Ek etkileşim testi: node tests/ios-visual.browser.cjs (aynı Playwright ortamı). Yeni değişiklikte ilgili testleri çalıştırın. Üretim doğrulamasında HTTP başlığından fazlasına bakın: doğru sürüm, asset içerikleri, ilgili akış ve mümkünse tarayıcı hataları.

## 6. Bağlantılar ve sırlar

- GitHub erişimi ve Vercel bağlantısı yeni oturumda yeniden kontrol edilmelidir; sohbet metni yetki aktarmaz.
- Vercel projesi finanstool, takım ygtozr-9191s-projects. Git main gönderimi üretim dağıtımını tetikler; belge gönderimi de build başlatabilir.
- Ortam değişkenleri .env.example dosyasında adlarıyla listelenir. Değerleri GitHub'da veya sohbette paylaşmayın. Mevcut Vercel yapılandırmasını kullanın; anahtarları yeniden üretmeyin.
- Hesap verisi için mevcut Upstash kaydını koruyun. DATA_ENCRYPTION_KEY değiştirilmesi mevcut şifreli kayıtların okunmasını engelleyebilir.

## 7. Bu bilgisayardaki çalışma notu

v7.10 yayını Windows üzerinde finanstool-v77-theme-review çalışma ağacındaki preview/v7.10-styles-market-spacing dalından hazırlandı; kaynak GitHub main ve v7.10 etiketiyle doğrulanmalıdır. Bu dizin adı tarihsel olup sürüm kaynağı sayılmaz. iOS kaynakları bu web sürümünde değiştirilmedi.

Bu Windows ortamında varsayılan Git HTTPS helper bulunamadı; .tools/mingit/cmd/git.exe ile GIT_EXEC_PATH=.tools/mingit/mingw64/bin kullanıldı. Ağ sandbox içinde DNS engeline takılabildi; yetkili erişimle işlem yapıldı. Diğer bilgisayarlarda bu geçici ayarı körlemesine uygulamayın. Çalışma ortamını ve izinleri önce kontrol edin.

## 8. Yeni sohbetin ilk işi

Bu dosya, AGENTS.md, README.md ve URUN_VE_TEKNIK_TASARIM.md okunur. main, package.json, git status ve canlı sürüm karşılaştırılır. Doğrulanan başlangıç durumu kullanıcıya kısa bildirilir. Sonra kullanıcının yeni talebi beklenir; yalnız bu dosyayı okumak üretime değişiklik yapma onayı değildir.
