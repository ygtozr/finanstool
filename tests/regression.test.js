const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const priceApi=fs.readFileSync(path.join(root,'api','price.js'),'utf8');

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

assert.equal((html.match(/fresh=/g)||[]).length,0,'Önbelleği bozan fresh parametresi kalmamalı');
assert.match(html,/let priceRequestId = 0;/,'Ana grafik yarış koruması bulunmalı');
assert.match(html,/const comparisonRequests = new Set\(\);/,'Karşılaştırma çift tıklama kilidi bulunmalı');
assert.match(html,/role="listbox"/,'Arama önerileri listbox olmalı');
assert.match(html,/marketTimestamp:Number\(result\.meta\?\.regularMarketTime\)\|\|points\.at\(-1\)\.time/,'Favori zamanı gerçek piyasa verisinden gelmeli');
assert.match(html,/favoriteUpdated\.textContent='Son güncelleme: '/,'Favoriler başlığında yenileme zamanı gösterilmeli');
assert.doesNotMatch(html,/favoriteUpdated\.textContent='Son fiyat zamanı: '/,'Favoriler başlığında fiyat zamanı gösterilmemeli');
assert.match(html,/id="periodSummaryTitle">Dönem Özeti/,'Dönem özeti grafiğe eklenmeli');

assert.match(html,/FinansTool v4\.2/,'Aday sürüm adı v4.2 olmalı');
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

console.log('FinansTool v4.2 regresyon testleri başarılı.');

