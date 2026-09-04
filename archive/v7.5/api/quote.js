const HEADERS={'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/6.3)','Accept':'application/json, text/plain, */*'};
const OFFICIAL_TEFAS='https://www.tefas.gov.tr';
const TEFAS_MIRROR='https://fon.org.tr';
const SYMBOL=/^[A-Z0-9^=.-]{1,24}$/;

async function fetchJson(url,options={},timeout=6000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(url,{...options,signal:controller.signal,headers:{...HEADERS,...(options.headers||{})}});
    if(!response.ok)throw new Error('HTTP '+response.status);
    return response.json();
  }finally{clearTimeout(timer)}
}

function unixDate(value){
  const text=String(value||''),iso=text.match(/^(\d{4})-(\d{2})-(\d{2})/),dot=text.match(/^(\d{2})[./](\d{2})[./](\d{4})/);
  if(iso)return Math.floor(Date.UTC(+iso[1],+iso[2]-1,+iso[3])/1000);
  if(dot)return Math.floor(Date.UTC(+dot[3],+dot[2]-1,+dot[1])/1000);
  return null;
}

function normalizeFundPoints(rows){
  return (rows||[]).map(row=>({
    time:unixDate(row.date||row.tarih||row.fonFiyatTarih),
    price:Number(row.price??row.fiyat??row.birimPayDegeri),
    name:String(row.title||row.fonUnvan||row.unvan||'').trim()
  })).filter(point=>Number.isFinite(point.time)&&Number.isFinite(point.price)&&point.price>0).sort((a,b)=>a.time-b.time);
}

async function mirrorFund(code){
  const payload=await fetchJson(TEFAS_MIRROR+'/api/fund-prices/'+encodeURIComponent(code),{},6500),points=normalizeFundPoints(payload.points);
  if(!points.length)throw new Error('Fon aynasında fiyat bulunamadı.');
  return{provider:'Fon.org.tr / TEFAS',priority:1,points,name:''};
}

async function officialFund(code){
  const payload=await fetchJson(OFFICIAL_TEFAS+'/api/funds/fonFiyatBilgiGetir',{method:'POST',headers:{'Content-Type':'application/json',Origin:OFFICIAL_TEFAS,Referer:OFFICIAL_TEFAS+'/tr/fon-verileri'},body:JSON.stringify({fonKodu:code,dil:'TR',periyod:1})},6500);
  const points=normalizeFundPoints(payload.resultList);
  if(!points.length)throw new Error('Resmî TEFAS fiyatı bulunamadı.');
  return{provider:'TEFAS',priority:2,points,name:points.at(-1).name};
}

function latestBusinessDate(now=new Date()){
  const date=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
  while([0,6].includes(date.getUTCDay()))date.setUTCDate(date.getUTCDate()-1);
  return Math.floor(date.getTime()/1000);
}

async function tefasQuote(symbol){
  const code=symbol.replace(/^TEFAS-/,'');
  const settled=await Promise.allSettled([mirrorFund(code),officialFund(code)]),candidates=settled.filter(item=>item.status==='fulfilled').map(item=>item.value);
  if(!candidates.length)throw new Error('TEFAS fiyat kaynaklarına ulaşılamadı.');
  candidates.sort((a,b)=>b.points.at(-1).time-a.points.at(-1).time||b.priority-a.priority);
  const selected=candidates[0],last=selected.points.at(-1),previous=selected.points.at(-2)||last;
  const sameDate=candidates.filter(item=>item.points.at(-1).time===last.time),official=sameDate.find(item=>item.priority===2);
  const chosen=official||selected,chosenLast=chosen.points.at(-1),chosenPrevious=chosen.points.at(-2)||chosenLast;
  const mismatch=sameDate.some(item=>Math.abs(item.points.at(-1).price-chosenLast.price)/chosenLast.price>0.0001);
  return{
    symbol:'TEFAS-'+code,name:chosen.name||code,currency:'TRY',price:chosenLast.price,previousClose:chosenPrevious.price,
    delta:chosenLast.price-chosenPrevious.price,change:(chosenLast.price/chosenPrevious.price-1)*100,asOf:chosenLast.time,
    provider:chosen.provider,priceType:'official_daily',delayed:chosenLast.time<latestBusinessDate(),stale:false,sourceMismatch:mismatch
  };
}

