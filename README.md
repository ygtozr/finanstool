# Özer Finans v9.0.1

## v9.0.2-preview.5 — Daha yakın Aktif Portföy ikonları

Yalnız Aktif Portföy başlığındaki dört ikonun yatay hedefi 40 px olur; yükseklik 44 px ve görünen yüzey 32 px kalır. Yüzey aralığı 12 yerine 8 px olur, hedefler çakışmaz. Hedefli Chromium kontrolü dört genişlik/iki temada ölçü ve gerçek elementFromPoint tıklanabilirliğini doğrular. Finans/veri sistemi değişmez; yeni dependency yok. Yalnız preview; main/production v9.0.1 korunur.

## v9.0.2-preview.4 — Yakın ikonlar ve kompakt eylem yüzeyleri

Aktif Portföy başlığındaki ikon hedefleri arasındaki ek boşluk kaldırılır; eş 32 px yüzeyler 44 px dokunma alanı içinde kalır. Toplam ve seçili portföy para birimi tuşları da aynı 32 px yumuşak kare yüzeye ve 18 px simgeye geçer; mevcut para birimi davranışı korunur. Hisse ayrıntısındaki üç eylemin görünen yüksekliği 44 yerine 38 px olur; 44 px hedef ve tema vurgu rengi korunur.

Hedefli kontrol dört genişlik/iki tema, ikon ölçüleri ve aralığı, para birimi tuşları, 38 px eylem yüzeyi ve beş vurgu rengini kapsar. Yeni dependency yok; finans/API/veri formatları değişmez. Yalnız fix/v9.0.2-compact-controls ön izlemesi; main/production v9.0.1 korunur. Sentetik Chromium kontrolü canlı sağlayıcı/fiziksel iPhone doğrulaması değildir.

## v9.0.2-preview.3 — Sabit ölçüler ve yumuşak kare kontroller

Kontroller ortak 9 px köşe kullanır; eylem ve seçim yüksekliği 44 px ile sabitlenir. Portföy seçimleri her genişlikte eş sütunlara yerleşir; uzun ad ellipsis kullanır, tam ad seçim alanında ve mevcut araç ipucu/erişilebilir ad içinde korunur. Aktif Portföy yanındaki oluştur/adlandır/sil/gizle tuşları ve Toplam yanındaki göz 44 px hedef içinde eş 32 px yumuşak kare yüzey kullanır. Silme rengi, tema vurgu renkleri ve mevcut gizlilik tercihi korunur.

Hedefli kontrol dört genişlik, iki tema ve üç yazı boyutunda sabit/eş ölçüleri, taşmayı ve gizlilik eşleşmesini kapsar. Yeni dependency yok; finans/API/veri formatları değişmez. Yalnız fix/v9.0.2-compact-controls ön izlemesi; main/production v9.0.1 korunur. Sentetik Chromium kontrolü canlı sağlayıcı/fiziksel iPhone doğrulaması değildir.

## v9.0.2-preview.2 — Yuvarlak düğmeler ve eş gizlilik kontrolleri

Ayarlar ve diğer eylem/seçim düğmeleri ortak yuvarlak köşe kullanır; kart ve liste satırlarının geometrisi korunur. Toplam yanındaki göz tuşu 44 px dokunma alanı içinde 32 px dairesel yüzey kullanır. Aktif Portföy başlığına aynı tuş eklenir; ikisi mevcut gizlilik tercihini birlikte değiştirir. Hisse ayrıntısındaki alt eylemler ve normal sheet eylemleri seçili vurgu rengine uyar; silme rengi korunur.

Hedefli tarayıcı kontrolü 375/390/430/1024 px açık/koyu görünüm, iki gizlilik tuşunun eşleşmesi, yuvarlak ayar seçimleri ve beş vurgu rengini kapsar. Finans, veri ve kullanıcı formatları değişmez; yeni dependency yok. Yalnız fix/v9.0.2-compact-controls ön izlemesi; main/production v9.0.1 korunur. Sentetik testler canlı sağlayıcı ve fiziksel iPhone doğrulaması değildir.

## v9.0.2-preview.1 — Kompakt kontrol yüzeyleri ve tam metin

