const HEADERS={
  'User-Agent':'Mozilla/5.0 (compatible; FinansTool/4.1)',
  'Accept':'application/json, text/plain, */*'
};

const GOLD_QUOTES=[
  {symbol:'ALTIN-GRAM',name:'Gram Altın (Spot)',exchange:'Türkiye',type:'COMMODITY'},
  {symbol:'ALTIN-CEYREK',name:'Çeyrek Altın',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-YARIM',name:'Yarım Altın',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-TAM',name:'Tam Altın',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-CUMHURIYET',name:'Cumhuriyet Altını',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-ATA',name:'Ata Altın',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-IKIBUCUK',name:'2,5’luk Altın',exchange:'Serbest Piyasa',type:'COMMODITY'},
  {symbol:'ALTIN-BESLI',name:'Beşli Altın',exchange:'Serbest Piyasa',type:'COMMODITY'}
];

function goldQuotes(query,limit){
  const normalized=String(query||'').toLocaleLowerCase('tr-TR').replace(/[’']/g,'');
  return GOLD_QUOTES.filter(item=>(item.symbol+' '+item.name).toLocaleLowerCase('tr-TR').replace(/[’']/g,'').includes(normalized)).slice(0,limit);
}

async function fetchJson(url,headers=HEADERS){
  const response=await fetch(url,{headers,signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw new Error('Sağlayıcı hatası');
  return response.json();
}

function yahooQuotes(data,limit){
  return (data?.quotes||[])
    .filter(item=>item.symbol&&(item.shortname||item.longname))
    .slice(0,limit)
    .map(item=>({
      symbol:item.symbol,
      name:item.shortname||item.longname,
      exchange:item.exchDisp||item.exchange||'',
      type:item.quoteType||''
    }));
}

function nasdaqQuotes(data,limit){
  return (Array.isArray(data?.data)?data.data:[])
    .filter(item=>item?.symbol&&item?.name)
    .slice(0,limit)
    .map(item=>({
      symbol:String(item.symbol).toUpperCase(),
      name:item.name,
      exchange:item.exchange||'',
      type:item.asset==='STOCKS'?'EQUITY':(item.asset||'')
    }));
}

const rateBuckets=new Map();
function allowRequest(req){
  const now=Date.now(),key=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const current=rateBuckets.get(key);
  if(!current||now-current.started>=60000){rateBuckets.set(key,{started:now,count:1});return true}
  current.count++;
  return current.count<=90;
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({quotes:[],error:'Yalnız GET yöntemi desteklenir.'});
  if(!allowRequest(req))return res.status(429).json({quotes:[],error:'Çok fazla arama yapıldı. Kısa süre sonra yeniden deneyin.'});
  const q=String(req.query.q||'').trim().slice(0,40);
  const advanced=String(req.query.advanced||'')==='1';
  const forcedFallback=String(req.query.provider||'')==='fallback';
  const limit=advanced?20:5;
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
  if(!q)return res.status(200).json({quotes:[]});
  const gold=goldQuotes(q,limit);
  if(gold.length)return res.status(200).json({quotes:gold,provider:'Özer Finans altın ürünleri'});
  if(!forcedFallback){
    try{
      const data=await fetchJson('https://query1.finance.yahoo.com/v1/finance/search?q='+encodeURIComponent(q));
      const quotes=yahooQuotes(data,limit);
      if(quotes.length){
        res.setHeader('X-Data-Provider','Yahoo Finance');
        return res.status(200).json({quotes,provider:'Yahoo Finance'});
      }
    }catch{}
  }
  try{
    const data=await fetchJson('https://api.nasdaq.com/api/autocomplete/slookup/20?search='+encodeURIComponent(q),{...HEADERS,Origin:'https://www.nasdaq.com',Referer:'https://www.nasdaq.com/'});
    const quotes=nasdaqQuotes(data,limit);
    res.setHeader('X-Data-Provider','Nasdaq');
    return res.status(200).json({quotes,provider:'Nasdaq'});
  }catch{
    try{
      const data=await fetchJson('https://query2.finance.yahoo.com/v1/finance/search?q='+encodeURIComponent(q));
      const quotes=yahooQuotes(data,limit);
      res.setHeader('X-Data-Provider','Yahoo Finance secondary');
      return res.status(200).json({quotes,provider:'Yahoo Finance ikincil erişim'});
    }catch{
      return res.status(502).json({quotes:[],error:'Arama sağlayıcılarına ulaşılamadı.'});
    }
  }
};