async function tradingViewBist(symbol){
  const code=symbol.slice(0,-3),columns=['name','description','close','change','change_abs','update_mode','currency','last_bar_update_time'];
  const [payload,yahooReference]=await Promise.all([
    fetchJson('https://scanner.tradingview.com/turkey/scan',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.tradingview.com',Referer:'https://www.tradingview.com/'},body:JSON.stringify({symbols:{tickers:['BIST:'+code],query:{types:[]}},columns})},5000),
    yahooSafeFallback(symbol).catch(()=>null)
  ]);
  const row=payload?.data?.[0]?.d,price=Number(row?.[2]),change=Number(row?.[3]),delta=Number(row?.[4]),lastPriceTime=Number(row?.[7]);
  if(!Number.isFinite(price)||price<=0||!Number.isFinite(change)||!Number.isFinite(delta)||!Number.isFinite(lastPriceTime)||lastPriceTime<=0)throw new Error('BIST anlık fiyatı veya fiyat zamanı bulunamadı.');
  const exchangeTradeTime=Number(yahooReference?.asOf),asOf=Number.isFinite(exchangeTradeTime)&&exchangeTradeTime>0?Math.min(lastPriceTime,exchangeTradeTime):lastPriceTime;
  return{symbol,name:String(row[1]||code),currency:String(row[6]||'TRY').toUpperCase(),price,previousClose:price-delta,delta,change,asOf,provider:'TradingView BIST',priceType:'delayed_quote',delayed:String(row[5]||'').includes('delayed'),stale:false};
}

async function tradingViewBistBatch(symbols){
  const normalized=[...new Set((symbols||[]).map(value=>String(value||'').trim().toUpperCase()).filter(value=>value.endsWith('.IS')))];
  if(!normalized.length)return new Map();
  const columns=['name','description','close','change','change_abs','update_mode','currency','last_bar_update_time'];
  const tickers=normalized.map(symbol=>'BIST:'+symbol.slice(0,-3));
  const payload=await fetchJson('https://scanner.tradingview.com/turkey/scan',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.tradingview.com',Referer:'https://www.tradingview.com/'},body:JSON.stringify({symbols:{tickers,query:{types:[]}},columns})},5000);
  const byTicker=new Map((payload?.data||[]).map(item=>[String(item?.s||'').toUpperCase(),item?.d]));
  const results=new Map();
  normalized.forEach(symbol=>{
    const code=symbol.slice(0,-3),row=byTicker.get('BIST:'+code),price=Number(row?.[2]),change=Number(row?.[3]),delta=Number(row?.[4]),asOf=Number(row?.[7]);
    if(!Number.isFinite(price)||price<=0||!Number.isFinite(change)||!Number.isFinite(delta)||!Number.isFinite(asOf)||asOf<=0)return;
    results.set(symbol,{symbol,name:String(row?.[1]||code),currency:String(row?.[6]||'TRY').toUpperCase(),price,previousClose:price-delta,delta,change,asOf,provider:'TradingView BIST toplu',priceType:'delayed_quote',delayed:String(row?.[5]||'').includes('delayed'),stale:false});
  });
  return results;
}

function previousWeekday(time){
  const date=new Date(time*1000);date.setUTCDate(date.getUTCDate()-1);
  while([0,6].includes(date.getUTCDay()))date.setUTCDate(date.getUTCDate()-1);
  return date.toISOString().slice(0,10);
}

async function yahooSafeFallback(symbol){
  const payload=await fetchJson('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=10d&interval=1d'),result=payload?.chart?.result?.[0];
  const closes=result?.indicators?.quote?.[0]?.close||[],points=(result?.timestamp||[]).map((time,index)=>({time,price:Number(closes[index])})).filter(item=>Number.isFinite(item.price)&&item.price>0);
  if(!points.length)throw new Error('Yedek fiyat bulunamadı.');
  const last=points.at(-1),expected=previousWeekday(last.time),previous=points.length>1?points.at(-2):null,previousDate=previous?new Date(previous.time*1000).toISOString().slice(0,10):null;
  return{symbol,name:result.meta?.longName||result.meta?.shortName||symbol,currency:String(result.meta?.currency||'TRY').toUpperCase(),price:last.price,previousClose:previous?.price??null,delta:previous?last.price-previous.price:null,change:previous?(last.price/previous.price-1)*100:null,asOf:Number(result.meta?.regularMarketTime)||last.time,provider:'Yahoo Finance yedek',priceType:'chart_fallback',delayed:false,stale:false,incompletePreviousClose:!previous,missingSessions:previous&&previousDate!==expected?{expected,actual:previousDate}:null};
}

async function bistQuote(symbol){
  try{return await tradingViewBist(symbol)}catch{return yahooSafeFallback(symbol)}
}

async function mapWithLimit(items,limit,worker){
  const output=new Array(items.length);let cursor=0;
  async function run(){while(cursor<items.length){const index=cursor++;output[index]=await worker(items[index],index)}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));return output;
}

async function quoteBatch(symbols){
  const normalized=[...new Set((symbols||[]).map(value=>String(value||'').trim().toUpperCase()).filter(value=>SYMBOL.test(value)))],results=new Map();
  const bist=normalized.filter(symbol=>symbol.endsWith('.IS')),funds=normalized.filter(symbol=>symbol.startsWith('TEFAS-'));
  await Promise.all([
    (async()=>{if(!bist.length)return;try{const batch=await tradingViewBistBatch(bist);batch.forEach((value,key)=>results.set(key,value))}catch{}const missing=bist.filter(symbol=>!results.has(symbol));const fallbacks=await mapWithLimit(missing,4,async symbol=>{try{return[symbol,await yahooSafeFallback(symbol)]}catch(error){return[symbol,{error:error.message||'Fiyat alınamadı.'}]}});fallbacks.forEach(([symbol,value])=>results.set(symbol,value))})(),
    mapWithLimit(funds,4,async symbol=>{try{return[symbol,await tefasQuote(symbol)]}catch(error){return[symbol,{error:error.message||'Fiyat alınamadı.'}]}}).then(entries=>entries.forEach(([symbol,value])=>results.set(symbol,value)))
  ]);
  return results;
}

const rateBuckets=new Map();
function allow(req){
  const now=Date.now(),key=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0],current=rateBuckets.get(key);
  if(!current||now-current.time>60000){rateBuckets.set(key,{time:now,count:1});return true}
  return++current.count<=120;
}

const handler=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allow(req))return res.status(429).json({error:'Çok fazla fiyat isteği gönderildi.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase();
  if(!SYMBOL.test(symbol)||(!symbol.endsWith('.IS')&&!symbol.startsWith('TEFAS-')))return res.status(400).json({error:'Bu sembol güncel fiyat servisi tarafından desteklenmiyor.'});
  res.setHeader('Cache-Control',symbol.startsWith('TEFAS-')?'public, max-age=0, s-maxage=300, stale-while-revalidate=1800':'public, max-age=0, s-maxage=10, stale-while-revalidate=20');
  try{return res.status(200).json(symbol.startsWith('TEFAS-')?await tefasQuote(symbol):await bistQuote(symbol))}
  catch(error){return res.status(502).json({error:error.message||'Güncel fiyat alınamadı.'})}
};

handler.resolveQuote=async symbol=>String(symbol||'').toUpperCase().startsWith('TEFAS-')?tefasQuote(String(symbol).toUpperCase()):bistQuote(String(symbol).toUpperCase());
handler.resolveQuotes=quoteBatch;
handler._test={unixDate,normalizeFundPoints,latestBusinessDate,previousWeekday,tradingViewBistBatch};
module.exports=handler;
