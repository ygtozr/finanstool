const priceHandler=require('./price');
const quoteHandler=require('./quote');
const goldHandler=require('./gold');
const tefasHandler=require('./tefas');
const {getCache}=require('@vercel/functions');

const SYMBOL=/^[A-Z0-9^=.-]{1,30}$/;
const MAX_SYMBOLS=40;
const rateBuckets=new Map();
const compactMemoryCache=new Map();
const compactLastGood=new Map();
const compactInFlight=new Map();
const compactRuntimeCache=getCache({namespace:'ozer-finans-compact-v1'});

function clientAddress(req){
  return String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
}

function allow(req){
  const now=Date.now(),key=clientAddress(req),current=rateBuckets.get(key);
  if(!current||now-current.time>=60000){rateBuckets.set(key,{time:now,count:1});return true}
  return++current.count<=30;
}

function invoke(handler,req,query){
  return new Promise(async resolve=>{
    let statusCode=200,settled=false;
    const finish=(status,body)=>{
      if(settled)return;
      settled=true;
      resolve({ok:status>=200&&status<300,status,data:status>=200&&status<300?body:undefined,error:status>=200&&status<300?undefined:(body?.error||'Veri alınamadı.')});
    };
    const response={
      setHeader(){},
      status(code){statusCode=Number(code)||500;return response},
      json(body){finish(statusCode,body);return response}
    };
    try{
      await handler({...req,method:'GET',query},response);
      if(!settled)finish(statusCode,{error:'Servis yanıt vermedi.'});
    }catch(error){finish(500,{error:error?.message||'Veri alınamadı.'})}
  });
}

async function resolveSymbol(symbol,query,req){
  const priceQuery=symbol.startsWith('TEFAS-')
    ?{action:'price',symbol,query}
    :{symbol,query};
  const handler=symbol.startsWith('TEFAS-')?tefasHandler:symbol.startsWith('ALTIN-')?goldHandler:priceHandler;
  const pricePromise=invoke(handler,req,priceQuery);
  const quotePromise=symbol.startsWith('TEFAS-')||symbol.endsWith('.IS')
    ?invoke(quoteHandler,req,{symbol})
    :Promise.resolve(null);
  const [price,quote]=await Promise.all([pricePromise,quotePromise]);
  return{price,quote};
}

function number(value){const parsed=Number(value);return Number.isFinite(parsed)?parsed:null}
function normalizeCompactData(data){
  const timestamp=number(data?.marketTimestamp??data?.asOf),marketTimestamp=Number.isFinite(timestamp)&&timestamp>0?timestamp:null;
  return{...data,asOf:marketTimestamp,marketTimestamp};
}
function forexPair(symbol){
  const aliases={'TRY=X':'USDTRY','EURTRY=X':'EURTRY','GBPTRY=X':'GBPTRY','EURUSD=X':'EURUSD','TRYUSD=X':'TRYUSD'};
  return aliases[symbol]||(/^([A-Z]{3})([A-Z]{3})=X$/.test(symbol)?symbol.replace('=X',''):null);
}