Bugün/Toplam, portföy kısayolları, dönem/kıyas ve varlık seçicileri 44 px dokunma alanı içinde yaklaşık 32 px kompakt yüzey kullanır. Uzun ad gerektiğinde kontrolü büyütür; portföy adları ellipsis yerine satıra bölünür. Kontrol yazısı kullanıcının boyut tercihine bağlı olarak bir piksel küçülür; padding ve yazı ağırlığı sadeleşir. Eylem düğmelerinde uzun metin satıra sığar. Renkler, seçili vurgu ve klavye odağı korunur. Ayarlardaki kompakt segmented seçimler ve alt navigasyon kendi yüzeylerini korur.

Hedefli kontrol testi gerçek portföy adlandırmasıyla uzun ad, üç yazı boyutu, 375/390/430/1024 px açık/koyu görünüm, metin taşması ve 44 px dokunma alanını doğrular. Finans/API/cache/batch/auth/Upstash ve kullanıcı/yedek formatları değişmez; yeni dependency yok. Yalnız fix/v9.0.2-compact-controls ön izlemesi; main/production v9.0.1 korunur. Sentetik tarayıcı testi fiziksel iPhone/canlı servis kabulü değildir.

## v9.0.1 — Onaylı kalıcı sürüm

Kullanıcı v9.0.1-preview.2 için kalıcı yayın onayı verdi. Mobil alt menü içeriklerin üstünde fixed kalır; Framework7 View kabuklarının gereksiz yüksek katmanı kaldırılır. Giriş ekranı açıkken alt menü render edilmez. Popup/sheet/native dialog önceliği, safe-area, eski ayar kartları, tam genişlik ve vurgu renkli seçimler korunur. Finans/API/cache/batch/auth/Upstash ve kullanıcı/yedek formatları değişmez; yeni dependency yok.

Güncel kaynak main ve v9.0.1 etiketi; kalıcı adres https://finanstool.vercel.app. Önceki v9.0.0, etiketi ve archive/v9.0.0 dalıyla korunur. Yayın iş akışı GitHub Release kaydını RELEASE_NOTES_v9.0.1.md ile oluşturur. Aşağıdaki preview ve eski kalıcı sürüm notları tarihsel kayıttır.

Build, genel regresyon ve pilot tarayıcı akışı; sabit/dokunulabilir alt menü, kısa ekran, dört genişlik/iki tema/sekiz materyal katman denetimi. Sentetik testler gerçek hesap/sağlayıcı ve fiziksel iPhone kabul kontrolü değildir.

## v9.0.1-preview.2 — Katman denetimi ve giriş ekranı

Katman denetimi arama/görünüm menülerini dört genişlik, iki tema ve sekiz yüzey stilinde gerçek elementFromPoint kontrolüyle kapsar; popup, native dialog, geri al bildirimi ve giriş ekranında tıklanabilirlik kontrol edilir. Menüdeki Framework7 hidden özelliği toolbar-hidden dönüşümüyle gizleme yapıyordu; sabit menünün transform:none kuralı bunu iptal ettiğinden giriş ekranında menü görünmeye devam edebiliyordu. MobileTabBar, authGate açıkken render edilmez; hesap işlemleri ve auth protokolü değişmez. Önceki fixed/z-index düzeltmesi korunur.

Yeni dependency yok; finans/API/cache/batch/auth/Upstash ve kullanıcı/yedek formatları korunur. Yalnız fix/v9.0.1-mobile-navigation ön izlemesi; main/production v9.0.0 değişmez. Test verileri sentetiktir; fiziksel iPhone ve canlı sağlayıcı testi değildir.

## v9.0.1-preview.1 — Sabit mobil alt menü

Framework7 View katmanı z-index:5000 iken alt menü 44 seviyesinde kaldığından sayfa içeriği menünün önüne geçebiliyordu. Belge kaydırması kullanan entegre View kabuklarının katmanı auto olur; alt menü açıkça fixed ve z-index:1000 kullanır. Sheet/popup/native dialog kendi üst katmanlarını korur. Menü geometrisi, safe-area ve masaüstü sidebar davranışı korunur. Finans/API/cache/batch/auth/kullanıcı/yedek yapıları değişmez; yeni dependency yok.

