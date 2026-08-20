const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const priceApi=fs.readFileSync(path.join(root,'api','price.js'),'utf8');
const fundamentalsApi=fs.readFileSync(path.join(root,'api','fundamentals.js'),'utf8');
const dividendsApi=fs.readFileSync(path.join(root,'api','dividends.js'),'utf8');

function extractFunction(source,name){
  const start=source.indexOf('function '+name);
  assert.notEqual(start,-1,name+' bulunamadı');
  const brace=source.indexOf('{',start);
  let depth=0;
  for(let index=brace;index<source.length;index++){
    if(source[index]==='{')depth++;
    if(source[index]==='}'){
      depth--;
      if(depth===0)return source.slice(start,index+1);
    }
  }
  throw new Error(name+' kapanış parantezi bulunamadı');
}

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);
scripts.forEach((script,index)=>assert.doesNotThrow(()=>new Function(script),'İstemci betiği '+(index+1)+' sözdizimi'));
assert.doesNotThrow(()=>new Function('module','exports','require',priceApi),'Fiyat API sözdizimi');
assert.doesNotThrow(()=>new Function('module','exports','require',fundamentalsApi),'Temel veri API sözdizimi');
assert.doesNotThrow(()=>new Function('module','exports','require',dividendsApi),'Temettü API sözdizimi');

const clientFunctions=['fillMissingRates','calculateRsi','sma','calculatePeriodSummary'].map(name=>extractFunction(scripts[0],name)).join('\n');
const {fillMissingRates,calculateRsi,sma,calculatePeriodSummary}=new Function(clientFunctions+';return {fillMissingRates,calculateRsi,sma,calculatePeriodSummary};')();

assert.deepEqual(fillMissingRates([null,null,2,null,3,null]),[null,null,2,2,3,3],'Gelecekteki kur geçmişe taşınmamalı');
assert.deepEqual(sma([null,1,2,3],3),[null,null,null,2],'Eksik değer içeren MA penceresi hesaplanmamalı');
const rsi=calculateRsi([1,2,3,2,4,5,4,6,7,8,7,9,10,11,12,13,14,13,15,16],14);
assert.ok(Number.isFinite(rsi.at(-1))&&rsi.at(-1)>=0&&rsi.at(-1)<=100,'Wilder RSI geçerli aralıkta olmalı');
const period=calculatePeriodSummary([{time:1,close:100},{time:2,close:80},{time:3,close:125},{time:4,close:110}]);
assert.deepEqual({last:period.last,low:period.low,high:period.high},{last:{time:4,close:110},low:{time:2,close:80},high:{time:3,close:125}},'Dönem özeti değer ve tarih noktalarını doğru seçmeli');
assert.ok(Math.abs(period.change-10)<1e-9,'Dönem değişimi doğru hesaplanmalı');
assert.ok(Math.abs(period.position-66.6666666667)<1e-9,'Güncel fiyatın dönem aralığındaki konumu doğru hesaplanmalı');

const sandbox={module:{exports:{}},exports:{},require,URLSearchParams,URL,AbortSignal,fetch:()=>{throw new Error('testte ağ çağrısı yapılmamalı')}};
vm.runInNewContext(priceApi+'\nmodule.exports._test={numberValue,cleanQuery};',sandbox);
assert.equal(sandbox.module.exports._test.numberValue('N/A'),null,'N/A sıfır fiyat olmamalı');
assert.equal(sandbox.module.exports._test.numberValue('-'),null,'Eksik fiyat sıfır olmamalı');
assert.equal(sandbox.module.exports._test.numberValue('$1,234.56'),1234.56);
const fundamentalSandbox={module:{exports:{}},exports:{},AbortSignal,fetch:()=>{throw new Error('testte ağ çağrısı yapılmamalı')}};
vm.runInNewContext(fundamentalsApi+'\nmodule.exports._test={numberValue,trailingEps};',fundamentalSandbox);
assert.equal(fundamentalSandbox.module.exports._test.numberValue('0.35%'),0.35,'Temettü yüzdesi doğru ayrıştırılmalı');
assert.equal(fundamentalSandbox.module.exports._test.numberValue('4,623,874,049,400'),4623874049400,'Piyasa değeri doğru ayrıştırılmalı');
assert.equal(fundamentalSandbox.module.exports._test.trailingEps({data:{earningsPerShare:[{type:'PreviousQuarter',earnings:1},{type:'PreviousQuarter',earnings:2},{type:'PreviousQuarter',earnings:3},{type:'PreviousQuarter',earnings:4}]}}),10,'TTM EPS son dört gerçekleşmiş çeyrekten hesaplanmalı');
const dividendSandbox={module:{exports:{}},exports:{},AbortSignal,fetch:()=>{throw new Error('testte ağ çağrısı yapılmamalı')}};
vm.runInNewContext(dividendsApi+'\nmodule.exports._test={parseDate,parseAmount};',dividendSandbox);
assert.equal(dividendSandbox.module.exports._test.parseAmount('$0.27'),0.27,'Temettü tutarı doğru ayrıştırılmalı');
assert.equal(new Date(dividendSandbox.module.exports._test.parseDate('09/15/2026')).toISOString().slice(0,10),'2026-09-15','Temettü tarihi doğru ayrıştırılmalı');

