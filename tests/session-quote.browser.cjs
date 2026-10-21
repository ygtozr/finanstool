const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);
  await context.addInitScript(()=>{if(sessionStorage.getItem('session-fixture'))return;sessionStorage.setItem('session-fixture','1');const items=JSON.parse(localStorage.getItem('finans-grafigi-favorites'));items[0]={symbol:'NVDA',name:'NVIDIA'};localStorage.setItem('finans-grafigi-favorites',JSON.stringify(items));});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.pathname==='/api/prices'&&u.searchParams.get('mode')==='compact'){
    const now=Math.floor(Date.now()/1000),extendedSession={state:'post',price:147.1,regularPrice:145.3,asOf:now-60,start:now-3600,end:now+3600,delayed:true};
    return route.fulfill({contentType:'application/json',body:JSON.stringify({results:Object.fromEntries(u.searchParams.get('symbols').split(',').map(symbol=>[symbol,{ok:true,data:{symbol,name:symbol==='NVDA'?'NVIDIA':symbol,currency:'USD',price:145.3,previousClose:144.1,delta:1.2,change:.83,marketTimestamp:now-3600,extendedSession:symbol==='NVDA'?extendedSession:null}}]))})});
   }
   return routeHandler(route);
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();await page.waitForSelector('html[data-overview-pilot="ready"]');
  await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
  const card=page.locator('.pilot-favorite-row[data-symbol="NVDA"]');await card.locator('.favorite-session').waitFor();
  assert.equal(await card.locator('.favorite-card-price').textContent(),'$145,30','Regular price stays unchanged');
  assert.equal(await card.locator('.favorite-session-value strong').textContent(),'$147,10');
  assert.match(await card.locator('.favorite-session-value small').textContent(),/1,24/,'Change uses regular close as denominator');
  assert.equal(await page.locator('.pilot-favorite-row[data-symbol="MSFT"] .favorite-session').count(),0,'Unsupported/no-data card keeps original layout');
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>{OzerAppearance.restore({color:'monokrom',look:'cizgi'},false);OzerOverviewLegacy.theme(theme)},theme);
   await card.scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
   assert.equal(await card.locator('.favorite-menu-trigger').count(),1);assert.equal(await card.locator('.favorite-remove').count(),1,'Existing two actions retained');
   await page.screenshot({path:path.join(output,`${width}-${theme}-session-card.png`)});
  }
  await page.setViewportSize({width:390,height:844});await card.locator('.favorite-card').click();
  await page.locator('#favoriteDetailDialog[open] .favorite-session').waitFor();assert.equal(await page.locator('#favoriteDetailDialog .favorite-session-value strong').textContent(),'$147,10');await page.locator('#favoriteDetailClose').click();
  const update=async kind=>page.evaluate(kind=>{const q=favoriteQuotes.get('NVDA'),now=Math.floor(Date.now()/1000);q.stale=false;q.extendedSession={state:kind==='pre'?'pre':'post',price:144,regularPrice:145.3,asOf:now-60,start:now-3600,end:now+3600};if(kind==='expired')q.extendedSession.end=now-1;if(kind==='old')q.extendedSession.asOf=now-1000;if(kind==='stale')q.stale=true;if(kind==='timer')q.extendedSession.end=now+2;updateFavoriteQuoteCard('NVDA');},kind);
  await update('pre');await page.waitForFunction(()=>document.querySelector('.favorite-session-label')?.textContent.includes('Seans öncesi'));assert.equal(await card.locator('.favorite-session-value .negative').count(),1);
  for(const mode of ['expired','old','stale']){await update(mode);await card.locator('.favorite-session').waitFor({state:'detached'});assert.equal(await card.locator('.favorite-card-price').textContent(),'$145,30');}
  await update('timer');await card.locator('.favorite-session').waitFor();await card.locator('.favorite-session').waitFor({state:'detached',timeout:5000});
  assert.deepEqual(errors,[],'No session quote runtime errors');
  console.log('PASS: session card/detail, original price and controls, pre/post/change basis, stale/expired/timer removal, 375/390/430/1024 light/dark');
 }finally{await context.close();}
};