Hedefli tarayıcı testi dört sayfada üst/orta/alt kaydırma konumlarında menü düğmelerinin gerçek elementFromPoint ile dokunulabilirliğini, 375/390/430 px ve 844/500 px yüksekliklerde açık/koyu görünümü, açık renk menüsü katmanını, sheet önceliği/kapanışını ve 1024 px masaüstünü kontrol eder. Yalnız fix/v9.0.1-mobile-navigation ön izlemesi; main/production v9.0.0 korunur.

## v9.0.0 — Onaylı kalıcı sürüm

Kullanıcı v9.0.0 adıyla kalıcı yayını açıkça onayladı. Ayarlar preview.11 sürümündeki ayrı kart düzenine geri döner; preview.12'nin beş birleşik grubu ve grup stilleri kaldırılır. Tam genişlikte üçlü seçimler, mevcut vurgu renkli kayan gösterge, kısa açıklamalar ve eş genişlikli finans rakamları korunur. React + Framework7 kabukları ve önceki denetim düzeltmeleri kalıcı sürüme dahildir. Yeni dependency yok; finans/API/cache/batch/auth/Upstash ve kullanıcı/portföy/yedek formatları değişmez.

Sürüm başlığı, tüm sayfa rozetleri, footer ve ayarlar 9.0.0 gösterir. Kalıcı adres https://finanstool.vercel.app; güncel kaynak main ve v9.0.0 etiketi. Önceki v8.0 etiketi korunur; yayın iş akışı archive/v8.0 dalını ve GitHub Release kaydını oluşturur. Sürüm notları RELEASE_NOTES_v9.0.0.md içindedir. Aşağıdaki preview notları tarihsel kayıttır; production için eski v8.0 ifadeleri bu sürümle geçersiz olur.

Doğrulama: build, genel regresyon ve dört genişlik/iki tema tarayıcı akışı. Çevrimdışı sentetik test, gerçek hesap/veri sağlayıcısı veya fiziksel iPhone doğrulaması değildir.

## v8.1.0-preview.12 — Tam genişlik ve vurgu rengi

Görünüm ve para birimi üçlü seçimleri satırın tamamını doldurur. Kayan gösterge mevcut vurgu rengini, seçili metin ona uygun kontrast rengini kullanır; 32 px görünür track, 44 px dokunma alanı ve azaltılmış hareket desteği korunur. Ayarlar beş ortak yüzeyde gruplanır: Tercihler, Veri ve alarmlar, Yedek ve depolama, Hesap, Destek. İç bölümler ince ayraçlarla ayrılır; başlık ve açıklamalar sadeleşir. Finans rakamları tabular-nums kullanır. Kullanıcının tema/renk/stil tercihi değiştirilmez; finans/API/cache/batch/auth/Upstash ve kullanıcı/yedek formatları korunur. Yeni dependency yok.

Build, genel regresyon, tam pilot tarayıcı akışı ve hedefli 375/390/430/1024 px açık/koyu kontrol testi geçti. Tam genişlik, vurgu rengi, gruplama, finans rakamları, dokunma alanı ve taşma doğrulandı. Tarayıcı testleri sentetik veriler kullanır; fiziksel iPhone ve canlı servis doğrulaması değildir. Yalnız migration ön izlemesi; production/main v8.0 korunur.

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
## v8.1 React + Framework7 Özet pilotu — ön izleme

Dal: `migration/v8.1-framework7-overview`; main ve kalıcı v8.0 değişmez. `npm run build` (veya `pnpm run build`) yalnız Özet pilotunu `assets/overview-pilot/` altında üretir. React/React DOM + Framework7 React, esbuild ile derlenir. `pnpm install --frozen-lockfile` mevcut kilidi kullanır; yalnız esbuild kurulum betiğine izin verilir.

Özet, piyasa/favori bileşenleri ve ayrıntısı, ortak arama, mobil tab bar, sheet/popup ve Grafik kontrolleri React tarafından çizilir. Portföy/Diğer React + Framework7 sayfa kabuğuna ve temel UI kontrollerine sahiptir; finans, auth ve yedek widget’ları aynı DOM düğümleri/dinleyicileriyle korunur. `OzerOverviewLegacy` hizmetin görüntü modelini ve mevcut işlemlerini sunar; fiyat listeleri gizli DOM’dan okunmaz. React ek fiyat fetch veya timer oluşturmaz. Finans algoritmaları, API ve depolama formatları eski hizmet katmanında kalır.

