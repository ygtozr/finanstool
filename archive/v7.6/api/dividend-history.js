const HEADERS={'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/5.6)','Accept':'application/json, text/plain, */*','Origin':'https://www.nasdaq.com','Referer':'https://www.nasdaq.com/'};
function parseDate(value){const match=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return match?Math.floor(Date.UTC(+match[3],+match[1]-1,+match[2])/1000):null}
function parseAmount(value){const cleaned=String(value??'').replace(/[^0-9.-]/g,'');const parsed=Number(cleaned);return cleaned&&Number.isFinite(parsed)?parsed:null}
async function getJson(url,headers=HEADERS){const response=await fetch(url,{headers,signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error('Sağlayıcı hatası');return response.json()}
async function nasdaqRows(symbol){
  for(const assetClass of ['stocks','etf'])try{const data=await getJson('https://api.nasdaq.com/api/quote/'+encodeURIComponent(symbol)+'/dividends?assetclass='+assetClass);const rows=data?.data?.dividends?.rows;if(Array.isArray(rows))return rows}catch{}
  return[];
}
async function priceHistory(symbol,from){
  const period1=Math.floor(new Date(from+'T00:00:00Z').getTime()/1000),period2=Math.floor(Date.now()/1000)+86400,query='period1='+period1+'&period2='+period2+'&interval=1d&events=div%2Csplits&includeAdjustedClose=true';
  for(const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com'])try{const data=await getJson('https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?'+query,{'User-Agent':HEADERS['User-Agent'],'Accept':'application/json'});const result=data?.chart?.result?.[0];if(result?.timestamp?.length)return result}catch{}
  throw new Error('Yeniden yatırım fiyat geçmişi bulunamadı.');
}
module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase(),from=String(req.query.from||'');
  if(!/^[A-Z][A-Z0-9-]{0,14}$/.test(symbol)||!/^\d{4}-\d{2}-\d{2}$/.test(from))return res.status(400).json({error:'Geçersiz sembol veya başlangıç tarihi.'});
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
  try{
    const [rows,price]=await Promise.all([nasdaqRows(symbol),priceHistory(symbol,from)]),fromTime=Math.floor(new Date(from+'T00:00:00Z').getTime()/1000);
    const nasdaqEvents=rows.map(row=>({id:[row.exOrEffDate,row.paymentDate,row.amount].join('|'),exDate:parseDate(row.exOrEffDate),paymentDate:parseDate(row.paymentDate)||parseDate(row.exOrEffDate),amount:parseAmount(row.amount),currency:String(row.currency||price.meta?.currency||'USD').toUpperCase(),dateBasis:parseDate(row.paymentDate)?'payment_date':'ex_date_fallback'}));
    const yahooEvents=Object.values(price.events?.dividends||{}).map(item=>({id:String(item.date)+'|'+String(item.amount),exDate:Number(item.date),paymentDate:Number(item.date),amount:Number(item.amount),currency:String(price.meta?.currency||'USD').toUpperCase(),dateBasis:'ex_date_fallback'}));
    const providerEvents=nasdaqEvents.length?nasdaqEvents:yahooEvents;
    const events=providerEvents.filter(event=>event.paymentDate>=fromTime&&event.paymentDate<=Date.now()/1000&&Number.isFinite(event.amount)&&event.amount>0).sort((a,b)=>a.paymentDate-b.paymentDate);
    const closes=(price.timestamp||[]).map((time,index)=>({time,close:price.indicators?.quote?.[0]?.close?.[index]})).filter(point=>Number.isFinite(point.close)&&point.close>0);
    let closeIndex=0;const compactPrices=[];
    for(const event of events){while(closeIndex<closes.length&&closes[closeIndex].time<event.paymentDate)closeIndex++;const point=closes[closeIndex];if(point&&!compactPrices.some(item=>item.time===point.time))compactPrices.push(point)}
    const splits=Object.values(price.events?.splits||{}).map(item=>({id:String(item.date)+'|'+String(item.splitRatio||''),date:Number(item.date),numerator:Number(item.numerator),denominator:Number(item.denominator)})).filter(item=>Number.isFinite(item.date)&&Number.isFinite(item.numerator)&&Number.isFinite(item.denominator)&&item.denominator>0&&item.date>=fromTime).sort((a,b)=>a.date-b.date);
    const source=nasdaqEvents.length?'Nasdaq ödeme tarihleri + Yahoo Finance kapanış/split':'Yahoo Finance dağıtım tarihleri ve kapanış/split (ödeme tarihi bulunmadığında hak kullanım tarihi)';
    return res.status(200).json({status:events.length?'ok':'no_events',symbol,currency:String(price.meta?.currency||'USD').toUpperCase(),events,splits,prices:compactPrices,source});
  }catch(error){return res.status(502).json({status:'provider_error',events:[],error:error.message||'Temettü geçmişi alınamadı.'})}
};
module.exports._test={parseDate,parseAmount};
