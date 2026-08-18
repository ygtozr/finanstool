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

const clientFunctions=['fillMissingRates','calculateRsi','sma'].map(name=>extractFunction(scripts[0],name)).join('\n');
const {fillMissingRates,calculateRsi,sma}=new Function(clientFunctions+';return {fillMissingRates,calculateRsi,sma};')();

assert.deepEqual(fillMissingRates([null,null,2,null,3,null]),[null,null,2,2,3,3],'Gelecekteki kur geçmişe taşınmamalı');
assert.deepEqual(sma([null,1,2,3],3),[null,null,null,2],'Eksik değer içeren MA penceresi hesaplanmamalı');
const rsi=calculateRsi([1,2,3,2,4,5,4,6,7,8,7,9,10,11,12,13,14,13,15,16],14);
assert.ok(Number.isFinite(rsi.at(-1))&&rsi.at(-1)>=0&&rsi.at(-1)<=100,'Wilder RSI geçerli aralıkta olmalı');

const sandbox={module:{exports:{}},exports:{},require,URLSearchParams,URL,AbortSignal,fetch:()=>{throw new Error('testte ağ çağrısı yapılmamalı')}};
vm.runInNewContext(priceApi+'\nmodule.exports._test={numberValue,cleanQuery};',sandbox);
assert.equal(sandbox.module.exports._test.numberValue('N/A'),null,'N/A sıfır fiyat olmamalı');
assert.equal(sandbox.module.exports._test.numberValue('-'),null,'Eksik fiyat sıfır olmamalı');
assert.equal(sandbox.module.exports._test.numberValue('$1,234.56'),1234.56);

assert.equal((html.match(/fresh=/g)||[]).length,0,'Önbelleği bozan fresh parametresi kalmamalı');
assert.match(html,/let priceRequestId = 0;/,'Ana grafik yarış koruması bulunmalı');
assert.match(html,/const comparisonRequests = new Set\(\);/,'Karşılaştırma çift tıklama kilidi bulunmalı');
assert.match(html,/role="listbox"/,'Arama önerileri listbox olmalı');
assert.match(html,/class="terminal-layout"/,'Profesyonel terminal grafik düzeni bulunmalı');
assert.match(html,/id="terminalRailLast"/,'Terminal dönem özeti bulunmalı');
assert.match(html,/function updateTerminalSummary/,'Terminal özeti canlı veriye bağlı olmalı');

console.log('FinansTool v4.1 regresyon testleri başarılı.');

