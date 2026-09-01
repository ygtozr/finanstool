const priceHandler=require('./price');

const MAX_SYMBOLS=20;
const QUERY='range=1mo&interval=1d';

function setCache(res){
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=10, stale-while-revalidate=5');
  res.setHeader('CDN-Cache-Control','public, s-maxage=10, stale-while-revalidate=5');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=10, stale-while-revalidate=5');
}

async function mapWithLimit(items,limit,worker){
  const results=new Array(items.length);let next=0;
  async function run(){while(next<items.length){const index=next++;results[index]=await worker(items[index])}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return results;
}

function compactQuote(symbol,payload){
  const result=payload?.chart?.result?.[0],closes=result?.indicators?.quote?.[0]?.close,timestamps=result?.timestamp;
  if(!Array.isArray(closes)||!Array.isArray(timestamps))throw new Error('Fiyat bulunamadı.');
  const points=timestamps.map((time,index)=>({time:Number(time),close:Number(closes[index])})).filter(point=>Number.isFinite(point.time)&&Number.isFinite(point.close)&&point.close>0).slice(-7);
  if(points.length<2)throw new Error('Yetersiz fiyat verisi.');
  const price=points.at(-1).close,previous=points.at(-2).close,meta=result.meta||{};
  return {
    symbol,name:meta.longName||meta.shortName||symbol,currency:String(meta.currency||'USD').toUpperCase(),
    price,previousClose:previous,delta:price-previous,change:(price/previous-1)*100,
    marketTimestamp:Number(meta.regularMarketTime)||points.at(-1).time,updatedAt:Date.now(),
    stale:Boolean(payload?._finansTool?.stale),provider:meta.dataProvider||payload?._finansTool?.provider||null,
  };
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  const symbols=[...new Set(String(req.query.symbols||'').split(',').map(value=>value.trim().toUpperCase()).filter(Boolean))];
  if(!symbols.length||symbols.length>MAX_SYMBOLS||symbols.some(symbol=>!/^[A-Z0-9.^=-]{1,30}$/.test(symbol)))return res.status(400).json({error:'Geçersiz veya fazla sayıda finans kodu.'});
  setCache(res);
  const quotes=await mapWithLimit(symbols,4,async symbol=>{
    try{return{ok:true,...compactQuote(symbol,await priceHandler.resolvePriceData(symbol,QUERY))}}
    catch{return{ok:false,symbol}}
  });
  return res.status(200).json({quotes,servedAt:Date.now()});
};
