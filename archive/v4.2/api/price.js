const PROVIDER_HEADERS = {
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/4.2)',
  'Accept':'application/json, text/plain, */*'
};

const inFlight = new Map();
const rateBuckets = new Map();
const PROVIDER_TIMEOUT_MS = 4500;
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT = 180;

function setCache(res) {
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=15, stale-while-revalidate=30');
  res.setHeader('CDN-Cache-Control','public, s-maxage=15, stale-while-revalidate=30');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=15, stale-while-revalidate=30');
}

function clientAddress(req) {
  return String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
}

function allowRequest(req) {
  const now=Date.now();
  const key=clientAddress(req);
  const current=rateBuckets.get(key);
  if(!current||now-current.started>=RATE_WINDOW_MS){
    rateBuckets.set(key,{started:now,count:1});
    return true;
  }
  current.count++;
  return current.count<=RATE_LIMIT;
}

function cleanQuery(raw) {
  const incoming=new URLSearchParams(String(raw||'range=6mo&interval=1d'));
  const clean=new URLSearchParams();
  const range=incoming.get('range');
  const interval=incoming.get('interval');
  const period1=incoming.get('period1');
  const period2=incoming.get('period2');
  if(range && /^(5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$/.test(range))clean.set('range',range);
  if(period1 && /^\d{9,12}$/.test(period1))clean.set('period1',period1);
  if(period2 && /^\d{9,12}$/.test(period2))clean.set('period2',period2);
  clean.set('interval',interval==='1wk'?'1wk':'1d');
  clean.set('events','div,splits');
  clean.set('includeAdjustedClose','true');
  if(!clean.has('range')&&!clean.has('period1'))clean.set('range','6mo');
  return clean;
}

async function fetchJson(url,headers=PROVIDER_HEADERS) {
  const response=await fetch(url,{headers,signal:AbortSignal.timeout(PROVIDER_TIMEOUT_MS)});
  const text=await response.text();
  let data;
  try{data=JSON.parse(text)}catch{throw new Error('Sağlayıcı geçersiz yanıt verdi.')}
  if(!response.ok)throw new Error('Sağlayıcı '+response.status+' durumunu döndürdü.');
  return data;
}

function validYahoo(data) {
  const result=data?.chart?.result?.[0];
  return Boolean(result?.timestamp?.length && result?.indicators?.quote?.[0]?.close?.some(Number.isFinite));
}

function dateBounds(params) {
  const endValue=Number(params.get('period2'));
  const end=Number.isFinite(endValue)&&endValue>0?new Date(endValue*1000):new Date();
  const startValue=Number(params.get('period1'));
  let start;
  if(Number.isFinite(startValue)&&startValue>0){
    start=new Date(startValue*1000);
  }else{
    start=new Date(end);
    const range=params.get('range')||'6mo';
    if(range==='5d')start.setUTCDate(start.getUTCDate()-7);
    else if(range==='1mo')start.setUTCMonth(start.getUTCMonth()-1);
    else if(range==='3mo')start.setUTCMonth(start.getUTCMonth()-3);
    else if(range==='6mo')start.setUTCMonth(start.getUTCMonth()-6);
    else if(range==='1y')start.setUTCFullYear(start.getUTCFullYear()-1);
    else if(range==='2y')start.setUTCFullYear(start.getUTCFullYear()-2);
    else if(range==='5y')start.setUTCFullYear(start.getUTCFullYear()-5);
    else if(range==='10y')start.setUTCFullYear(start.getUTCFullYear()-10);
    else if(range==='ytd')start=new Date(Date.UTC(end.getUTCFullYear(),0,1));
    else start.setUTCFullYear(start.getUTCFullYear()-10);
  }
  const iso=date=>date.toISOString().slice(0,10);
  return {from:iso(start),to:iso(end)};
}

function numberValue(value) {
  if(value===null||value===undefined)return null;
  const cleaned=String(value).trim().replace(/[^0-9.-]/g,'');
  if(!cleaned||cleaned==='-'||cleaned==='.'||cleaned==='-.')return null;
  const parsed=Number(cleaned);
  return Number.isFinite(parsed)?parsed:null;
}

function nasdaqToYahoo(symbol,data,range,assetClass) {
  const rows=data?.data?.tradesTable?.rows;
  if(!Array.isArray(rows)||!rows.length)return null;
  const points=rows.map(row=>{
    const parts=String(row.date||'').split('/');
    if(parts.length!==3)return null;
    const timestamp=Math.floor(Date.UTC(Number(parts[2]),Number(parts[0])-1,Number(parts[1]),20)/1000);
    const close=numberValue(row.close);
    return {timestamp,close,open:numberValue(row.open),high:numberValue(row.high),low:numberValue(row.low),volume:numberValue(row.volume)};
  }).filter(point=>point&&Number.isFinite(point.close)&&point.close>0).sort((a,b)=>a.timestamp-b.timestamp);
  if(!points.length)return null;
  const closes=points.map(point=>point.close);
  return {chart:{result:[{
    meta:{
      currency:'USD',symbol,exchangeName:'Nasdaq',fullExchangeName:'Nasdaq',
      instrumentType:assetClass==='etf'?'ETF':'EQUITY',
      firstTradeDate:points[0].timestamp,regularMarketTime:points.at(-1).timestamp,
      regularMarketPrice:closes.at(-1),chartPreviousClose:closes[0],priceHint:2,
      timezone:'UTC',exchangeTimezoneName:'America/New_York',dataGranularity:'1d',
      range,dataProvider:'Nasdaq'
    },
    timestamp:points.map(point=>point.timestamp),
    indicators:{quote:[{
      open:points.map(point=>point.open),high:points.map(point=>point.high),
      low:points.map(point=>point.low),close:closes,volume:points.map(point=>point.volume)
    }],adjclose:[{adjclose:closes}]},
    events:{}
  }],error:null}};
}

async function fetchNasdaqAsset(symbol,params,assetClass) {
  const {from,to}=dateBounds(params);
  const url='https://api.nasdaq.com/api/quote/'+encodeURIComponent(symbol)+'/historical?assetclass='+assetClass+'&fromdate='+from+'&todate='+to+'&limit=5000&offset=0';
  const data=await fetchJson(url,{...PROVIDER_HEADERS,Origin:'https://www.nasdaq.com',Referer:'https://www.nasdaq.com/'});
  return nasdaqToYahoo(symbol,data,params.get('range')||'custom',assetClass);
}

async function fetchNasdaq(symbol,params) {
  if(params.get('interval')!=='1d'||!/^[A-Z][A-Z0-9-]{0,9}$/.test(symbol))return null;
  const attempts=await Promise.allSettled(['stocks','etf'].map(assetClass=>fetchNasdaqAsset(symbol,params,assetClass)));
  for(const attempt of attempts)if(attempt.status==='fulfilled'&&attempt.value)return attempt.value;
  return null;
}

async function fetchYahoo(host,symbol,params,label) {
  const url='https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?'+params.toString();
  const data=await fetchJson(url);
  if(!validYahoo(data))throw new Error('Fiyat verisi bulunamadı.');
  data.chart.result[0].meta={...(data.chart.result[0].meta||{}),dataProvider:label};
  return data;
}

async function resolvePrice(symbol,params,forcedFallback) {
  if(!forcedFallback){
    try{return await fetchYahoo('query1.finance.yahoo.com',symbol,params,'Yahoo Finance')}catch{}
  }
  const nasdaq=await fetchNasdaq(symbol,params);
  if(nasdaq)return nasdaq;
  return fetchYahoo('query2.finance.yahoo.com',symbol,params,'Yahoo Finance ikincil erişim');
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allowRequest(req))return res.status(429).json({error:'Çok fazla istek gönderildi. Kısa süre sonra yeniden deneyin.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase();
  if(!/^[A-Z0-9.^=-]{1,30}$/.test(symbol))return res.status(400).json({error:'Geçersiz hisse kodu.'});
  const params=cleanQuery(req.query.query);
  const forcedFallback=String(req.query.provider||'')==='fallback';
  setCache(res);
  const key=symbol+'?'+params.toString()+(forcedFallback?'&fallback=1':'');
  let request=inFlight.get(key);
  if(!request){
    request=resolvePrice(symbol,params,forcedFallback).finally(()=>inFlight.delete(key));
    inFlight.set(key,request);
  }
  try{
    const data=await request;
    const provider=data?.chart?.result?.[0]?.meta?.dataProvider||'Bilinmeyen';
    res.setHeader('X-Data-Provider',provider);
    return res.status(200).json(data);
  }catch{
    return res.status(502).json({error:'Birincil ve ikincil veri sağlayıcılarına ulaşılamadı.'});
  }
};