CSS katmanı Framework7’yi eski stillerin altına yerleştirir; pilot stilleri kendi köklerine sınırlanır. iOS tema, mevcut renk/yüzey/yazı tercihi ve açık/koyu mod korunur. CSS katmanları için Safari 15.4+ gerekir. Framework7’nin gömülü fontu için CSP’ye yalnız `font-src self data:` eklenir. Yeni veri alanı veya depolama anahtarı eklenmez.

Hedefli kontrol: `CHROMIUM_PATH=/usr/bin/chromium npm run test:overview`. Aşama sonunda `npm test`. 375/390/430/1024px, açık/koyu mod, manuel/otomatik tek batch, favori ekle/çıkar/ayrıntı/sıralama/kalıcılık, eski ekran gezinmesi, standalone emülasyonu, gerçek CSS safe-area inset değerleri ve hata toparlanması geçti; konsol hatası yok. Aşama sonu regresyon da geçti. Fiziksel iPhone/Safari/PWA ve canlı hesap/sağlayıcı kontrolleri ayrı yapılmalıdır.


Yeni sohbet / geliştirici başlangıcı: [Devir notları](DEVIR_NOTLARI.md). Çalışma kuralları: [AGENTS.md](AGENTS.md). Ayrıntılı tanım: [Ürün ve teknik tasarım](URUN_VE_TEKNIK_TASARIM.md).

Özer Finans; piyasa verilerini izlemek, hisse ve ETF fiyat grafiklerini teknik göstergelerle incelemek, Favorileri takip etmek ve kişisel portföy performansını hesaplamak için geliştirilmiş responsive web uygulamasıdır.

## v8.0: masaüstü gezinme ve varlık ekleme ikonu

- Masaüstü (≥1024px) sol menü ekran yüksekliğinde tutulur; sayfa kaydırılırken gezinme düğmeleri yerinde kalır. Kısa ekranlarda menünün kendi kaydırması kullanılabilir.
- Portföy “Varlıklar” ekleme düğmesi tüm ekranlarda 27×27px ölçüdedir ve başlığın sağında hizalanır; aramaya geçiş korunur.
- Kullanıcı 30 Eylül 2026 tarihinde ön izlemeyi onayladı ve sürümün v8.0 olarak yayınlanmasını istedi. Önceki [v7.10 arşivi](archive/v7.10/) korunur; [v8.0 kaynak arşivi](archive/v8.0/) ve `v8.0` etiketi bu sürümü saklar.
- Regresyon ve sentetik verili Chromium kontrolleri geçti: dört sayfa, açık/koyu tema, 320–1440px, menü konumu, ekleme ikonu ve arama odağı. Fiziksel iPhone/PWA ve canlı sağlayıcı testi değildir.
- Finans hesapları, API, hesap/portföy verileri ve yedek şeması değişmez.

## Canlı uygulama

- Vercel: https://finanstool.vercel.app
- Arayüz dili: Türkçe
- Güncel kalıcı sürüm: **v8.0**

## v7.10: iOS ekran düzeni ve görünüm seçicileri

Altı iOS ekranı referans alınarak kompakt piyasa ve favori kartları, tam ekran Favori Ayrıntısı, grafik altındaki tek sütunlu varlık listesi, Portföy “Varlıklar” satırları ve Görünüm kontrolleri webde eşlendi. Favori Ayrıntısı fiyatı favori kartıyla aynı kısa fiyat verisinden alır; dokuz temel/teknik gösterge ayrı açma düğmesi olmadan bilgi kartında görünür. Görünüm renk ve yüzey seçicileri diğer ayar seçicileriyle aynı çerçeveli düğme biçimini kullanır. Beş renk ve sekiz yüzey stili korunur.

- Önceki kalıcı sürüm: [v7.9 arşivi](archive/v7.9/) ve `v7.9` Git etiketi.
- Bu sürüm: [v7.10 arşivi](archive/v7.10/) ve `v7.10` Git etiketi.
- Yerel doğrulama: regresyon, 120 görünüm kombinasyonu, dört sayfanın 320–1440px etkileşimi ve yeni favori ayrıntısı/liste kontrolleri. Fiziksel iPhone Safari/PWA ve canlı veri sağlayıcıları bu test kapsamında değildir.

## v7.9: iOS–web tasarım sistemi ve grafik uyumu

