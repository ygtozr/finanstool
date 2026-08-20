const PROVIDER_HEADERS={
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/4.3)','Accept':'application/json, text/plain, */*','Origin':'https://www.nasdaq.com','Referer':'https://www.nasdaq.com/'
};
const TIMEOUT_MS=4500;
const inFlight=new Map(),rateBuckets=new Map(),RATE_WINDOW_MS=60000,RATE_LIMIT=120;
function allowRequest(req){const now=Date.now(),key=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim(),current=rateBuckets.get(key);if(!current||now-current.started>=RATE_WINDOW_MS){rateBuckets.set(key,{started:now,count:1});return true}current.count++;return current.count<=RATE_LIMIT}
function setCache(res){res.setHeader('Cache-Control','public, max-age=0, s-maxage=300, stale-while-revalidate=600');res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=300, stale-while-revalidate=600')}
async function fetchJson(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(TIMEOUT_MS)});const text=await response.text();let data;try{data=JSON.parse(text)}catch{throw new Error('Sağlayıcı geçersiz yanıt verdi.')}if(!response.ok)throw new Error('Sağlayıcı '+response.status+' durumunu döndürdü.');return data}
function numberValue(value){if(value===null||value===undefined)return null;const cleaned=String(value).trim().replace(/[^0-9.-]/g,'');if(!cleaned||cleaned==='-'||cleaned==='.'||cleaned==='-.')return null;const parsed=Number(cleaned);return Number.isFinite(parsed)?parsed:null}
function summaryValue(summary,key){return numberValue(summary?.[key]?.value)}
function trailingEps(data){const quarters=data?.data?.earningsPerShare?.filter(item=>item?.type==='PreviousQuarter'&&Number.isFinite(Number(item.earnings))).slice(-4)||[];if(quarters.length!==4)return null;const total=quarters.reduce((sum,item)=>sum+Number(item.earnings),0);return Number.isFinite(total)&&total>0?total:null}
async function fetchNasdaq(symbol){
  const base='https://api.nasdaq.com/api/quote/'+encodeURIComponent(symbol),request=url=>fetchJson(url,{headers:PROVIDER_HEADERS});
  const [stockSummary,etfSummary,eps]=await Promise.allSettled([request(base+'/summary?assetclass=stocks'),request(base+'/summary?assetclass=etf'),request(base+'/eps?assetclass=stocks')]);
  const stock=stockSummary.status==='fulfilled'?stockSummary.value?.data:null,etf=etfSummary.status==='fulfilled'?etfSummary.value?.data:null,selected=stock?.summaryData?stock:(etf?.summaryData?etf:null);
  if(!selected)return null;
  const summary=selected.summaryData,assetType=String(selected.assetClass||'').toUpperCase()==='ETF'?'ETF':'EQUITY';
  return {available:true,source:'Nasdaq',assetType,currency:'USD',marketCap:summaryValue(summary,'MarketCap'),trailingEps:assetType==='EQUITY'&&eps.status==='fulfilled'?trailingEps(eps.value):null,dividendYieldPercent:summaryValue(summary,'Yield'),peApplicable:assetType==='EQUITY',marketCapApplicable:true,dividendApplicable:true};
}
async function fetchBist(symbol){
  const ticker=symbol.replace(/\.IS$/,''),body={symbols:{tickers:['BIST:'+ticker],query:{types:[]}},columns:['name','description','market_cap_basic','price_earnings_ttm','dividends_yield_current']};
  const data=await fetchJson('https://scanner.tradingview.com/turkey/scan',{method:'POST',headers:{'User-Agent':PROVIDER_HEADERS['User-Agent'],'Accept':'application/json','Content-Type':'application/json','Origin':'https://www.tradingview.com'},body:JSON.stringify(body)}),values=data?.data?.[0]?.d;
  if(!Array.isArray(values))return null;
  return {available:true,source:'TradingView',assetType:'EQUITY',currency:'TRY',marketCap:numberValue(values[2]),pe:numberValue(values[3]),dividendYieldPercent:numberValue(values[4]),peApplicable:true,marketCapApplicable:true,dividendApplicable:true};
}
module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allowRequest(req))return res.status(429).json({error:'Çok fazla istek gönderildi. Kısa süre sonra yeniden deneyin.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase();if(!/^[A-Z0-9.^=-]{1,30}$/.test(symbol))return res.status(400).json({error:'Geçersiz hisse kodu.'});setCache(res);
  try{let request=inFlight.get(symbol);if(!request){request=(async()=>{let result=null;const bist=/^[A-Z][A-Z0-9-]{0,14}\.IS$/.test(symbol),us=/^[A-Z][A-Z0-9-]{0,14}$/.test(symbol);if(bist)result=await fetchBist(symbol);else if(us)result=await fetchNasdaq(symbol);return result?{symbol,...result}:{symbol,available:false,source:null,peApplicable:bist||us?null:false,marketCapApplicable:bist||us?null:false,dividendApplicable:bist||us?null:false}})().finally(()=>inFlight.delete(symbol));inFlight.set(symbol,request)}return res.status(200).json(await request)}
  catch{return res.status(200).json({symbol,available:false,source:null,peApplicable:null,marketCapApplicable:null,dividendApplicable:null})}
};
