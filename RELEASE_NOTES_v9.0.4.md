# Özer Finans v9.0.4

Güncelleme: Kullanıcı onayıyla sürüm numarası korunarak seans etiketi/saat/fiyat/yüzde tek satıra alındı. Önceki v9.0.4, archive/v9.0.4-before-single-line dalında korunur. Mevcut sürüm kaydı ve etiketi güncellenmiştir. 5 dk bar/gecikme açıklaması araç ipucundadır. Build, finans/sağlayıcı regresyonu ve dört genişlik/iki tema seans geometri testi geçti.

- Aktif portföye Kazanç dağılımı eklendi: Bugün/Toplam katkıları, ortak para birimi, kazanç/kayıp çubukları ve ilk beşten sonrası için Tümünü göster.
- Desteklenen ABD hissesi/ETF favori kartı ve ayrıntısına ayrı seans öncesi/sonrası fiyatı, normal kapanışa göre yüzde, ET saati eklendi; 5 dk bar açıklaması araç ipucundadır. Mevcut kart düzeni ve iki eylemi korunur.
- Seans dışı veri normal fiyatı, portföy değerini veya alarm fiyatını değiştirmez. Yalnız aktif seans ve geçerli/taze veri gösterilir; sağlayıcı hatası, eski veri veya seans bitişinde ek satır kaldırılır. Gecikmeli olabilir.
- Finans hesaplamaları, mevcut TTL/batch/cache, auth/Upstash ve kullanıcı/yedek yapıları korunur; yeni dependency yoktur.
- Önceki v9.0.3 etiketi ve archive/v9.0.3 dalında korunur.

Doğrulama: build, finans regresyonu, seans sağlayıcı birim testleri ve tam tarayıcı regresyonu; 375/390/430/1024, açık/koyu, kazanç katkı toplamları, kur/nakit, gizlilik, seans öncesi/sonrası, eskime/zamanlayıcı, eski fiyat/tuşlar, gezinme/katmanlar ve PWA. Sentetik testler gerçek sağlayıcı erişimini, gerçek zaman garantisini veya fiziksel iPhone kabulünü doğrulamaz.