iOS ekranları referans alınarak ortak renk, yazı, aralık, köşe ve yüzey tokenları oluşturuldu. Mobil, tablet ve masaüstü düzenleri ayrı eşiklerle uyumlandı. Favori kartlarının logo/ad/fiyat grubu dikey ortalandı; grafik ve RSI, iOS'a yakın yükseklikte ayrı kartlar olarak çiziliyor. Grafik tarih etiketleri dönemle uyumlu ve yatay; iki grafiğin inceleme balonları aynı tarihte eşzamanlı hareket ediyor. Grafik renkleri ortak `ChartTheme` üzerinden yönetiliyor. Veri servisleri, hesaplar ve JSON yedek şeması değişmedi.

- [Tasarım ve ekran eşleme notları](IOS_WEB_GORSEL_ESLEME.md).
- Önceki kalıcı sürüm: [v7.8 arşivi](archive/v7.8/) ve `v7.8` Git etiketi.
- v7.9 kaynak anı: [v7.9 arşivi](archive/v7.9/) ve `v7.9` Git etiketi.
- Doğrulama: regresyon, 120 tema kombinasyonu, dört ekran ve 320–1440px etkileşim/taşma testleri. Fiziksel iPhone Safari/PWA ve canlı sağlayıcı testi yapılmadı.

## v7.8: iOS görsel uyarlaması

iOS kaynak tasarımı temel alınarak web kartları, renkler, düğmeler, seçenek menüleri, anahtarlar, alt gezinme, grafikler ve ayarlar yenilendi. Favoriler, portföyler ve piyasa özeti basılı tutma ile kontrollü/yumuşak sıralanır. A−/A+, para birimi ve görünüm seçenekleri mevcut tercih/yedek yapısını kullanır. Veri servisleri, hesap altyapısı ve hesaplamalar değiştirilmedi.

- [Ayrıntılı görsel eşleme ve platform sınırları](IOS_WEB_GORSEL_ESLEME.md)
- Önceki kalıcı kaynak: [v7.7 arşivi](archive/v7.7/), kaynak commit `66a9355`.
- Doğrulama: regresyon, 120 görünüm kombinasyonu, dört ekran/320–1440px, dokunmatik sıralama/iptal ve grafik MA etkileşimleri. Fiziksel iPhone Safari/PWA testi yapılmadı.
- Git etiketi: `v7.8`. Sabit yayın adresi değişmez. Kişisel veriler sürüm arşivine dahil edilmez.

## v7.7: bağımsız renk ve yüzey stili

Diğer → Görünüm bölümünden Açık/Koyu/Sistem modu, beş vurgu rengi ve sekiz yüzey stili bağımsız seçilir. Ölçüler ve işlevler korunur. Tercihler cihazda, JSON yedeğinde ve mevcut hesap senkronizasyonunda saklanır. Önceki sürüm: [v7.6 arşivi](archive/v7.6/).

Tarayıcı görünüm testi: `node tests/appearance.browser.cjs` (Playwright kurulu olmalı; `PLAYWRIGHT_MODULE` ve `CHROMIUM_PATH` ile ortam yolları verilebilir).

## v7.6: fiyat zamanı alanı düzeltmesi

- Toplu fiyat servisindeki `asOf` alanı hem sunucuda hem istemcide ortak `marketTimestamp` alanına dönüştürülür.
- Vercel Runtime Cache içinde v7.5 biçiminde saklanmış eski kayıtlar okunurken de zaman alanı tamamlanır; önbelleğin kendiliğinden süresinin dolmasını beklemek gerekmez.
- Piyasa Özeti ve Favoriler, fiyat verisi geçerli bir zaman taşıdığı sürece “bilinmiyor” yerine fiyatın gerçek oluşum tarih ve saatini gösterir.

## v7.5: soğuk batch gecikmesi ve ortak sembol önbelleği

