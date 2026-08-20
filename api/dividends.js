const HEADERS={
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/5)',
  'Accept':'application/json, text/plain, */*',
  'Origin':'https://www.nasdaq.com',
  'Referer':'https://www.nasdaq.com/'
};

const inFlight=new Map();
const TRADINGVIEW_HEADERS={'User-Agent':HEADERS['User-Agent'],'Accept':'application/json','Content-Type':'application/json','Origin':'https://www.tradingview.com'};

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

async function fetchBist(symbol){
  const ticker=symbol.replace(/\.IS$/,''),body={symbols:{tickers:['BIST:'+ticker],query:{types:[]}},columns:['dividend_amount_upcoming','dividend_ex_date_upcoming','dividend_payment_date_upcoming','currency']};
  const response=await fetch('https://scanner.tradingview.com/turkey/scan',{method:'POST',headers:TRADINGVIEW_HEADERS,body:JSON.stringify(body),signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw new Error('TradingView '+response.status);
  const values=(await response.json())?.data?.[0]?.d,amount=Number(values?.[0]),exSeconds=Number(values?.[1]),paymentSeconds=Number(values?.[2]);
  if(!Number.isFinite(amount)||amount<0||(!Number.isFinite(exSeconds)&&!Number.isFinite(paymentSeconds)))return[];
  const event={exDate:Number.isFinite(exSeconds)?exSeconds*1000:null,paymentDate:Number.isFinite(paymentSeconds)?paymentSeconds*1000:null,amount,currency:String(values?.[3]||'TRY').toUpperCase(),type:'Cash'};
  const today=new Date();today.setUTCHours(0,0,0,0);
  return((event.exDate&&event.exDate>=today.getTime())||(event.paymentDate&&event.paymentDate>=today.getTime()))?[event]:[];
}

async function resolve(symbol){
  if(/^[A-Z][A-Z0-9-]{0,14}\.IS$/.test(symbol)){const events=await fetchBist(symbol);return{symbol,events,provider:'TradingView',supported:true,status:events.length?'ok':'no_events'}}
  if(symbol.includes('.'))return{symbol,events:[],provider:null,supported:false,status:'unsupported'};
  const attempts=await Promise.allSettled(['stocks','etf'].map(assetClass=>fetchClass(symbol,assetClass)));
  if(!attempts.some(result=>result.status==='fulfilled'))throw new Error('Temettü sağlayıcısına ulaşılamadı.');
  const events=attempts.flatMap(result=>result.status==='fulfilled'?result.value:[]);
  const seen=new Set();
  const unique=events.filter(item=>{const key=[item.exDate,item.paymentDate,item.amount,item.currency].join('|');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>(a.exDate||a.paymentDate)-(b.exDate||b.paymentDate)).slice(0,5);
  return{symbol,events:unique,provider:'Nasdaq',supported:true,status:unique.length?'ok':'no_events'};
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
  catch(error){res.setHeader('Cache-Control','no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');return res.status(503).json({symbol,events:[],provider:'Nasdaq / TradingView',supported:true,status:'provider_error',error:error.message||'Temettü sağlayıcısına ulaşılamadı.'})}
};
