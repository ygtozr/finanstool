// Optional US extended-hours quotes. Regular prices and finance inputs are never replaced.
const EXCHANGES=new Set(['NMS','NGM','NCM','NYQ','ASE','PCX','BTS','BATS']);
const validNumber=value=>typeof value==='number'&&Number.isFinite(value);
function activeSession(meta,now=Date.now()/1000){
  if(!EXCHANGES.has(meta?.exchangeName)||meta?.currency!=='USD'||!['EQUITY','ETF'].includes(meta?.instrumentType))return null;
  for(const state of ['pre','post']){
    const period=meta.currentTradingPeriod?.[state];
    if(validNumber(period?.start)&&validNumber(period?.end)&&period.start<=now&&now<period.end)return{state,start:period.start,end:period.end};
  }
  return null;
}
function freshSession(value,now=Date.now()/1000){
  return value&&['pre','post'].includes(value.state)&&[value.price,value.regularPrice,value.asOf,value.start,value.end].every(validNumber)&&value.price>0&&value.regularPrice>0&&value.start<=value.asOf&&value.asOf<value.end&&value.start<=now&&now<value.end&&value.asOf<=now+60&&now-value.asOf<=900?value:null;
}
function fromChart(payload,regular,now=Date.now()/1000){
  const chart=payload?.chart?.result?.[0],session=activeSession(chart?.meta,now);
  if(!session||!validNumber(regular.price)||regular.price<=0||regular.stale)return null;
  const marketTime=regular.asOf,regularPeriod=chart.meta.currentTradingPeriod?.regular;
  if(!validNumber(marketTime)||!validNumber(regularPeriod?.start)||!validNumber(regularPeriod?.end)||session.state==='post'&&(marketTime<regularPeriod.start||marketTime>regularPeriod.end+60)||session.state==='pre'&&(marketTime>=session.start||now-marketTime>4*86400))return null;
  const closes=chart.indicators?.quote?.[0]?.close||[];
  const points=(chart.timestamp||[]).map((time,i)=>({time,price:closes[i]})).filter(p=>validNumber(p.time)&&validNumber(p.price)&&p.price>0&&p.time>=session.start&&p.time<session.end&&p.time<=now+60).sort((a,b)=>a.time-b.time);
  const point=points.at(-1);if(!point)return null;
  return freshSession({...session,price:point.price,regularPrice:regular.price,asOf:point.time,provider:'Yahoo Finance · 5 dk bar',delayed:true},now);
}
async function fetchExtended(symbol,meta,regular,{fetcher=fetch,now=Date.now()/1000}={}){
  if(!/^[A-Z][A-Z0-9.-]{0,14}$/.test(symbol)||!activeSession(meta,now)||regular.stale)return null;
  try{
    const response=await fetcher('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=1d&interval=5m&includePrePost=true',{headers:{'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/9.0.4)','Accept':'application/json'},signal:AbortSignal.timeout(2500)});
    return response.ok?fromChart(await response.json(),regular,now):null;
  }catch{return null;}
}
module.exports={activeSession,freshSession,fromChart,fetchExtended};
