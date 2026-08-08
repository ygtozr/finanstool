const PROVIDER_HEADERS = {
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/3.2)',
  'Accept':'application/json, text/plain, */*'
};

function setNoStore(res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('CDN-Cache-Control','no-store');
  res.setHeader('Vercel-CDN-Cache-Control','no-store');
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
  const response=await fetch(url,{headers,signal:AbortSignal.timeout(8000)});
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
  const parsed=Number(String(value).replace(/[^0-9.-]/g,''));
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
  }).filter(point=>point&&Number.isFinite(point.close)).sort((a,b)=>a.timestamp-b.timestamp);
  if(!points.length)return null;
  const closes=points.map(point=>point.close);
  return {chart:{result:[{
    meta:{
      currency:'USD',
      symbol,
      exchangeName:'Nasdaq',
      fullExchangeName:'Nasdaq',
      instrumentType:assetClass==='etf'?'ETF':'EQUITY',
      firstTradeDate:points[0].timestamp,
      regularMarketTime:points.at(-1).timestamp,
      regularMarketPrice:closes.at(-1),
      chartPreviousClose:closes[0],
      priceHint:2,
      timezone:'UTC',
      exchangeTimezoneName:'America/New_York',
      dataGranularity:'1d',
      range,
      dataProvider:'Nasdaq'
    },
    timestamp:points.map(point=>point.timestamp),
    indicators:{
      quote:[{
        open:points.map(point=>point.open),
        high:points.map(point=>point.high),
        low:points.map(point=>point.low),
        close:closes,
        volume:points.map(point=>point.volume)
      }],
      adjclose:[{adjclose:closes}]
    },
    events:{}
  }],error:null}};
}

async function fetchNasdaq(symbol,params) {
  if(params.get('interval')!=='1d'||!/^[A-Z][A-Z0-9-]{0,9}$/.test(symbol))return null;
  const {from,to}=dateBounds(params);
  for(const assetClass of ['stocks','etf']){
    try{
      const url='https://api.nasdaq.com/api/quote/'+encodeURIComponent(symbol)+'/historical?assetclass='+assetClass+'&fromdate='+from+'&todate='+to+'&limit=5000&offset=0';
      const data=await fetchJson(url,{...PROVIDER_HEADERS,Origin:'https://www.nasdaq.com',Referer:'https://www.nasdaq.com/'});
      const normalized=nasdaqToYahoo(symbol,data,params.get('range')||'custom',assetClass);
      if(normalized)return normalized;
    }catch{}
  }
  return null;
}

async function fetchYahoo(host,symbol,params,label) {
  const url='https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?'+params.toString();
  const data=await fetchJson(url);
  if(!validYahoo(data))throw new Error('Fiyat verisi bulunamadı.');
  data.chart.result[0].meta={...(data.chart.result[0].meta||{}),dataProvider:label};
  return data;
}

module.exports=async(req,res)=>{
  const symbol=String(req.query.symbol||'').trim().toUpperCase();
  if(!/^[A-Z0-9.^=-]{1,30}$/.test(symbol))return res.status(400).json({error:'Geçersiz hisse kodu.'});
  const params=cleanQuery(req.query.query);
  const forcedFallback=String(req.query.provider||'')==='fallback';
  setNoStore(res);
  if(!forcedFallback){
    try{
      const data=await fetchYahoo('query1.finance.yahoo.com',symbol,params,'Yahoo Finance');
      res.setHeader('X-Data-Provider','Yahoo Finance');
      return res.status(200).json(data);
    }catch{}
  }
  const nasdaq=await fetchNasdaq(symbol,params);
  if(nasdaq){
    res.setHeader('X-Data-Provider','Nasdaq');
    return res.status(200).json(nasdaq);
  }
  try{
    const data=await fetchYahoo('query2.finance.yahoo.com',symbol,params,'Yahoo Finance ikincil erişim');
    res.setHeader('X-Data-Provider','Yahoo Finance secondary');
    return res.status(200).json(data);
  }catch{
    return res.status(502).json({error:'Birincil ve ikincil veri sağlayıcılarına ulaşılamadı.'});
  }
};