- Tarayıcı, Piyasa Özeti, Favoriler ve Alarmlar için tek `/api/prices` isteği göndermeye devam eder.
- Kompakt fiyatlar yalnız istek listesinin tamamına göre değil, her sembol için ayrı Vercel Runtime Cache kaydında tutulur. Favori listesi değişse bile daha önce alınmış semboller yeniden kullanılabilir.
- Her sembolün tek önbellek kaydı son başarılı cevabı 24 saat korur; tazelik veri türüne göre denetlenir ve sağlayıcı geçici olarak yanıt vermezse zaman damgalı eski veri açıkça `stale` olarak döner. Tek kayıt kullanımı gereksiz ikinci önbellek yazımını önler.
- BIST sembolleri tek TradingView Türkiye taramasında, döviz çiftleri tek TradingView Forex taramasında gruplanır. TEFAS ve diğer sağlayıcılar kontrollü eşzamanlılıkla çalışmaya devam eder.
- Önbellek süreleri veri türüne göre ayrılmıştır: standart/BIST/döviz 15 saniye, altın 60 saniye, TEFAS 5 dakika.
- Elle yenileme, her alt istek için benzersiz zaman damgası üretmez; sabit `refresh=1` yolu ile sembol önbelleğini kontrollü olarak tazeler.
- Grafik sayfasındaki ilk istekte CDN’yi zorla atlayan `reload` kaldırılmıştır. Grafik kütüphanesi Grafik düğmesine ilk dokunuş veya klavye odağında da hazırlanır.
- GitHub’daki bütün onaylı sürüm arşivleri korunur; `archive/` klasörü `.vercelignore` ile çalışma dağıtımından çıkarılarak yaklaşık 50 MB geçmiş dosyanın her önizlemeye taşınması önlenir.

## v7.4: istemci ve Vercel verimliliği

- Piyasa, Favoriler ve Alarmlar tam fiyat geçmişi yerine mevcut `/api/prices` servisinin kompakt toplu modunu paylaşır.
- Temettü takvimi beş satırı tamamlamak için 5 yıllık OHLC dizilerini tarayıcıya indirmez; batch yanıtı yaklaşan ve son geçmiş olayları birlikte taşır.
- Temettü ve fiyat batch işlemleri sağlayıcılara kontrollü eşzamanlılıkla erişir; DRIP sonuçları 24 saat cihazda ve CDN'de saklanır.
- Otomatik portföy yenilemesi yalnız aktif portföyü işler. Toplam Portföy ayrı hesaplanır ve aynı sembolün normalize edilmiş piyasa verisi paylaşılır.
- Portföy kartları fiyat yenilemesinde yeniden oluşturulmaz; logo ve etkileşimler korunup yalnız değer metinleri güncellenir.
- Ana fiyat grafiği RSI ve MA tamamlanmadan gösterilir; göstergeler paralel hazırlanıp sonradan eklenir. Chart.js ilk ekran boşta kaldığında arka planda hazırlanır; Grafik sekmesine geçiş, devam eden başka bir yenileme yüzünden bir sonraki tura ertelenmez.
- Temettü takviminin tarih sütunu masaüstünde ve mobilde genişletilmiştir; yıl bilgisi dar ekranda kesilmeden korunur.
- Tarih/para biçimleyicileri önbelleğe alınmış, SMA kayan toplamla O(n) hesaplanmış ve istemci API önbelleğine boyut sınırı eklenmiştir.
- Otomatik yenileme aralıkları ve piyasa türüne göre zamanlama davranışı bu pakette değiştirilmemiştir.

## v7.3: hızlı portföy ve temettü takvimi

- Temettü satırının solundaki tarih öncelikle ödeme tarihidir; ödeme tarihi sağlanmıyorsa hak kullanım tarihi yedek olarak kullanılır. Hisse kodunun yanında yinelenen “Ödeme tarihi” metni gösterilmez.
- Temettü toplamı ve adet bilgisi, Ayarlar bölümündeki fiyat basamak sayısı tercihine göre biçimlendirilir.
- Temettü satırları dar mobil ekranda da tarih, sembol ve tutarı tek satırda gösterir; uzun semboller tutar alanını aşağı itmeden kısaltılır.
- Temettü para tutarlarında Otomatik hassasiyet standart iki basamak kullanır; 4 veya 6 basamak ancak kullanıcı açıkça seçerse uygulanır.
- Portföy fiyatları temettü geri yatırım hesabını beklemeden çizilir; DRIP sonuçları hazır olduğunda adetler arka planda güncellenir.
- Portföydeki yaklaşan temettüler ürün başına tarayıcı isteği yerine tek `/api/dividends-batch` çağrısıyla alınır.
- Son başarılı temettü takvimi cihazda saklanıp sayfa açılır açılmaz gösterilir; yaklaşan olaylar, geçmiş tamamlama ve kur dönüşümü arka planda yenilenir.
- E-posta, şifre ve bütün arama alanları yazılan küçük-büyük harf biçimini olduğu gibi gösterir. Sembol ve ürün eşleştirmesi büyük-küçük harf duyarsız çalışmaya devam eder.

