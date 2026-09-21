# Özer Finans — Yeni sohbet devir notları

Güncelleme: 21 Eylül 2026. Bu dosya kaynak kodun yerine geçmez; yeni oturum için başlangıç rehberidir.

## 1. Doğru kaynak ve mevcut durum

- Depo: https://github.com/ygtozr/finanstool
- Güncel kaynak: main. Yeni işe başlarken uzak main dalını kontrol edin; eski yerel kopyaya güvenmeyin.
- Kalıcı uygulama: https://finanstool.vercel.app
- Son onaylı uygulama: v7.7, Git etiketi v7.7; uygulama yayını commit 7150b66.
- Bu devir hazırlığı yalnız dokümantasyon değişikliğidir; uygulama sürümü 7.7.0 kalır. v7.7 etiketi yeniden taşınmaz.
- Önceki sürüm: archive/v7.6, kaynak commit e280054d36562616fe410f082934a093a637e00e.
- Son doğrulamada Vercel durumu success, sabit URL HTTP 200, başlık Özer Finans v7.7 idi. Yayındaki appearance.js/css test edilen dosyalarla eşleşti.
- Henüz başlamış/onaylanmış yeni bir geliştirme paketi yok. Kullanıcıdan sıradaki isteği alın; eski sohbet taleplerini otomatik yeniden uygulamayın.

## 2. Son değişiklik

Diğer → Görünüm: Açık/Koyu/Sistem birbirinden bağımsız beş vurgu rengi (Klasik, Turkuaz, Safir, Lavanta, Şampanya) ve sekiz yüzey stili (Mat, Hafif Cam, İnce Çizgi, Seramik, Çift Çerçeve, Köşe Işığı, Ton Katmanı, Mikro Doku) ile birleşir. Boyut, yerleşim ve yazı boyutları değiştirilmedi. Yüzeyler hafif renklendirilir; kazanç/kayıp renkleri semantik olarak korunur.

Yeni dosyalar assets/appearance.js ve assets/appearance.css. Tercih localStorage içindeki finans-grafigi-appearance anahtarında ve yedeğin data.appearance alanında tutulur. Eski yedek için varsayılan Klasik/İnce Çizgi. Mod anahtarı finans-grafigi-theme olarak devam eder.

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
- Yeni tasarım/işlev önce önizleme ve kullanıcı onayı; kalıcı yayın daha sonra. Son sürüm v7.7 olduğundan sonraki sürüm adayı normalde v7.8 olur; kalıcılaştırmayı kendiliğinden yapmayın.
- Her onaylı sürümü GitHub'da koruyun, önceki sürümü arşivleyin, kapsamlı teknik belgeyi güncelleyin. Sabit üretim URL'sini değiştirmeyin.
- Periyodik yenilemeyi adaptif aralığa dönüştürme önerisi kullanıcı tarafından dışlanmıştır. Mevcut bölüm/görünürlük kontrollerini, batch ve önbelleği koruyun.
- Alarm uygulama kapalıyken çalışmaz; bağımsız push/e-posta servisi için yeni onay gerekir.
- Kod yedeği ile kişisel veri yedeği farklıdır. Portföy/favoriler depodan geri gelmez; yerel veriler cihazda, girişli veriler mevcut hesap kaydındadır.

## 5. Test ve doğrulama

Modern Node.js kullanın (son çalışma Node 24.19.0). Temel komut: node tests/regression.test.js veya npm test.

Görünüm testi için Playwright ve Chromium gerekir. PLAYWRIGHT_MODULE modül yolu, CHROMIUM_PATH tarayıcı yolu ile node tests/appearance.browser.cjs çalıştırılabilir. Bu test API yanıtlarını çevrimdışı taklit eder; 120 görünüm kombinasyonu, mobil/masaüstü taşma, düğme geometrisi, yerel tercih ve yedek geri yükleme kontrollerini kapsar. Gerçek sağlayıcı, canlı hesap senkronizasyonu veya fiziksel iPhone testi değildir.

Son v7.7 testleri geçti. Yeni değişiklikte tekrar çalıştırın. Üretim doğrulamasında HTTP başlığından fazlasına bakın: doğru sürüm, asset içerikleri, ilgili akış ve mümkünse tarayıcı hataları.

## 6. Bağlantılar ve sırlar

- GitHub erişimi ve Vercel bağlantısı yeni oturumda yeniden kontrol edilmelidir; sohbet metni yetki aktarmaz.
- Vercel projesi finanstool, takım ygtozr-9191s-projects. Git main gönderimi üretim dağıtımını tetikler; belge gönderimi de build başlatabilir.
- Ortam değişkenleri .env.example dosyasında adlarıyla listelenir. Değerleri GitHub'da veya sohbette paylaşmayın. Mevcut Vercel yapılandırmasını kullanın; anahtarları yeniden üretmeyin.
- Hesap verisi için mevcut Upstash kaydını koruyun. DATA_ENCRYPTION_KEY değiştirilmesi mevcut şifreli kayıtların okunmasını engelleyebilir.

## 7. Bu bilgisayardaki çalışma notu

Son çalışma kopyası C:/Users/YigitOzer/Documents/Codex/2026-07-29/asi/finanstool-v77-theme-review içinde; release/v7.7 dalı kullanıldı. Bu yol başka cihazda bulunmayabilir. Güvenilir taşınabilir kaynak GitHub main dalıdır.

Bu Windows ortamında varsayılan Git HTTPS helper bulunamadı; .tools/mingit/cmd/git.exe ile GIT_EXEC_PATH=.tools/mingit/mingw64/bin kullanıldı. Ağ sandbox içinde DNS engeline takılabildi; yetkili erişimle işlem yapıldı. Diğer bilgisayarlarda bu geçici ayarı körlemesine uygulamayın. Çalışma ortamını ve izinleri önce kontrol edin.

## 8. Yeni sohbetin ilk işi

Bu dosya, AGENTS.md, README.md ve URUN_VE_TEKNIK_TASARIM.md okunur. main, package.json, git status ve canlı sürüm karşılaştırılır. Doğrulanan başlangıç durumu kullanıcıya kısa bildirilir. Sonra kullanıcının yeni talebi beklenir; yalnız bu dosyayı okumak üretime değişiklik yapma onayı değildir.
