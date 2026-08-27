export const config = { runtime: 'edge' };

const MIRROR_URL = 'https://fon.org.tr';
const OFFICIAL_URL = 'https://www.tefas.gov.tr';
const FUND_CODE = /^[A-Z0-9]{2,8}$/;
const KNOWN_FUND_NAMES = {
  YLB:'YAPI KREDİ PORTFÖY PARA PİYASASI FONU',
  YVD:'YAPI KREDİ PORTFÖY İKİNCİ PARA PİYASASI (TL) FONU',
  ENR:'QNB PORTFÖY ENPARA PARA PİYASASI (TL) FONU'
};

function cleanCode(value){
  const code=String(value||'').toUpperCase().replace('TEFAS-','').trim();
  return FUND_CODE.test(code)?code:'';
}

function fold(value){
  return String(value||'').replaceAll('ı','i').replaceAll('İ','I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
}

async function fetchJson(url,options={},timeoutMs=6500){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{...options,signal:controller.signal,headers:{Accept:'application/json, text/plain, */*','User-Agent':'Mozilla/5.0',...(options.headers||{})}});
    if(!response.ok)throw new Error('HTTP '+response.status);
    return await response.json();
  }finally{clearTimeout(timer)}
}

function timestamp(value){
  const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match?Math.floor(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]))/1000):null;
}

function rangeStart(query,lastTime){
  const params=new URLSearchParams(query||'');
  const period1=Number(params.get('period1'));
  if(Number.isFinite(period1)&&period1>0)return period1;
  const days={ '5d':14,'1mo':35,'3mo':100,'6mo':190,'1y':370,'2y':740,'5y':1860,'10y':3720 }[params.get('range')||'6mo'];
  return days?lastTime-days*86400:null;
}

function chartPayload(code,name,rawPoints,provider,extra={}){
  let points=rawPoints.map(item=>({time:timestamp(item.date||item.tarih),price:Number(item.price??item.fiyat)})).filter(item=>Number.isFinite(item.time)&&Number.isFinite(item.price)&&item.price>0).sort((a,b)=>a.time-b.time);
  points=points.filter((item,index)=>!index||item.time!==points[index-1].time);
  if(points.length<1)throw new Error('TEFAS fon fiyatı bulunamadı.');
  const timestamps=points.map(item=>item.time),closes=points.map(item=>item.price),lastTime=timestamps.at(-1);
  return {chart:{result:[{meta:{currency:'TRY',symbol:'TEFAS-'+code,shortName:code,longName:name||code,exchangeName:'TEFAS',fullExchangeName:'Türkiye Elektronik Fon Alım Satım Platformu',instrumentType:'MUTUALFUND',regularMarketTime:lastTime,regularMarketPrice:closes.at(-1),chartPreviousClose:closes.at(-2)??closes.at(-1),priceHint:6,timezone:'Europe/Istanbul',exchangeTimezoneName:'Europe/Istanbul',dataGranularity:'1d',dataProvider:provider,tefasFund:true,...extra},timestamp:timestamps,indicators:{quote:[{open:closes,high:closes,low:closes,close:closes,volume:closes.map(()=>null)}],adjclose:[{adjclose:closes}]},events:{}}],error:null},_finansTool:{provider,asOf:lastTime,servedAt:Date.now(),stale:false,tefasFund:true,...extra}};
}

async function mirrorFundNames(codes){
  if(!codes.length)return new Map();
  const payload=await fetchJson(MIRROR_URL+'/api/funds?noret=1',{},8000);
  const wanted=new Set(codes),names=new Map();
  for(const item of payload.results||[]){
    const code=cleanCode(item.code);
    if(wanted.has(code)&&item.title)names.set(code,String(item.title).trim());
  }
  return names;
}

async function mirrorPrice(code,query,name=''){
  const payload=await fetchJson(MIRROR_URL+'/api/fund-prices/'+encodeURIComponent(code));
  let points=payload.points||[];
  const parsed=points.map(item=>({item,time:timestamp(item.date)})).filter(entry=>Number.isFinite(entry.time)).sort((a,b)=>a.time-b.time);
  if(!parsed.length)throw new Error('TEFAS fon fiyatı bulunamadı.');
  const start=rangeStart(query,parsed.at(-1).time);
  if(start){const filtered=parsed.filter(entry=>entry.time>=start);if(filtered.length>=2)points=filtered.map(entry=>entry.item)}
  let fundName=name||KNOWN_FUND_NAMES[code]||code;
  if(fundName===code){
    try{const details=await fetchJson(MIRROR_URL+'/api/funds?search='+encodeURIComponent(code));const exact=(details.results||[]).find(item=>cleanCode(item.code)===code);if(exact?.title)fundName=String(exact.title).trim()}catch{}
  }
  return chartPayload(code,fundName,points,'Fon.org.tr / TEFAS');
}

