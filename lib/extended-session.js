// Optional US extended-hours quotes. Regular prices and finance inputs are never replaced.
const EXCHANGES=new Set(['NMS','NGM','NCM','NYQ','ASE','PCX','BTS','BATS']);
const validNumber=value=>typeof value==='number'&&Number.isFinite(value);
const supported=meta=>EXCHANGES.has(meta?.exchangeName)&&meta?.currency==='USD'&&['EQUITY','ETF'].includes(meta?.instrumentType);
const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function parts(time){const p={};clock.formatToParts(new Date(time*1000)).forEach(x=>p[x.type]=x.value);return p;}
function dayKey(time){const p=parts(time);return p.year+'-'+p.month+'-'+p.day;}
function regularOpenAfter(end){
  const p=parts(end),date=new Date(Date.UTC(+p.year,+p.month-1,+p.day));
  do{date.setUTCDate(date.getUTCDate()+1);}while([0,6].includes(date.getUTCDay()));
  const target=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),9,30)/1000;
  let result=target;
  for(let i=0;i<3;i++){const q=parts(result);result+=target-Date.UTC(+q.year,+q.month-1,+q.day,+q.hour,+q.minute,+q.second)/1000;}
  return result;
}
function activeSession(meta,now=Date.now()/1000){
  if(!supported(meta))return null;
  for(const state of ['pre','post']){const period=meta.currentTradingPeriod?.[state];if(validNumber(period?.start)&&validNumber(period?.end)&&period.start<=now&&now<period.end)return{state,start:period.start,end:period.end};}
  return null;
}
function regularActive(meta,now){const p=meta?.currentTradingPeriod?.regular;return validNumber(p?.start)&&validNumber(p?.end)&&p.start<=now&&now<p.end;}
// Accept a dated last-known session until the next regular open, never as a live quote.
function freshSession(value,now=Date.now()/1000){
  if(!value||!['pre','post'].includes(value.state)||![value.price,value.regularPrice,value.asOf,value.start,value.end].every(validNumber)||value.price<=0||value.regularPrice<=0||value.start>value.asOf||value.asOf>=value.end||value.end<=value.start||value.asOf>now+60||now-value.asOf>7*86400)return null;
  const limit=value.state==='pre'?value.end:regularOpenAfter(value.end);
  const validUntil=validNumber(value.validUntil)?Math.min(value.validUntil,value.asOf+7*86400,value.state==='pre'?value.end:Infinity):limit;
  if(now>=validUntil||now<value.start)return null;
  return{...value,validUntil,lastKnown:Boolean(value.lastKnown)||now>=value.end||now-value.asOf>900};
}
function periods(value){return Array.isArray(value)?value.flatMap(periods):value&&validNumber(value.start)&&validNumber(value.end)?[value]:[];}
function periodAt(chart,time){
  for(const state of ['pre','post']){
    const candidates=[chart.meta.currentTradingPeriod?.[state],...periods(chart.tradingPeriods?.[state])];
    const p=candidates.find(p=>validNumber(p?.start)&&validNumber(p?.end)&&p.start<=time&&time<p.end);
    if(p)return{state,start:p.start,end:p.end};
  }
  // Recover a previous day's bars when currentTradingPeriod already describes tomorrow.
  const p=parts(time);if(['Sat','Sun'].includes(p.weekday))return null;
  const seconds=+p.hour*3600 + +p.minute*60 + +p.second,midnight=time-seconds;
  const regular=[chart.meta.currentTradingPeriod?.regular,...periods(chart.tradingPeriods?.regular||chart.tradingPeriods)].find(p=>validNumber(p?.start)&&validNumber(p?.end)&&dayKey(p.start)===dayKey(time));
  const open=regular?.start??midnight+9.5*3600,close=regular?.end??midnight+16*3600;
  if(time>=midnight+4*3600&&time<open)return{state:'pre',start:midnight+4*3600,end:open};
  if(time>=close&&time<midnight+20*3600)return{state:'post',start:close,end:midnight+20*3600};
  return null;
}
function fromChart(payload,regular,now=Date.now()/1000){
  const chart=payload?.chart?.result?.[0];
  if(!supported(chart?.meta)||regularActive(chart.meta,now)||!validNumber(regular.price)||regular.price<=0||!validNumber(regular.asOf)||regular.stale)return null;
  const closes=chart.indicators?.quote?.[0]?.close||[];
  const points=(chart.timestamp||[]).map((time,i)=>({time,price:closes[i]})).filter(p=>validNumber(p.time)&&validNumber(p.price)&&p.price>0&&p.time<=now+60&&now-p.time<=7*86400).sort((a,b)=>b.time-a.time);
  for(const point of points){
    const session=periodAt(chart,point.time);if(!session)continue;
    if(session.state==='post'&&(dayKey(regular.asOf)!==dayKey(point.time)||regular.asOf>session.start+60))continue;
    if(session.state==='pre'&&(regular.asOf>=session.start||point.time-regular.asOf>4*86400))continue;
    const next=chart.meta.currentTradingPeriod?.regular?.start;
    const validUntil=session.state==='pre'?session.end:validNumber(next)&&next>session.end?next:regularOpenAfter(session.end);
    const result=freshSession({...session,validUntil,price:point.price,regularPrice:regular.price,asOf:point.time,provider:'Yahoo Finance · 5 dk bar',delayed:true},now);
    if(result)return result;
  }
  return null;
}
async function fetchExtended(symbol,meta,regular,{fetcher=fetch,now=Date.now()/1000}={}){
  if(!/^[A-Z][A-Z0-9.-]{0,14}$/.test(symbol)||!supported(meta)||regularActive(meta,now)||regular.stale)return null;
  try{
    const response=await fetcher('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=5d&interval=5m&includePrePost=true',{headers:{'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/9.0.4)','Accept':'application/json'},signal:AbortSignal.timeout(2500)});
    return response.ok?fromChart(await response.json(),regular,now):null;
  }catch{return null;}
}
module.exports={activeSession,freshSession,fromChart,fetchExtended,regularOpenAfter};
