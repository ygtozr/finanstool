const HEADERS={
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/4.3)',
  'Accept':'application/json, text/plain, */*',
  'Origin':'https://www.nasdaq.com',
  'Referer':'https://www.nasdaq.com/'
};

const inFlight=new Map();

function cache(res){
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=21600');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=3600, stale-while-revalidate=21600');
}

function parseDate(value){
  const match=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match)return null;
  const time=Date.UTC(Number(match[3]),Number(match[1])-1,Number(match[2]),12);
  return Number.isFinite(time)?time:null;
}

function parseAmount(value){
  const cleaned=String(value||'').replace(/[^0-9.-]/g,'');
  if(!cleaned)return null;
  const amount=Number(cleaned);
  return Number.isFinite(amount)&&amount>=0?amount:null;
}

async function fetchClass(symbol,assetClass){
  const url='https://api.nasdaq.com/api/quote/'+encodeURIComponent(symbol)+'/dividends?assetclass='+assetClass;
  const response=await fetch(url,{headers:HEADERS,signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw new Error('Nasdaq '+response.status);
  const payload=await response.json();
  const rows=payload?.data?.dividends?.rows;
  if(!Array.isArray(rows))return[];
  const today=new Date();today.setUTCHours(0,0,0,0);
  return rows.map(row=>{
    const exDate=parseDate(row.exOrEffDate),paymentDate=parseDate(row.paymentDate),amount=parseAmount(row.amount);
    return{exDate,paymentDate,amount,currency:String(row.currency||'USD').toUpperCase(),type:String(row.type||'Cash')};
  }).filter(item=>item.amount!==null&&((item.exDate&&item.exDate>=today.getTime())||(item.paymentDate&&item.paymentDate>=today.getTime())));
}

async function resolve(symbol){
  if(symbol.includes('.'))return{symbol,events:[],provider:null,supported:false};
  const attempts=await Promise.allSettled(['stocks','etf'].map(assetClass=>fetchClass(symbol,assetClass)));
  const events=attempts.flatMap(result=>result.status==='fulfilled'?result.value:[]);
  const seen=new Set();
  const unique=events.filter(item=>{const key=[item.exDate,item.paymentDate,item.amount,item.currency].join('|');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>(a.exDate||a.paymentDate)-(b.exDate||b.paymentDate)).slice(0,5);
  return{symbol,events:unique,provider:'Nasdaq',supported:attempts.some(result=>result.status==='fulfilled')};
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase();
  if(!/^[A-Z0-9.^=-]{1,30}$/.test(symbol))return res.status(400).json({error:'Geçersiz hisse kodu.'});
  cache(res);
  let request=inFlight.get(symbol);
  if(!request){request=resolve(symbol).finally(()=>inFlight.delete(symbol));inFlight.set(symbol,request)}
  try{return res.status(200).json(await request)}
  catch{return res.status(200).json({symbol,events:[],provider:null,supported:false})}
};
