const HEADERS={'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/5.6)','Accept':'application/json, text/plain, */*'};
const TROY_OUNCE_GRAMS=31.1034768;
const PRODUCTS={
  'ALTIN-GRAM':{name:'Gram Altın (Spot)',providerCode:null},
  'ALTIN-CEYREK':{name:'Çeyrek Altın',providerCode:'C'},
  'ALTIN-YARIM':{name:'Yarım Altın',providerCode:'Y'},
  'ALTIN-TAM':{name:'Tam Altın',providerCode:'T'},
  'ALTIN-CUMHURIYET':{name:'Cumhuriyet Altını',providerCode:'CMR'},
  'ALTIN-ATA':{name:'Ata Altın',providerCode:'ATA'},
  'ALTIN-IKIBUCUK':{name:"2,5'lik Altın",providerCode:'IKB'},
  'ALTIN-BESLI':{name:'Beşli Altın',providerCode:'BSL'}
};
const inFlight=new Map(),lastGood=new Map();
let physicalCache={time:0,data:null,promise:null};

async function json(url,options={}){
  const response=await fetch(url,{...options,headers:{...HEADERS,...options.headers},signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('Altın veri sağlayıcısı '+response.status+' durumunu döndürdü.');
  return response.json();
}

function parseQuery(raw){
  const incoming=new URLSearchParams(String(raw||'range=1mo&interval=1d')),clean=new URLSearchParams();
  const range=incoming.get('range'),period1=incoming.get('period1'),period2=incoming.get('period2');
  if(range&&/^(5d|1mo|3mo|6mo|1y|2y|5y|10y|max)$/.test(range))clean.set('range',range);
  if(period1&&/^\d{9,12}$/.test(period1))clean.set('period1',period1);
  if(period2&&/^\d{9,12}$/.test(period2))clean.set('period2',period2);
  clean.set('interval','1d');clean.set('events','div,splits');
  if(!clean.has('range')&&!clean.has('period1'))clean.set('range','1mo');
  return clean;
}

async function yahoo(symbol,params){
  let error;
  for(const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com'])try{
    const data=await json('https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?'+params);
    const result=data?.chart?.result?.[0];
    if(result?.timestamp?.length&&result?.indicators?.quote?.[0]?.close?.some(Number.isFinite))return result;
  }catch(reason){error=reason}
  throw error||new Error('Altın bileşen verisi bulunamadı.');
}

async function tradingViewSpot(){
  const scan=(endpoint,ticker)=>json('https://scanner.tradingview.com/'+endpoint+'/scan',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://www.tradingview.com'},body:JSON.stringify({symbols:{tickers:[ticker],query:{types:[]}},columns:['name','close','change']})});
  const [gold,fx]=await Promise.all([scan('cfd','OANDA:XAUUSD'),scan('forex','FX_IDC:USDTRY')]);
  const ounce=Number(gold?.data?.[0]?.d?.[1]),usdTry=Number(fx?.data?.[0]?.d?.[1]);
  if(!Number.isFinite(ounce)||ounce<=0||!Number.isFinite(usdTry)||usdTry<=0)throw new Error('TradingView spot altın veya kur verisi bulunamadı.');
  return{ounce,usdTry};
}

function alignCalculated(ounce,fx){
  const fxPoints=new Map((fx.timestamp||[]).map((time,index)=>[new Date(time*1000).toISOString().slice(0,10),fx.indicators.quote[0].close[index]]));
  let lastFx=null;
  const points=[];
  for(let i=0;i<(ounce.timestamp||[]).length;i++){
    const time=ounce.timestamp[i],date=new Date(time*1000).toISOString().slice(0,10),ounceClose=ounce.indicators.quote[0].close[i];
    if(fxPoints.has(date)&&Number.isFinite(fxPoints.get(date)))lastFx=fxPoints.get(date);
    if(Number.isFinite(ounceClose)&&Number.isFinite(lastFx)&&lastFx>0)points.push({time,close:ounceClose*lastFx/TROY_OUNCE_GRAMS});
  }
  return points;
}

async function calculatedGram(params){
  const [ounce,fx,spot]=await Promise.all([yahoo('GC=F',params),yahoo('TRY=X',params),tradingViewSpot().catch(()=>null)]);
  const latestFuture=[...(ounce.indicators?.quote?.[0]?.close||[])].reverse().find(Number.isFinite),scale=spot&&Number.isFinite(latestFuture)&&latestFuture>0?spot.ounce/latestFuture:1;
  ounce.indicators.quote[0].close=ounce.indicators.quote[0].close.map(value=>Number.isFinite(value)?value*scale:value);
  const latestFxIndex=fx.indicators.quote[0].close.length-1;if(spot&&latestFxIndex>=0)fx.indicators.quote[0].close[latestFxIndex]=spot.usdTry;
  const points=alignCalculated(ounce,fx);
  if(!points.length)throw new Error('Gram altın hesabı için ons veya kur verisi bulunamadı.');
  return yahooShape('ALTIN-GRAM',PRODUCTS['ALTIN-GRAM'],points,spot?'TradingView spot formülü; geçmiş seri GC=F ile ölçekli':'GC=F × USD/TRY ÷ 31,1034768 yedek hesabı');
}

function yahooShape(symbol,product,points,source,{buy=null,sell=null}={}){
  const closes=points.map(point=>point.close),timestamps=points.map(point=>point.time),last=closes.at(-1),previous=closes.length>1?closes.at(-2):last;
  return{chart:{result:[{meta:{currency:'TRY',symbol,longName:product.name,shortName:product.name,instrumentType:'COMMODITY',regularMarketTime:timestamps.at(-1),regularMarketPrice:last,chartPreviousClose:previous,priceHint:2,dataProvider:source,goldProduct:true,goldBuyPrice:buy,goldSellPrice:sell},timestamp:timestamps,indicators:{quote:[{open:closes,high:closes,low:closes,close:closes,volume:closes.map(()=>null)}],adjclose:[{adjclose:closes}]},events:{}}],error:null},_finansTool:{provider:source,asOf:timestamps.at(-1),servedAt:Date.now(),stale:false,goldProduct:true}};
}

async function physicalQuotes(){
  if(physicalCache.data&&Date.now()-physicalCache.time<60000)return physicalCache.data;
  if(physicalCache.promise)return physicalCache.promise;
  const codes=[...new Set(Object.values(PRODUCTS).map(item=>item.providerCode).filter(Boolean))].join(',');
  physicalCache.promise=json('https://api.genelpara.com/json/?list=altin&sembol='+codes).then(data=>{physicalCache={time:Date.now(),data:data?.data||{},promise:null};return physicalCache.data}).finally(()=>{physicalCache.promise=null});
  return physicalCache.promise;
}

async function physical(symbol,product){
  const quotes=await physicalQuotes(),quote=quotes?.[product.providerCode],buy=Number(quote?.alis),sell=Number(quote?.satis);
  if(!Number.isFinite(buy)||buy<=0)throw new Error('Fiziki altın alış fiyatı bulunamadı.');
  const change=Number(quote?.degisim),previous=Number.isFinite(change)&&buy-change>0?buy-change:buy,now=Math.floor(Date.now()/1000);
  return yahooShape(symbol,product,[{time:now-86400,close:previous},{time:now,close:buy}],'GenelPara serbest piyasa alış',{buy,sell:Number.isFinite(sell)?sell:null});
}

async function resolve(symbol,params){
  const product=PRODUCTS[symbol];
  if(!product)throw new Error('Desteklenmeyen altın ürünü.');
  return product.providerCode?physical(symbol,product):calculatedGram(params);
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase(),product=PRODUCTS[symbol];
  if(!product)return res.status(400).json({error:'Geçersiz altın kodu.'});
  const params=parseQuery(req.query.query),key=symbol+'?'+params.toString();
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=60, stale-while-revalidate=120');
  let request=inFlight.get(key);
  if(!request){request=resolve(symbol,params).finally(()=>inFlight.delete(key));inFlight.set(key,request)}
  try{const data=await request;lastGood.set(key,{time:Date.now(),data});res.setHeader('X-Data-Provider',data._finansTool.provider);return res.status(200).json(data)}
  catch(error){const saved=lastGood.get(key);if(saved&&Date.now()-saved.time<86400000){saved.data._finansTool={...saved.data._finansTool,stale:true,servedAt:Date.now()};return res.status(200).json(saved.data)}return res.status(502).json({error:error.message||'Altın verisi alınamadı.'})}
};

module.exports._test={PRODUCTS,TROY_OUNCE_GRAMS,alignCalculated};
