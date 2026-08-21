const REQUEST_HEADERS={
  'User-Agent':'Mozilla/5.0 (compatible; OzerFinans/5.5)',
  'Accept':'application/json, image/svg+xml, image/*;q=0.9, */*;q=0.8'
};

const rateBuckets=new Map();
function allowRequest(req){
  const now=Date.now(),key=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const current=rateBuckets.get(key);
  if(!current||now-current.started>=60000){rateBuckets.set(key,{started:now,count:1});return true}
  current.count++;
  return current.count<=120;
}

async function tradingViewLogoId(ticker){
  const response=await fetch('https://scanner.tradingview.com/turkey/scan',{
    method:'POST',
    headers:{...REQUEST_HEADERS,'Content-Type':'application/json',Origin:'https://www.tradingview.com',Referer:'https://www.tradingview.com/'},
    body:JSON.stringify({symbols:{tickers:['BIST:'+ticker],query:{types:[]}},columns:['name','description','logoid']}),
    signal:AbortSignal.timeout(4500)
  });
  if(!response.ok)throw new Error('Logo meta verisi alınamadı');
  const payload=await response.json();
  const logoId=String(payload?.data?.[0]?.d?.[2]||'');
  if(!/^[a-z0-9-]{1,100}$/.test(logoId))throw new Error('Logo bulunamadı');
  return logoId;
}

module.exports=async(req,res)=>{
  res.setHeader('Allow','GET');
  if(req.method!=='GET')return res.status(405).json({error:'Yalnız GET yöntemi desteklenir.'});
  if(!allowRequest(req))return res.status(429).json({error:'Çok fazla logo isteği yapıldı.'});
  const symbol=String(req.query.symbol||'').trim().toUpperCase();
  if(!/^[A-Z0-9]{1,12}\.IS$/.test(symbol))return res.status(400).json({error:'Yalnız BIST sembolleri desteklenir.'});
  try{
    const ticker=symbol.slice(0,-3),logoId=await tradingViewLogoId(ticker);
    const imageResponse=await fetch('https://s3-symbol-logo.tradingview.com/'+logoId+'--big.svg',{headers:REQUEST_HEADERS,signal:AbortSignal.timeout(4500)});
    if(!imageResponse.ok)throw new Error('Logo görseli alınamadı');
    const contentType=String(imageResponse.headers.get('content-type')||'');
    if(!contentType.startsWith('image/'))throw new Error('Geçersiz logo yanıtı');
    const bytes=Buffer.from(await imageResponse.arrayBuffer());
    if(!bytes.length||bytes.length>500000)throw new Error('Geçersiz logo boyutu');
    res.setHeader('Content-Type',contentType);
    res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Logo-Provider','TradingView');
    return res.status(200).send(bytes);
  }catch{
    res.setHeader('Cache-Control','public, s-maxage=3600');
    return res.status(404).json({error:'Logo bulunamadı.'});
  }
};
