# Özer Finans — Bulut çalışma devri

Bu dosya yeni bir bulut çalışmasının kaynak ve sınırlarını belirtir. Uygulama verisi veya erişim anahtarı içermez.

## Kaynak

- Depo: https://github.com/ygtozr/finanstool
- Kalıcı uygulama: https://finanstool.vercel.app
- Son onaylı sürüm: `v7.10`; üretim kaynağı `main` ve Git etiketi `v7.10`.
- Temizlik/devir çalışması: `cleanup/v7.10-cloud-handoff` dalı. Bu dal önizleme niteliğindedir; kullanıcı onayı olmadan `main` ile birleştirilmez veya yeni kalıcı sürüm olarak yayımlanmaz.
- Başlangıç okuması: `AGENTS.md`, `DEVIR_NOTLARI.md`, `README.md`, `URUN_VE_TEKNIK_TASARIM.md`, `IOS_WEB_GORSEL_ESLEME.md`.

## Çalıştırma ve sınırlar

Uygulama React/Next.js değil; kökteki `index.html`, `assets/`, `api/` ve `lib/` dosyalarıyla çalışan statik JavaScript + Vercel Functions projesidir. `package.json` ile `pnpm-lock.yaml` birlikte tutulur. Modern Node.js (en az 20) ve pnpm kullanılır. `node tests/regression.test.js` temel testtir; `tests/appearance.browser.cjs` ve `tests/ios-visual.browser.cjs` için Playwright/Chromium gerekir. Tarayıcı testleri sentetik veri kullanır; gerçek sağlayıcıyı veya fiziksel iPhone'u doğrulamaz.

`archive/` onaylı sürüm anlarını, `onizleme/` ve `tasarim-onerileri/` tarihsel tasarımları tutar; hiçbiri güncel uygulama kaynağı değildir. Arşivde aynı içerikli dosyalar kasıtlıdır ve Git bunları blob düzeyinde tekilleştirir. Gelecekteki temizlikte geçmiş sürümleri silmeyin. Bu temizlik dalı yalnız aktif kökte referanssız eski stil, görsel ve boş dosyayı kaldırır; arşivleri ve uygulama mantığını değiştirmez.

Vercel ortam değişkenlerinin **yalnız adları** `.env.example` içindedir. Değerler depo veya sohbete aktarılmaz. `DATA_ENCRYPTION_KEY` değiştirilirse mevcut şifreli hesap verileri okunamayabilir. Kişisel favoriler/portföyler Git arşivinde değildir; tarayıcı yerel deposu veya mevcut hesap eşitlemesindedir. Bulut çalışmasına kişisel JSON yedeği koymayın.

## Bulutta ilk kontrol

1. GitHub `main` ve çalışma dalının güncel commitlerini, açık değişikliklerini ve Vercel bağlantısını doğrulayın.
2. Temizlik dalındaki silinen dosyaların `index.html`, aktif CSS/JS, API, manifest veya testler tarafından kullanılmadığını kontrol edin.
3. Regresyonu ve mümkünse mobil/masaüstü tarayıcı testlerini çalıştırın. Üretim davranışı değişmediği sürece uygulama sürümü `v7.10` kalır.
4. Önizleme sonucunu kullanıcıya gösterip onay bekleyin; `main` veya sabit üretim adresine kendiliğinden yayın yapmayın.

Kaynak devri kod ve yapılandırma adlarını kapsar; Vercel/Upstash erişimi ve kullanıcı verisi yeni oturuma otomatik aktarılmış varsayılmaz.
