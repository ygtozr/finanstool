# Özer Finans v9.0.4

- Aktif portföye Kazanç dağılımı eklendi: Bugün/Toplam katkıları, ortak para birimi, kazanç/kayıp çubukları ve ilk beşten sonrası için Tümünü göster.
- Desteklenen ABD hissesi/ETF favori kartı ve ayrıntısına ayrı seans öncesi/sonrası fiyatı, normal kapanışa göre yüzde, ET saati ve 5 dk bar etiketi eklendi. Mevcut kart düzeni ve iki eylemi korunur.
- Seans dışı veri normal fiyatı, portföy değerini veya alarm fiyatını değiştirmez. Yalnız aktif seans ve geçerli/taze veri gösterilir; sağlayıcı hatası, eski veri veya seans bitişinde ek satır kaldırılır. Gecikmeli olabilir.
- Finans hesaplamaları, mevcut TTL/batch/cache, auth/Upstash ve kullanıcı/yedek yapıları korunur; yeni dependency yoktur.
- Önceki v9.0.3 etiketi ve archive/v9.0.3 dalında korunur.

Doğrulama: build, finans regresyonu, seans sağlayıcı birim testleri ve tam tarayıcı regresyonu; 375/390/430/1024, açık/koyu, kazanç katkı toplamları, kur/nakit, gizlilik, seans öncesi/sonrası, eskime/zamanlayıcı, eski fiyat/tuşlar, gezinme/katmanlar ve PWA. Sentetik testler gerçek sağlayıcı erişimini, gerçek zaman garantisini veya fiziksel iPhone kabulünü doğrulamaz.
