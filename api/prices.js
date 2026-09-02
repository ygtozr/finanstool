const priceHandler=require('./price');
const quoteHandler=require('./quote');
const goldHandler=require('./gold');
const tefasHandler=require('./tefas');

const SYMBOL=/^[A-Z0-9^=.-]{1,30}$/;
const MAX_SYMBOLS=40;
const rateBuckets=new Map();

function clientAddress(req){
  return String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
}

function allow(req){
  const now=Date.now(),key=clientAddress(req),current=rateBuckets.get(key);
  if(!current||now-current.time>=60000){rateBuckets.set(key,{time:now,count:1});return true}
  return++current.count<=30;
}

function invoke(handler,req,query){
  return new Promise(async resolve=>{
    let statusCode=200,settled=false;
    const finish=(status,body)=>{
      if(settled)return;
      settled=true;
      resolve({ok:status>=200&&status<300,status,data:status>=200&&status<300?body:undefined,error:status>=200&&status<300?undefined:(body?.error||'Veri alınamadı.')});
    };
    const response={
      setHeader(){},
      status(code){statusCode=Number(code)||500;return response},
      json(body){finish(statusCode,body);return response}
    };
    try{
      await handler({...req,method:'GET',query},response);
      if(!settled)finish(statusCode,{error:'Servis yanıt vermedi.'});
    }catch(error){finish(500,{error:error?.message||'Veri alınamadı.'})}
  });
}

async function resolveSymbol(symbol,query,req){
  const priceQuery=symbol.startsWith('TEFAS-')
    ?{action:'price',symbol,query}
    :{symbol,query};
  const handler=symbol.startsWith('TEFAS-')?tefasHandler:symbol.startsWith('ALTIN-')?goldHandler:priceHandler;
  const pricePromise=invoke(handler,req,priceQuery);
  const quotePromise=symbol.startsWith('TEFAS-')||symbol.endsWith('.IS')
    ?invoke(quoteHandler,req,{symbol})
    :Promise.resolve(null);
  const [price,quote]=await Promise.all([pricePromise,quotePromise]);
  return{price,quote};
}

function number(value){const parsed=Number(value);return Number.isFinite(parsed)?parsed:null}
async function resolveCompact(symbol,req){
  if(symbol.startsWith('TEFAS-')||symbol.endsWith('.IS')){
    const result=await invoke(quoteHandler,req,{symbol});
    if(!result.ok)throw new Error(result.error||'Fiyat alınamadı.');
    return result.data;
  }
  const handler=symbol.startsWith('ALTIN-')?goldHandler:priceHandler,result=await invoke(handler,req,{symbol,query:'range=5d&interval=1d'});
  if(!result.ok)throw new Error(result.error||'Fiyat alınamadı.');
  const chart=result.data?.chart?.result?.[0],closes=chart?.indicators?.quote?.[0]?.close||[],points=(chart?.timestamp||[]).map((time,index)=>({time:Number(time),price:number(closes[index])})).filter(item=>Number.isFinite(item.time)&&Number.isFinite(item.price)&&item.price>0);
  if(!points.length)throw new Error('Fiyat bulunamadı.');
  const last=points.at(-1),previous=points.at(-2)||last,meta=chart.meta||{};
  return{symbol,name:meta.longName||meta.shortName||symbol,currency:String(meta.currency||'USD').toUpperCase(),price:last.price,previousClose:previous.price,delta:last.price-previous.price,change:previous.price?(last.price/previous.price-1)*100:null,asOf:number(meta.regularMarketTime)||last.time,provider:meta.dataProvider||result.data?._finansTool?.provider||'',priceType:'compact_chart',delayed:false,stale:Boolean(result.data?._finansTool?.stale)};
}

async function mapWithLimit(items,limit,worker){const output=new Array(items.length);let cursor=0;async function run(){while(cursor<items.length){const index=cursor++;output[index]=await worker(items[index],index)}}await Promise.all(Array.from({length:Math.min(limit,items.length)},run));return output}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allow(req))return res.status(429).json({error:'Çok fazla toplu fiyat isteği gönderildi.'});
  const symbols=[...new Set(String(req.query.symbols||'').split(',').map(value=>value.trim().toUpperCase()).filter(Boolean))];
  if(!symbols.length||symbols.length>MAX_SYMBOLS||symbols.some(symbol=>!SYMBOL.test(symbol)))return res.status(400).json({error:'Geçersiz veya çok uzun sembol listesi.'});
  const compact=String(req.query.mode||'')==='compact',query=String(req.query.query||'range=1mo&interval=1d');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=10, stale-while-revalidate=20');
  res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=10, stale-while-revalidate=20');
  const entries=await mapWithLimit(symbols,6,async symbol=>{if(!compact)return[symbol,await resolveSymbol(symbol,query,req)];try{return[symbol,{ok:true,data:await resolveCompact(symbol,req)}]}catch(error){return[symbol,{ok:false,error:error.message||'Fiyat alınamadı.'}]}});
  return res.status(200).json({results:Object.fromEntries(entries),servedAt:Date.now()});
};