- Temettü takvimi yaklaşan kayıtları önceliklendirir; beş satır dolmazsa en yeni geçmiş kayıtlarla tamamlar.
- Liste beş gerçek kayıtla sınırlıdır; yeni kayıt geldiğinde en eski kayıt listeden çıkar.
- Temettü tutarı ve adet bilgisi Ayarlar bölümündeki fiyat hassasiyetini kullanır.
- Ödeme tarihi mobil ekranda kesilmeden gösterilir.

## v7.2: istek, yenileme ve alarm optimizasyonu

- Otomatik yenileme yalnız ekranda açık olan Özet, Grafik veya Portföy sayfasını günceller.
- Piyasa Özeti, Favoriler, Portföy ve alarm fiyatları sembol başına ayrı Vercel isteği yerine tek `/api/prices` çağrısında toplanır; aynı sembol birden fazla bölümdeyse yalnız bir kez istenir.
- Otomatik yenileme, elle yenileme ve görünürlük dönüşü aynı istek kilidini kullanır; üst üste binen aynı URL çağrıları birleştirilir.
- Tek, kendini istek tamamlandıktan sonra yeniden kuran zamanlayıcı kullanılır. Yavaş yanıt sürerken ikinci yenileme başlamaz.
- Aynı cihazda birden fazla Safari/PWA sekmesi açıksa yalnız lider sekme otomatik sorgu yapar. Sekme arka plana geçince liderlik bırakılır.
- Kapalı piyasalar en az 60 saniye, TEFAS günlük verileri en az 5 dakika aralıkla sorgulanır; açık piyasa ve kripto kullanıcının seçtiği aralığı izler.
- Aktif alarmların sembolleri tekilleştirilip aynı toplu fiyat katmanından alınır; bir alarm denetimi bitmeden ikincisi başlamaz ve normal otomatik yenilemeyle çakışmaz.
- “Kapalı” yenileme seçeneğinde otomatik istek gönderilmez; manuel ve aşağı çekerek yenileme kullanılabilir.
- v7.2 kullanıcı tarafından onaylanmış kalıcı ana sürümdür.

## v7.1: davetli üyelik ve şifreli eşitleme

- Açılışta kullanıcı, doğrudan Özer Finans e-posta/şifresiyle giriş yapabilir veya hiçbir veri göndermeden yerel kullanıma devam edebilir.
- Clerk ve Neon kullanılmaz. Şifre özetleri, davetler, oturumlar ve şifrelenmiş uygulama kayıtları Vercel’e bağlı ücretsiz Upstash Redis üzerinde tutulur.
- İlk yönetici tek kullanımlık kurulum koduyla oluşturulur. Sonraki kullanıcılar yalnız yöneticinin ürettiği 24 saat geçerli davet bağlantısıyla kayıt olabilir.
- Şifreler güçlü `scrypt` parametreleriyle tek yönlü özetlenir; finans verisi Upstash’e yazılmadan önce AES-256-GCM ile şifrelenir.
- Oturum 30 gün süreli `HttpOnly`, `Secure`, `SameSite=Lax` çerezle hatırlanır; giriş denemeleri oran sınırına tabidir.
- İlk girişte mevcut cihaz verisinin hesaba aktarılıp aktarılmayacağı kullanıcıya sorulur. Yerel misafir verisi ayrı tutulur ve çıkışta geri yüklenir.
- Bulut kayıtları iyimser sürüm denetimi kullanır; başka cihazdaki daha yeni kayıt sessizce ezilmez. Bağlantı kesilirse yerel kopya korunur.
- Hesap açma zorunlu değildir. Yönetici, Diğer sayfasındaki Kullanıcı Yönetimi kartından davet bağlantısı oluşturabilir.
- v7.1 davetli üyelik ve şifreli eşitleme sürümü olarak kalıcı biçimde yayınlanmıştır.

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