assert.equal((html.match(/fresh=/g)||[]).length,0,'Önbelleği bozan fresh parametresi kalmamalı');
assert.match(html,/let priceRequestId = 0;/,'Ana grafik yarış koruması bulunmalı');
assert.doesNotMatch(html,/function compareStock\s*\(/,'Ana grafik karşılaştırma işlevi kaldırılmalı');
assert.doesNotMatch(html,/let compareData\s*=/,'Ana grafik karşılaştırma durumu kaldırılmalı');
assert.doesNotMatch(html,/data-action=['"]compare['"]/,'Favorilerde karşılaştırma düğmesi kalmamalı');
assert.match(html,/className='favorite-menu-trigger'/,'Favorilerde hızlı işlem düğmesi bulunmalı');
assert.match(html,/menuAction\('Grafiği Aç'[^]*menuAction\('Fiyat Alarmı Kur'[^]*menuAction\('Portföye Ekle'[^]*menuAction\('Favorilerden Çıkar'/,'Hızlı işlem menüsü dört temel eylemi içermeli');
assert.match(html,/id="favoriteDetailDialog"[^>]*aria-labelledby="favoriteDetailTitle"/,'Favoriler için erişilebilir hızlı detay paneli bulunmalı');
assert.match(html,/open\.addEventListener\('click',\(\)=>openFavoriteDetail\(item\)\)/,'Favori kartı hızlı detay panelini açmalı');
assert.doesNotMatch(html,/closest\('\.favorite-card'\)\)openView\('chart'\)/,'Favori kartı panel açılırken arka planda Grafik sekmesine geçmemeli');
assert.doesNotMatch(html,/activeView\.focus\(/,'Sekme paneline programatik odak verilerek mavi kenar çizgisi oluşturulmamalı');
assert.doesNotMatch(html,/class="app-view[^>]*tabindex="-1"/,'Sekme kapsayıcıları Safari tarafından yeniden odaklanabilir olmamalı');
assert.match(html,/\.app-view:focus,\.app-view:focus-visible \{ outline:none !important; \}/,'Safari sekme kapsayıcısı odak çerçevesi bastırılmalı');
assert.match(html,/body\.modal-open \{ position:fixed; left:0; right:0; width:100%; \}/,'Açık panel arka plan kaydırmasını sabitlemeli');
assert.match(html,/event\.target===favoriteDetailDialog\)closeFavoriteDetail\(\)/,'Panel dışındaki karartılmış alana dokunmak hızlı detayı kapatmalı');
assert.match(html,/Günlük düşük – yüksek[\s\S]*52 hafta düşük – yüksek[\s\S]*Piyasa değeri[\s\S]*F\/K[\s\S]*Temettü verimi[\s\S]*Hacim[\s\S]*RSI \(14\)/,'Hızlı detay temel ekonomik ve teknik göstergeleri içermeli');
assert.match(html,/Number\.isFinite\(value\)\?formatter\(value\):fallback/,'Eksik detay verileri tahmin edilmeden uygun durum metniyle gösterilmeli');
assert.match(html,/\/api\/fundamentals\?symbol=/,'Hızlı detay ayrı temel veri servisiyle zenginleştirilmeli');
assert.match(html,/F\/K \(TTM\)/,'F/K değeri gerçekleşmiş son dört çeyrek bazında etiketlenmeli');
assert.match(html,/Temel veri kaynağı:/,'Temel veri kaynağı panelde açıklanmalı');
assert.match(html,/id="favoriteDetailChart"[^>]*>Grafiği Aç<[\s\S]*id="favoriteDetailAlarm"[^>]*>Alarm Kur<[\s\S]*id="favoriteDetailPortfolio"[^>]*>Portföye Ekle</,'Hızlı detay alt eylemleri bulunmalı');
assert.match(html,/role="listbox"/,'Arama önerileri listbox olmalı');
assert.match(html,/marketTimestamp:Number\(result\.meta\?\.regularMarketTime\)\|\|points\.at\(-1\)\.time/,'Favori zamanı gerçek piyasa verisinden gelmeli');
assert.match(html,/favoriteUpdated\.textContent='Son güncelleme: '/,'Favoriler başlığında yenileme zamanı gösterilmeli');
assert.doesNotMatch(html,/favoriteUpdated\.textContent='Son fiyat zamanı: '/,'Favoriler başlığında fiyat zamanı gösterilmemeli');
assert.match(html,/id="periodSummaryTitle">Dönem Özeti/,'Dönem özeti grafiğe eklenmeli');

assert.match(html,/FinansTool v4\.3/,'Aday sürüm adı v4.3 olmalı');
assert.match(html,/viewport-fit=cover/,'iOS güvenli alanı için viewport-fit=cover bulunmalı');
assert.match(html,/apple-mobile-web-app-capable/,'iOS bağımsız web uygulaması meta bilgisi bulunmalı');
assert.match(html,/\.mobile-bottom-nav \{ position:fixed !important;[^}]*bottom:0;/,'Mobil alt menü ekranın fiziksel altına sabitlenmeli');
assert.match(html,/padding:6px 6px calc\(6px \+ env\(safe-area-inset-bottom,0px\)\)/,'Güvenli alan menüyü yukarı taşımak yerine iç dolgu olarak uygulanmalı');
assert.doesNotMatch(html,/bottom:max\(8px,env\(safe-area-inset-bottom\)\)/,'Güvenli alan menünün tamamını yukarı taşımamalı');
assert.match(html,/id="periodRangeFill"/,'Dönem içi fiyat konum barı bulunmalı');
assert.match(html,/className='favorite-market-time'/,'Her favoride fiyat zamanı alanı bulunmalı');
assert.ok(html.indexOf('class="periods"')<html.indexOf('id="periodSummaryTitle"'),'Süre seçimi dönem özetinden önce gelmeli');
assert.ok(html.indexOf('id="portfolioList"')<html.indexOf('id="portfolioSymbol"'),'Portföy araması hisse listesinden sonra gelmeli');
assert.match(html,/\.benchmark-stats \{ grid-template-columns:repeat\(3,minmax\(0,1fr\)\); gap:6px; \}/,'Mobil getiri kıyası üç sütun olmalı');
assert.ok(html.indexOf('class="chart-wrap"')<html.indexOf('id="rsiWrap"')&&html.indexOf('id="rsiWrap"')<html.indexOf('class="periods"'),'RSI ana grafiğin hemen altında olmalı');
assert.match(html,/const keepExistingPortfolio=Boolean\(portfolioList\.querySelector\('\.portfolio-row'\)\)/,'Portföy yenilemesi mevcut kartları veri gelene kadar korumalı');
assert.match(html,/window\.scrollTo\(\{top:scrollBeforeCommit,behavior:'auto'\}\)/,'Portföy yenilemesi kaydırma konumunu korumalı');
assert.match(html,/portfolioAllocationChart\?updateDistributionChart\(portfolioAllocationChart/,'Varlık pasta grafiği yeniden oluşturulmadan güncellenmeli');
assert.match(html,/portfolioCurrencyChart\?updateDistributionChart\(portfolioCurrencyChart/,'Para birimi pasta grafiği yeniden oluşturulmadan güncellenmeli');
assert.match(html,/chart\.update\('none'\)/,'Pasta grafik güncellemesi animasyonsuz olmalı');
const toolbarMarkup=html.match(/<div class="toolbar">([\s\S]*?)<\/div><div id="meta"/)?.[1]||'';
assert.match(toolbarMarkup,/Gelişmiş Arama[\s\S]*Fiyat Alarmı[\s\S]*CSV İndir[\s\S]*PNG İndir/,'Grafik araç çubuğu dört temel işlemi içermeli');
assert.doesNotMatch(toolbarMarkup,/maToggle|rsiToggle/,'MA ve RSI kontrolleri üst araç çubuğunda kalmamalı');
assert.match(html,/class="chart-wrap"><button id="maToggle" class="chart-ma-toggle"[^>]*aria-pressed="false">MA50\/100\/200<\/button><canvas id="priceChart"/,'MA düğmesi ana grafiğin sol üstüne gömülmeli');
assert.match(html,/\.chart-ma-toggle \{[^}]*top:48px; left:58px;/,'MA düğmesi eksen ve açıklamalardan uzağa sağ alta alınmalı');
assert.doesNotMatch(html,/id="rsiToggle"/,'RSI açma kapama düğmesi kaldırılmalı');
assert.match(html,/\.rsi-wrap\{height:150px;display:block;margin-top:0\}/,'RSI grafiği daima görünür ve ana grafiğe bitişik olmalı');
assert.match(html,/columns\.push\(\{name:'RSI \(14\)'/,'RSI verisi dışa aktarmada daima yer almalı');
assert.match(html,/id="chartFavoritesToggle"[^>]*>Favoriler<[\s\S]*id="chartPortfolioToggle"[^>]*>Portföy</,'Grafik sayfasının altında Favoriler ve Portföy seçicileri bulunmalı');
assert.match(html,/className='chart-asset-item'[\s\S]*loadPrice\(item\.symbol\)/,'Kayıtlı hisse seçimi ana grafiği güncellemeli');
assert.match(html,/id="favoriteAddForm"[^>]*[\s\S]*id="favoriteSearch"[^>]*placeholder="Favorilere hisse ekle"/,'Özet favorilerinin altında ekleme araması bulunmalı');
assert.match(html,/function addOverviewFavorite\(item\)[\s\S]*favorites\.push\(\{symbol,name\}\)[\s\S]*refreshFavoriteQuotes\(\)/,'Özet aramasından seçilen hisse favorilere eklenip fiyatı yenilenmeli');
assert.match(html,/main \{ width:100%; max-width:100%; margin:48px auto 0; padding:14px 12px 24px;/,'Mobil sayfanın altındaki gereksiz iç boşluk azaltılmalı');
assert.match(html,/id="cashAddButton"[^>]*>\+ Nakit Ekle<[\s\S]*id="cashCurrency"[\s\S]*TRY · Türk Lirası[\s\S]*USD · ABD Doları[\s\S]*EUR · Euro[\s\S]*GBP · İngiliz Sterlini/,'Portföye dört para biriminde nakit ekleme akışı bulunmalı');
assert.match(html,/const cashKey = 'finans-grafigi-cash-balances'/,'Nakit bakiyeleri kalıcı olarak saklanmalı');
assert.match(html,/cashBalances\.forEach\(balance=>\{[\s\S]*totalValue\+=convertedValue[\s\S]*allocationValues\.push\(\{label:'Nakit '/,'Nakit bakiyeleri portföy toplamı ve dağılımına katılmalı');
assert.match(html,/data-benchmark-range="5d">1 Hafta<[\s\S]*data-benchmark-range="5y">5 Yıl<[\s\S]*data-benchmark-range="custom">Şu Tarihten İtibaren/,'Performans karşılaştırması grafik ekranındaki tüm süre seçeneklerini içermeli');
assert.match(html,/function benchmarkQuery\(\)[\s\S]*period1=[\s\S]*period2=/,'Özel başlangıç tarihi karşılaştırma sorgusuna dönüştürülmeli');
assert.match(html,/\/api\/dividends\?symbol=/,'Portföy yaklaşan temettü uç noktasını kullanmalı');
assert.match(dividendsApi,/exOrEffDate[\s\S]*paymentDate[\s\S]*sort\(\(a,b\)=>\(a\.exDate\|\|a\.paymentDate\)-\(b\.exDate\|\|b\.paymentDate\)\)/,'Temettü API hak kullanım ve ödeme tarihlerini yakından uzağa sıralamalı');
assert.match(html,/allDividends\.sort\(\(a,b\)=>a\.date-b\.date\)\.slice\(0,5\)/,'Takvim yalnız yaklaşan en yakın beş temettüyü göstermeli');
assert.match(html,/\.portfolio-row-head \{ display:grid; grid-template-columns:34px minmax\(0,1fr\) auto 28px;/,'Portföy kartı logo, kimlik, değer ve silme düğmesini tek kompakt satıra yerleştirmeli');
assert.match(html,/className='portfolio-compact-line'[\s\S]*compactLine\.append\(details,profitValue\)/,'Adet, maliyet ve kâr zarar ikinci kompakt satırda bilgi kaybı olmadan gösterilmeli');
assert.match(html,/assetSymbol:primarySymbol\|\|currentSymbol\(\)/,'Ana grafik veri serisi sade balon için hisse kodunu taşımalı');
assert.match(html,/context\.dataset\.assetSymbol\|\|context\.dataset\.label/,'Grafik veri balonu şirketin uzun adı yerine hisse kodunu kullanmalı');

console.log('FinansTool v4.3 regresyon testleri başarılı.');
