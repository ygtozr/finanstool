// Isolated synthetic fixtures: no user data, live accounts or supplier requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.PARITY_OUTPUT||'/tmp/ozer-overview-pilot';
const stamp=1789986600,prices=Array.from({length:270},(_,i)=>100+i*.17+Math.sin(i/8)*5),times=prices.map((_,i)=>stamp-(269-i)*86400);
const history=symbol=>({chart:{result:[{meta:{symbol,currency:'USD',longName:symbol+' örnek şirket',regularMarketTime:stamp,regularMarketPrice:prices.at(-1)},timestamp:times,indicators:{quote:[{close:prices,low:prices.map(p=>p-1),high:prices.map(p=>p+1)}],adjclose:[{adjclose:prices}]}}],error:null}});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 let unavailable=false;
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::')){errors.push(m.text());console.error('CONSOLE',m.text())}});
 await page.addInitScript(()=>{
  if(localStorage.getItem('parity-seeded'))return;
  localStorage.setItem('parity-seeded','1');
  localStorage.setItem('finans-grafigi-theme','dark');
  localStorage.setItem('finans-grafigi-appearance',JSON.stringify({color:'turkuaz',look:'seramik'}));
  localStorage.setItem('finans-grafigi-refresh-interval','0');
  localStorage.setItem('finans-grafigi-favorites',JSON.stringify([{symbol:'AAPL',name:'Apple Inc.'},{symbol:'MSFT',name:'Microsoft Corporation'},{symbol:'BJKAS.IS',name:'Beşiktaş Futbol Yatırımları'}]));
  localStorage.setItem('finans-grafigi-portfolios-v2',JSON.stringify(Array.from({length:6},(_,i)=>({id:'visual-'+i,name:['Uzun Vadeli','Temettü','Amerika','Birikim','Fonlar','Altın'][i],positions:i?[]:[{symbol:'AAPL',name:'Apple Inc.',quantity:10,baseQuantity:10,unitCost:110,costCurrency:'USD',dripEnabled:false}],cashBalances:[],createdAt:'2026-01-01T00:00:00Z'}))));
  localStorage.setItem('finans-grafigi-active-portfolio','visual-0');
 });
 await page.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.hostname!=='parity.test')return route.abort();
  if(u.pathname.startsWith('/api/')){
   const symbol=u.searchParams.get('symbol')||'AAPL';let data;requests.push(u.pathname+u.search);
   if(u.pathname==='/api/account')data={authenticated:false,user:null,configured:false};
   else if(u.pathname==='/api/prices'&&unavailable)data={results:{}};
   else if(u.pathname==='/api/prices')data={results:Object.fromEntries((u.searchParams.get('symbols')||'AAPL').split(',').map(s=>[s,{ok:true,data:u.searchParams.get('mode')==='compact'?{symbol:s,name:s==='AAPL'?'Apple Inc.':s==='MSFT'?'Microsoft Corporation':s,currency:s.endsWith('.IS')?'TRY':'USD',price:145.5,previousClose:143,delta:2.5,change:1.748,marketTimestamp:stamp,asOf:stamp,provider:'Test verisi'}:history(s)}]))};
   else if(u.pathname==='/api/quote')data={symbol,currency:'TRY',price:2.11,previousClose:2.08,delta:.03,change:1.44,asOf:stamp,priceType:'delayed_quote',delayed:true};
   else if(u.pathname.includes('dividend'))data={results:{},events:[],prices:[],status:'no_data'};
   else if(u.pathname==='/api/search')data={quotes:[{symbol:'NVDA',shortname:'NVIDIA'}]};
   else if(u.pathname==='/api/fundamentals')data={status:'no_data'};
   else if(u.pathname==='/api/logo')return route.abort();
   else data=history(symbol);
   return route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }
  const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.abort();
  return route.fulfill({contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });

 await page.goto('https://parity.test');
 await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong')&&document.querySelector('.pilot-quote strong'));
 const originals=await page.evaluate(()=>({portfolios:localStorage.getItem('finans-grafigi-portfolios-v2'),appearance:localStorage.getItem('finans-grafigi-appearance'),backup:Object.keys(createBackup().data).sort()}));
 for(const width of [375,390,430,1024]){
  await page.setViewportSize({width,height:844});
  for(const mode of ['light','dark']){
   await page.locator('.pilot-preferences button').filter({hasText:mode==='light'?'Açık':'Koyu'}).click();
   assert.equal(await page.locator('html').getAttribute('data-theme'),mode);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No overflow at '+width);
   assert.equal(await page.locator('.pilot-market-card').count(),8);
   assert.equal(await page.locator('.pilot-favorite-row').count(),3);
   if(width<601){
    const nav=await page.locator('.pilot-tabbar').boundingBox();
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    const moved=await page.locator('.pilot-tabbar').boundingBox();
    assert(Math.abs(nav.y-moved.y)<1,'Tab bar stays fixed');
    assert(Math.abs(moved.y+moved.height-844)<1,'Tab bar reaches viewport bottom');
   }
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(output,`${width}-${mode}.png`),fullPage:true});
   if(width<601){
    const links=await page.locator('.pilot-tabbar a').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
    assert(links.every(size=>size>width/5),'Each mobile tab has an evenly spaced touch target');
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 const compact=()=>requests.filter(url=>url.startsWith('/api/prices?')&&url.includes('mode=compact')).length;
 // Advance only the test clock beyond the existing 15s cache; keep policy intact.
 await page.clock.setSystemTime(new Date(Date.now()+60000));
 const before=compact();
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>!document.getElementById('marketRefresh').disabled);
 assert.equal(compact()-before,1,'Manual refresh uses exactly one shared compact batch');
 const last= requests.filter(url=>url.startsWith('/api/prices?')&&url.includes('mode=compact')).at(-1);
 const symbols=new URL('https://parity.test'+last).searchParams.get('symbols').split(',');
 assert.equal(symbols.length,new Set(symbols).size,'Batch symbols stay deduplicated');
 await page.locator('#favoriteSearch').fill('NVDA');
 await page.locator('#favoriteSearchSuggestions button').filter({hasText:'NVDA'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-favorite-row').length===4);
 assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites')))).some(item=>item.symbol==='NVDA'));
 await page.getByRole('button',{name:'NVDA işlemleri',exact:true}).click();
 await page.locator('.pilot-action-sheet.modal-in').waitFor();
 await page.locator('.pilot-action-sheet').getByRole('button',{name:'Favorilerden çıkar'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-favorite-row').length===3);
 // Other screens still execute their original code through the shared navigation.
 for(const [label,view] of [['Grafik','chartView'],['Portföy','portfolioView'],['Diğer','otherView'],['Özet','mainView']]){
  await page.locator('.pilot-tabbar').getByRole('link',{name:label,exact:true}).click();
  await page.waitForFunction(id=>!document.getElementById(id).hidden,view);
  assert.equal(await page.locator('.pilot-tabbar [aria-current="page"]').getAttribute('aria-label'),label);
 }
 await page.locator('.pilot-market-card').first().click();
 await page.waitForFunction(()=>!document.getElementById('chartView').hidden);
 await page.locator('.pilot-tabbar').getByRole('link',{name:'Özet',exact:true}).click();
 await page.locator('.pilot-favorite-main').first().click();
 await page.locator('#favoriteDetailDialog[open]').waitFor();
 await page.locator('.favorite-detail-close').click();
 // Reuse stable-slot hold/reorder and persist through the existing storage format.
 const first=page.locator('.pilot-favorite-main').first(),third=page.locator('.pilot-favorite-main').nth(2);
 await first.scrollIntoViewIfNeeded();const a=await first.boundingBox(),b=await third.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.waitForTimeout(440);
 assert.equal(await page.locator('.pilot-favorite-row.native-dragging').count(),1);
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites'))))[2].symbol,'AAPL');
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 assert.equal(await page.locator('.pilot-favorite-row').nth(2).getAttribute('data-symbol'),'AAPL','Favorite order survives reload');
 const current=await page.evaluate(()=>({portfolios:localStorage.getItem('finans-grafigi-portfolios-v2'),appearance:localStorage.getItem('finans-grafigi-appearance'),backup:Object.keys(createBackup().data).sort()}));
 assert.deepEqual(current,originals,'Portfolio, appearance and backup format unchanged');
 // Emulate standalone and real CSS env() insets through Chromium's device API.
 await page.addInitScript(()=>{
  const original=window.matchMedia.bind(window);
  window.matchMedia=query=>{
   const result=original(query);
   if(query==='(display-mode: standalone)')Object.defineProperty(result,'matches',{value:true});
   return result;
  };
  Object.defineProperty(navigator,'standalone',{value:true,configurable:true});
 });
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 const device=await context.newCDPSession(page);
 await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:47,bottom:34,left:0,right:0}});
 assert.equal(await page.locator('.pilot-tabbar').evaluate(n=>getComputedStyle(n).paddingBottom),'34px','Actual bottom env inset');
 assert.equal(Math.round((await page.locator('.pilot-tabbar').boundingBox()).height),90);
 assert.equal(await page.locator('main').evaluate(n=>getComputedStyle(n).paddingTop),'0px','No doubled top safe-area padding');
 assert.equal(await page.locator('.pilot-brand').evaluate(n=>getComputedStyle(n).paddingTop),'47px','Actual top env inset');
 assert.equal(await page.evaluate(()=>matchMedia('(display-mode: standalone)').matches&&navigator.standalone),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Standalone safe-area does not change viewport width');
 await page.screenshot({path:path.join(output,'standalone-safe-area.png')});
 await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:0,bottom:0,left:0,right:0}});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('meta[name="viewport"]').getAttribute('content'),'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

 // Automatic refresh also stays in the legacy scheduler, without a React timer.
 await page.addInitScript(()=>localStorage.setItem('finans-grafigi-refresh-interval','5000'));
 const startup=compact();
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong')&&document.querySelector('.pilot-quote strong'));
 assert.equal(compact()-startup,1,'Exactly one compact batch on automatic startup');
 await page.waitForResponse(response=>response.url().includes('/api/prices?mode=compact'),{timeout:12000});
 assert.equal(compact()-startup,2,'Exactly one next scheduler batch');
 unavailable=true;
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.locator('.pilot-market-card .pilot-error').first().waitFor();
 unavailable=false;
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong'));
 assert.equal(await page.locator('.pilot-market-card .pilot-error').count(),0,'Existing data service recovers after error');
 assert.deepEqual(errors,[],'No console or runtime errors');
 console.log('PASS: Overview 375/390/430/1024, batch/manual refresh, favorites add/remove/detail/reorder/reload, themes, legacy navigation, standalone/actual safe-area insets, automatic batch/error recovery, unchanged portfolio/backup, no console errors. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