async function officialPost(path,body){
  return fetchJson(OFFICIAL_URL+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:OFFICIAL_URL,Referer:OFFICIAL_URL+'/tr/fon-verileri'},body:JSON.stringify(body)},6000);
}

async function officialPrice(code,query){
  const params=new URLSearchParams(query||''),range=params.get('range')||'6mo';
  const requestedStart=Number(params.get('period1'))||null,requestedEnd=Number(params.get('period2'))||Math.floor(Date.now()/1000);
  const requestedMonths=requestedStart?Math.max(1,Math.ceil((requestedEnd-requestedStart)/(30.4375*86400))):({'5d':1,'1mo':1,'3mo':3,'6mo':6,'1y':12,'2y':24,'5y':60,'10y':120,max:120}[range]||6);
  const period=Math.min(60,requestedMonths),rangeLimited=requestedMonths>60;
  const payload=await officialPost('/api/funds/fonFiyatBilgiGetir',{fonKodu:code,dil:'TR',periyod:period});
  const rows=(payload.resultList||[]).filter(row=>!requestedStart||Number(timestamp(row.tarih||row.date))>=requestedStart);
  return chartPayload(code,String(rows.at(-1)?.fonUnvan||KNOWN_FUND_NAMES[code]||code).trim(),rows,'TEFAS',{rangeLimited,requestedStart});
}

async function price(code,query,name=''){
  try{return await mirrorPrice(code,query,name)}catch{return officialPrice(code,query)}
}

async function search(query){
  try{
    const payload=await fetchJson(MIRROR_URL+'/api/funds?search='+encodeURIComponent(query),{},8000);
    const quotes=(payload.results||[]).slice(0,30).map(item=>({symbol:'TEFAS-'+cleanCode(item.code),name:String(item.title||item.code||'').trim(),exchange:'TEFAS',type:'MUTUALFUND',provider:'Fon.org.tr / TEFAS'})).filter(item=>item.symbol!=='TEFAS-'&&item.name).sort((a,b)=>{
      const q=fold(query),aCode=a.symbol.replace('TEFAS-',''),bCode=b.symbol.replace('TEFAS-','');
      return Number(bCode===q)-Number(aCode===q)||Number(bCode.startsWith(q))-Number(aCode.startsWith(q));
    });
    if(quotes.length)return{quotes:quotes.slice(0,5),provider:'Fon.org.tr / TEFAS'};
  }catch{}
  const payload=await officialPost('/api/funds/fonUnvanAra',{aramaMetni:query});
  return{quotes:(payload.resultList||[]).slice(0,5).map(item=>({symbol:'TEFAS-'+cleanCode(item.fonKodu),name:String(item.fonUnvan||item.unvan||item.fonKodu).trim(),exchange:'TEFAS',type:'MUTUALFUND',provider:'TEFAS'})),provider:'TEFAS'};
}

function json(data,status=200,cache='public, max-age=0, s-maxage=900, stale-while-revalidate=86400'){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':cache,'CDN-Cache-Control':cache,'Vercel-CDN-Cache-Control':cache}});
}

export default async function handler(request){
  const url=new URL(request.url),action=url.searchParams.get('action')||'';
  try{
    if(action==='search'){
      const query=String(url.searchParams.get('q')||'').trim().slice(0,60);
      return query.length<2?json({quotes:[],provider:'TEFAS'}):json(await search(query),200,'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    }
    if(action==='price'){
      const code=cleanCode(url.searchParams.get('symbol'));
      if(!code)return json({error:'Geçersiz TEFAS fon kodu.'},400,'no-store');
      return json(await price(code,url.searchParams.get('query')||'range=6mo&interval=1d'));
    }
    if(action==='batch-price'){
      const codes=[...new Set(String(url.searchParams.get('symbols')||'').split(',').map(cleanCode).filter(Boolean))].slice(0,25);
      if(!codes.length)return json({results:{},provider:'TEFAS'});
      let names=new Map();try{names=await mirrorFundNames(codes)}catch{}
      const settled=await Promise.all(codes.map(async code=>{try{return[code,{ok:true,data:await price(code,url.searchParams.get('query')||'range=1mo&interval=1d',names.get(code)||'')}]}catch(error){return[code,{ok:false,error:error.message||'Fiyat alınamadı'}]}}));
      return json({results:Object.fromEntries(settled),provider:'Fon.org.tr / TEFAS'});
    }
    return json({error:'Geçersiz TEFAS işlemi.'},400,'no-store');
  }catch(error){return json({error:error.message||'TEFAS veri sağlayıcısına geçici olarak ulaşılamadı.'},503,'no-store')}
}