async function resolveForexBatch(symbols){
  const descriptors=(symbols||[]).map(symbol=>({symbol,pair:forexPair(symbol)})).filter(item=>item.pair);
  if(!descriptors.length)return new Map();
  const response=await fetch('https://scanner.tradingview.com/forex/scan',{method:'POST',headers:{'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/7.6)','Accept':'application/json','Content-Type':'application/json','Origin':'https://www.tradingview.com','Referer':'https://www.tradingview.com/'},body:JSON.stringify({symbols:{tickers:descriptors.map(item=>'FX_IDC:'+item.pair),query:{types:[]}},columns:['name','description','close','change','change_abs','currency','last_bar_update_time']}),signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw new Error('Döviz sağlayıcısı '+response.status+' durumunu döndürdü.');
  const payload=await response.json(),rows=new Map((payload?.data||[]).map(item=>[String(item?.s||'').toUpperCase(),item?.d])),results=new Map();
  descriptors.forEach(({symbol,pair})=>{
    const row=rows.get('FX_IDC:'+pair),price=number(row?.[2]),change=number(row?.[3]),delta=number(row?.[4]),asOf=number(row?.[6]);
    if(!Number.isFinite(price)||price<=0||!Number.isFinite(change)||!Number.isFinite(delta)||!Number.isFinite(asOf)||asOf<=0)return;
    results.set(symbol,{symbol,name:String(row?.[1]||row?.[0]||pair),currency:String(row?.[5]||pair.slice(3)||'USD').toUpperCase(),price,previousClose:price-delta,delta,change,asOf,provider:'TradingView Forex toplu',priceType:'live_quote',delayed:false,stale:false});
  });
  return results;
}

async function resolveCompact(symbol,req){
  if(symbol.startsWith('TEFAS-')||symbol.endsWith('.IS')){
    const result=await invoke(quoteHandler,req,{symbol});
    if(!result.ok)throw new Error(result.error||'Fiyat alınamadı.');
    return result.data;
  }
  const handler=symbol.startsWith('ALTIN-')?goldHandler:priceHandler,result=await invoke(handler,req,{symbol,query:'range=5d&interval=1d'});
  if(!result.ok)throw new Error(result.error||'Fiyat alınamadı.');
  const chart=result.data?.chart?.result?.[0],closes=chart?.indicators?.quote?.[0]?.close||[],points=(chart?.timestamp||[]).map((time,index)=>({time:Number(time),price:number(closes[index])})).filter(item=>Number.isFinite(item.time)&&Number.isFinite(item.price)&&item.price>0);
  if(!points.length)throw new Error('Fiyat bulunamadı.');
  const last=points.at(-1),previous=points.at(-2)||last,meta=chart.meta||{};
  return{symbol,name:meta.longName||meta.shortName||symbol,currency:String(meta.currency||'USD').toUpperCase(),price:last.price,previousClose:previous.price,delta:last.price-previous.price,change:previous.price?(last.price/previous.price-1)*100:null,asOf:number(meta.regularMarketTime)||last.time,provider:meta.dataProvider||result.data?._finansTool?.provider||'',priceType:'compact_chart',delayed:false,stale:Boolean(result.data?._finansTool?.stale)};
}

function compactTtlSeconds(symbol){
  if(symbol.startsWith('TEFAS-'))return 300;
  if(symbol.startsWith('ALTIN-'))return 60;
  return 15;
}

function compactCacheKey(kind,symbol){return kind+':'+symbol}
async function safeRuntimeGet(key){try{return await compactRuntimeCache.get(key)}catch{return undefined}}
async function safeRuntimeSet(key,value,options){try{await compactRuntimeCache.set(key,value,options)}catch{}}

async function readCompactCache(symbol,force=false){
  if(force)return null;
  const ttl=compactTtlSeconds(symbol)*1000,memory=compactMemoryCache.get(symbol);
  if(memory){compactLastGood.set(symbol,memory);return Date.now()-memory.cachedAt<ttl?{...normalizeCompactData(memory.data),cacheStatus:'memory'}:null}
  const stored=await safeRuntimeGet(compactCacheKey('quote',symbol));
  if(stored?.data){compactMemoryCache.set(symbol,stored);compactLastGood.set(symbol,stored);return Date.now()-stored.cachedAt<ttl?{...normalizeCompactData(stored.data),cacheStatus:'runtime'}:null}
  return null;
}

async function storeCompact(symbol,data){
  const normalized=normalizeCompactData(data),entry={cachedAt:Date.now(),data:{...normalized,cacheStatus:undefined}};
  compactMemoryCache.set(symbol,entry);compactLastGood.set(symbol,entry);
  await safeRuntimeSet(compactCacheKey('quote',symbol),entry,{ttl:86400,tags:['compact-quotes','compact:'+symbol],name:'compact '+symbol});
  return{...normalized,cacheStatus:'provider'};
}

async function staleCompact(symbol){
  const saved=compactLastGood.get(symbol)||await safeRuntimeGet(compactCacheKey('quote',symbol));
  return saved?.data?{...normalizeCompactData(saved.data),stale:true,cacheStatus:'stale'}:null;
}

function compactRequest(symbol,resolver){
  if(compactInFlight.has(symbol))return compactInFlight.get(symbol);
  const request=Promise.resolve().then(resolver).then(data=>storeCompact(symbol,data)).catch(async error=>{
    const saved=await staleCompact(symbol);if(saved)return saved;throw error;
  }).finally(()=>compactInFlight.delete(symbol));
  compactInFlight.set(symbol,request);return request;
}

async function resolveCompactBatch(symbols,req,{force=false}={}){
  const results=new Map(),missing=[];
  await Promise.all(symbols.map(async symbol=>{const cached=await readCompactCache(symbol,force);if(cached)results.set(symbol,cached);else missing.push(symbol)}));
  const waiting=missing.filter(symbol=>compactInFlight.has(symbol)),fresh=missing.filter(symbol=>!compactInFlight.has(symbol)),pending=new Map();
  waiting.forEach(symbol=>pending.set(symbol,compactInFlight.get(symbol)));
  const bistAndFunds=fresh.filter(symbol=>symbol.endsWith('.IS')||symbol.startsWith('TEFAS-'));
  const forex=fresh.filter(symbol=>Boolean(forexPair(symbol))&&!bistAndFunds.includes(symbol));
  const other=fresh.filter(symbol=>!bistAndFunds.includes(symbol)&&!forex.includes(symbol));
  if(bistAndFunds.length){
    const shared=quoteHandler.resolveQuotes(bistAndFunds);
    bistAndFunds.forEach(symbol=>pending.set(symbol,compactRequest(symbol,async()=>{const batch=await shared,value=batch.get(symbol);if(!value||value.error)throw new Error(value?.error||'Fiyat alınamadı.');return value})));
  }
  if(forex.length){
    const shared=resolveForexBatch(forex);
    forex.forEach(symbol=>pending.set(symbol,compactRequest(symbol,async()=>{const batch=await shared,value=batch.get(symbol);if(!value)throw new Error('Döviz fiyatı alınamadı.');return value})));
  }
  const otherEntries=mapWithLimit(other,8,async symbol=>{try{return[symbol,await compactRequest(symbol,()=>resolveCompact(symbol,req))]}catch(error){return[symbol,{error:error.message||'Fiyat alınamadı.'}]}});
  await Promise.all([...pending].map(async([symbol,request])=>{try{results.set(symbol,await request)}catch(error){results.set(symbol,{error:error.message||'Fiyat alınamadı.'})}}));
  (await otherEntries).forEach(([symbol,value])=>results.set(symbol,value));
  return results;
}

async function mapWithLimit(items,limit,worker){const output=new Array(items.length);let cursor=0;async function run(){while(cursor<items.length){const index=cursor++;output[index]=await worker(items[index],index)}}await Promise.all(Array.from({length:Math.min(limit,items.length)},run));return output}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allow(req))return res.status(429).json({error:'Çok fazla toplu fiyat isteği gönderildi.'});
  const symbols=[...new Set(String(req.query.symbols||'').split(',').map(value=>value.trim().toUpperCase()).filter(Boolean))];
  if(!symbols.length||symbols.length>MAX_SYMBOLS||symbols.some(symbol=>!SYMBOL.test(symbol)))return res.status(400).json({error:'Geçersiz veya çok uzun sembol listesi.'});
  const compact=String(req.query.mode||'')==='compact',query=String(req.query.query||'range=1mo&interval=1d'),force=String(req.query.refresh||'')==='1';
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=10, stale-while-revalidate=20');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=10, stale-while-revalidate=20');
  let entries;
  if(compact){
    const compactResults=await resolveCompactBatch(symbols,req,{force});
    entries=symbols.map(symbol=>{const value=compactResults.get(symbol);return value&&!value.error?[symbol,{ok:true,data:value}]:[symbol,{ok:false,error:value?.error||'Fiyat alınamadı.'}]});
  }else entries=await mapWithLimit(symbols,6,async symbol=>[symbol,await resolveSymbol(symbol,query,req)]);
  return res.status(200).json({results:Object.fromEntries(entries),servedAt:Date.now(),cacheMode:compact?'per-symbol-runtime':'response'});
};

module.exports._test={compactTtlSeconds,forexPair,normalizeCompactData,resolveCompactBatch};

