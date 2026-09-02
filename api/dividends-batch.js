const dividendsHandler=require('./dividends');

const SYMBOL=/^[A-Z0-9.^=-]{1,30}$/;
const MAX_SYMBOLS=40;
const rateBuckets=new Map();

function clientAddress(req){return String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()}
function allow(req){const now=Date.now(),key=clientAddress(req),current=rateBuckets.get(key);if(!current||now-current.time>=60000){rateBuckets.set(key,{time:now,count:1});return true}return++current.count<=20}

function invoke(symbol,req){
  return new Promise(async resolve=>{
    let statusCode=200,settled=false;
    const finish=(status,body)=>{if(settled)return;settled=true;resolve({ok:status>=200&&status<300,status,data:status>=200&&status<300?body:undefined,error:status>=200&&status<300?undefined:(body?.error||'Temettü verisi alınamadı.')})};
    const response={setHeader(){},status(code){statusCode=Number(code)||500;return response},json(body){finish(statusCode,body);return response}};
    try{await dividendsHandler({...req,method:'GET',query:{symbol}},response);if(!settled)finish(statusCode,{error:'Servis yanıt vermedi.'})}
    catch(error){finish(500,{error:error?.message||'Temettü verisi alınamadı.'})}
  });
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allow(req))return res.status(429).json({error:'Çok fazla toplu temettü isteği gönderildi.'});
  const symbols=[...new Set(String(req.query.symbols||'').split(',').map(value=>value.trim().toUpperCase()).filter(Boolean))];
  if(!symbols.length||symbols.length>MAX_SYMBOLS||symbols.some(symbol=>!SYMBOL.test(symbol)))return res.status(400).json({error:'Geçersiz veya çok uzun sembol listesi.'});
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=900, stale-while-revalidate=3600');
  const entries=await Promise.all(symbols.map(async symbol=>[symbol,await invoke(symbol,req)]));
  return res.status(200).json({results:Object.fromEntries(entries),servedAt:Date.now()});
};
