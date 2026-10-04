# Özer Finans — Yeni sohbet devir notları
## v8.1.0-preview.2 — Özet görünüm eşlemesi

React + Framework7 pilotu korunarak Özet ve mobil alt menü v8.0 ortak bileşen stillerine eşlendi. Ek Özet/tema satırı kaldırıldı; marka başlığı, kompakt piyasa kartları, Favoriler satırı, yıldız düğmesi, arama ve masaüstü yerleşimi eski ölçülerdedir. Finans/veri katmanları ve kullanıcı şemaları değişmez. Yalnız migration dalında ön izleme; production v8.0 kalır.

375/390/430/1024 px açık/koyu modda v8.0 etiketi ayrı tarayıcı bağlamında aynı sentetik verilerle karşılaştırılır: ekran görüntüleri ve bileşen ölçüleri/yazı/renk/yüzey/boşluk değerleri, mobil menü sabitliği, favori ve yenileme işlemleri, standalone safe-area ve regresyon kontrolleri. Canlı API ve fiziksel iPhone doğrulaması bu çevrimdışı kontrole dahil değildir.


Güncelleme: 30 Eylül 2026. Bu dosya kaynak kodun yerine geçmez; yeni oturum için başlangıç rehberidir.

## v8.1 pilot çalışması

`migration/v8.1-framework7-overview` yalnız ön izleme dalıdır; kalıcı sürüm v8.0. Kaynaklar `src/overview/{main.jsx,legacy-adapter.js,pilot.css}`; build `scripts/build-overview.mjs`. Özet React + Framework7, diğer ekranlar mevcut kod. Girişteki dar `OzerOverviewLegacy` sınırı finans, API, batch/cache/timer, auth, Upstash ve yedek şemalarını korur; gizli eski Özet DOM’u geçici görüntü modelidir. JSX içine finans mantığı taşınmaz. `assets/overview-pilot/` üretildiği için Git’e alınmaz; Vercel build aynı çıktıyı oluşturur.

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
