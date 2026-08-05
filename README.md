# Finans Tool v3.1

Finans kodu girerek günlük kapanış fiyatlarını grafik üzerinde gösteren web uygulaması.

## Kullanım

- ABD hisseleri: `AAPL`, `MSFT`
- BIST hisseleri: `.IS` eki ile, örneğin `THYAO.IS`, `ASELS.IS`
- Süre seçenekleri: 1 hafta, 1 ay, 3 ay, 6 ay, 1 yıl, 5 yıl veya özel başlangıç tarihi
- Birden fazla ürün aynı grafikte karşılaştırılabilir; farklı para birimlerinde tüm seriler USD bazında gösterilir.
- Ana ekrandaki piyasa özet kartları önemli endeks, kur ve varlıkların son durumunu gösterir.

Uygulama Vercel üzerinde çalışır ve fiyat verilerini sunucu tarafındaki veri uç noktaları üzerinden alır.

## Veri yedekleme

v3.1 ile favoriler, portföy pozisyonları, fiyat alarmları, piyasa özeti ve tema ayarı JSON dosyası olarak indirilebilir. Geri yüklerken mevcut verilerle birleştirme veya tüm verilerin yerine koyma seçilebilir.

## Sürüm düzeni

Mevcut çalışma sürümü: **v3.1**

Dört aşamalı geliştirme planının ilk aşaması tamamlandı: kalıcı portföy ekranı, güncel değer ve kâr/zarar hesapları ile temettü listesi eklendi. İkinci aşamada fiyat alarmları ve piyasa/ürün türü filtreli gelişmiş arama eklendi. Üçüncü aşamada CSV/PNG dışa aktarma, kalıcı açık/koyu tema ve mobil görünüm iyileştirmeleri eklendi. Dördüncü aşamada canlı piyasa özeti, bütünleşik testler ve son arayüz düzenlemeleri tamamlandı. Dört aşama da tamamlandığında kalıcı sürüm numarası kullanıcı onayıyla belirlenir.
