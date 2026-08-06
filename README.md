# Finans Tool v3.5

Finans kodu girerek günlük kapanış fiyatlarını grafik üzerinde gösteren web uygulaması.

## Kullanım

- ABD hisseleri: `AAPL`, `MSFT`
- BIST hisseleri: `.IS` eki ile, örneğin `THYAO.IS`, `ASELS.IS`
- Süre seçenekleri: 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, 5 yıl veya özel başlangıç tarihi
- Birden fazla ürün aynı grafikte karşılaştırılabilir; farklı para birimlerinde tüm seriler USD bazında gösterilir.
- Ana ekrandaki piyasa özet kartları önemli endeks, kur ve varlıkların son durumunu gösterir.

Uygulama Vercel üzerinde çalışır ve fiyat verilerini sunucu tarafındaki veri uç noktaları üzerinden alır.

## Canlı favori kartları

v3.3 ile favoriler, referans görseldeki yatay kart düzeninde güncel fiyatı ve günlük net/yüzde değişimi gösterir. Veriler 15 saniyede bir otomatik yenilenir.

## Portföy dağılım grafikleri

v3.4 ile Portföy ekranına güncel değer bazlı varlık dağılımı ve para birimi dağılımı grafikleri eklendi. Farklı para birimleri bulunan portföylerde dağılımlar karşılaştırılabilir olması için USD bazında hesaplanır.

## Portföy performans karşılaştırması

v3.5 ile portföy performansı S&P 500, Nasdaq, BIST 100, Bitcoin veya aramayla seçilen başka bir ölçütle karşılaştırılabilir. Portföy ve ölçüt serileri aynı başlangıç noktasından yüzde değişim olarak gösterilir; 1 ay, 3 ay, 6 ay ve 1 yıl süreleri desteklenir.

## Veri sağlayıcı sürekliliği

v3.3 ile Yahoo Finance birincil kaynak olarak kullanılır. Birincil kaynak başarısız olduğunda desteklenen ABD hisseleri ve ETF’lerde Nasdaq, diğer kodlarda ise ikincil Yahoo erişim noktası otomatik devreye girer. Arama servisi de Yahoo ile Nasdaq arasında otomatik geçiş yapar.

## Veri yedekleme

v3.3 ile favoriler, portföy pozisyonları, fiyat alarmları, piyasa özeti ve tema ayarı JSON dosyası olarak indirilebilir. Geri yüklerken mevcut verilerle birleştirme veya tüm verilerin yerine koyma seçilebilir.

## Sürüm düzeni

Mevcut çalışma sürümü: **v3.5**

Dört aşamalı geliştirme planının ilk aşaması tamamlandı: kalıcı portföy ekranı, güncel değer ve kâr/zarar hesapları ile temettü listesi eklendi. İkinci aşamada fiyat alarmları ve piyasa/ürün türü filtreli gelişmiş arama eklendi. Üçüncü aşamada CSV/PNG dışa aktarma, kalıcı açık/koyu tema ve mobil görünüm iyileştirmeleri eklendi. Dördüncü aşamada canlı piyasa özeti, bütünleşik testler ve son arayüz düzenlemeleri tamamlandı. Dört aşama da tamamlandığında kalıcı sürüm numarası kullanıcı onayıyla belirlenir.
