const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 for(const timezoneId of ['Europe/Istanbul','America/Los_Angeles']){
 const context=await browser.newContext({timezoneId,viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);
  await context.addInitScript(()=>{if(sessionStorage.getItem('session-fixture'))return;sessionStorage.setItem('session-fixture','1');const items=JSON.parse(localStorage.getItem('finans-grafigi-favorites'));items[0]={symbol:'NVDA',name:'NVIDIA'};localStorage.setItem('finans-grafigi-favorites',JSON.stringify(items));});
  let closedFixture=false;
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.pathname==='/api/prices'&&u.searchParams.get('mode')==='compact'){
    const now=Math.floor(Date.now()/1000),extendedSession={state:'post',price:147.1,regularPrice:145.3,asOf:now-60,start:now-3600,end:closedFixture?now-1:now+3600,validUntil:now+3600,delayed:true};
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
   const geometry=await card.locator('.favorite-session').evaluate(n=>{
    const label=n.querySelector('.favorite-session-label'),price=n.querySelector('strong'),change=n.querySelector('.favorite-session-value small');
    return{height:n.getBoundingClientRect().height,centers:[label,price,change].map(el=>{const r=el.getBoundingClientRect();return r.y+r.height/2})};
   });
   assert(geometry.height<24,'Session information occupies one compact line');
   assert(Math.max(...geometry.centers)-Math.min(...geometry.centers)<5,'Label/time, price and percentage share the same line');
   assert.equal(await card.locator('.favorite-menu-trigger').count(),1);assert.equal(await card.locator('.favorite-remove').count(),1,'Existing two actions retained');

  }
  await page.setViewportSize({width:390,height:844});await card.locator('.favorite-card').click();
  await page.locator('#favoriteDetailDialog[open] .favorite-session').waitFor();assert.equal(await page.locator('#favoriteDetailDialog .favorite-session-value strong').textContent(),'$147,10');await page.locator('#favoriteDetailClose').click();
  const assertLocalTime=async(dated=false,detail=false)=>{
   const asOf=await page.evaluate(()=>favoriteQuotes.get('NVDA').extendedSession.asOf);
   const expected=new Intl.DateTimeFormat('tr-TR',{timeZone:timezoneId,...(dated?{day:'2-digit',month:'2-digit'}:{}),hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(asOf*1000)).replace(',', '');
   const label=detail?page.locator('#favoriteDetailDialog .favorite-session-label'):card.locator('.favorite-session-label');
   assert((await label.textContent()).includes(' · '+expected),`${timezoneId}: local ${dated?'date and ':''}time ${expected}`);
   assert(!(await label.textContent()).includes(' ET'),'ET suffix is removed');
  };
  await assertLocalTime();
  await card.locator('.favorite-card').click();await page.locator('#favoriteDetailDialog[open] .favorite-session').waitFor();await assertLocalTime(false,true);await page.locator('#favoriteDetailClose').click();
  const update=async kind=>page.evaluate(kind=>{const q=favoriteQuotes.get('NVDA'),now=Math.floor(Date.now()/1000);q.stale=false;q.extendedSession={state:kind==='pre'?'pre':'post',price:144,regularPrice:145.3,asOf:now-60,start:now-3600,end:now+3600,validUntil:now+3600};if(kind==='closed')q.extendedSession.end=now-1;if(kind==='expired')q.extendedSession.validUntil=now-1;if(kind==='old')q.extendedSession.asOf=now-1000;if(kind==='stale')q.stale=true;if(kind==='future')q.extendedSession.asOf=now+500;if(kind==='timer')q.extendedSession.end=now+2;if(kind==='nextOpen')q.extendedSession.validUntil=now+2;updateFavoriteQuoteCard('NVDA');},kind);
  await update('pre');await page.waitForFunction(()=>document.querySelector('.favorite-session-label')?.textContent.includes('Seans öncesi'));assert.equal(await card.locator('.favorite-session-value .negative').count(),1);
  for(const mode of ['closed','old','stale']){await update(mode);await page.waitForFunction(()=>document.querySelector('.favorite-session-label')?.textContent.includes('Son seans'));assert.match(await card.locator('.favorite-session-label').textContent(),/\d{2}[./]\d{2}/,'Last-known quote includes its date');assert.equal(await card.locator('.favorite-card-price').textContent(),'$145,30');}
  for(const width of [375,390,430,1024]){await page.setViewportSize({width,height:844});assert((await card.locator('.favorite-session').boundingBox()).height<24,'Dated last-known quote stays on one line');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Dated quote does not overflow');}
  await page.setViewportSize({width:390,height:844});
  await update('timer');await page.waitForFunction(()=>document.querySelector('.favorite-session-label')?.textContent.includes('Son seans'),{},{timeout:5000});assert.equal(await card.locator('.favorite-session').count(),1,'Session end relabels the quote instead of deleting it');
  await assertLocalTime(true);
  // UTC evening crosses midnight in Istanbul; timer must use the local calendar date too.
  await page.evaluate(()=>{const q=favoriteQuotes.get('NVDA'),now=Math.floor(Date.now()/1000),day=Math.floor(now/86400)*86400;let asOf=day+22*3600+30*60;if(asOf>now-60)asOf-=86400;q.extendedSession={state:'post',price:144,regularPrice:145.3,asOf,start:asOf-3600,end:now+2,validUntil:now+3600};updateFavoriteQuoteCard('NVDA');});
  await page.waitForFunction(()=>document.querySelector('.favorite-session-label')?.textContent.includes('Son seans'));
  await assertLocalTime(true);
  await card.locator('.favorite-card').click();await page.locator('#favoriteDetailDialog[open] .favorite-session').waitFor();await assertLocalTime(true,true);await page.locator('#favoriteDetailClose').click();
  for(const mode of ['expired','future']){await update(mode);await card.locator('.favorite-session').waitFor({state:'detached'});}
  await update('nextOpen');await card.locator('.favorite-session').waitFor();await card.locator('.favorite-session').waitFor({state:'detached',timeout:5000});
  closedFixture=true;await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();await page.waitForSelector('html[data-overview-pilot="ready"]');await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();await card.locator('.favorite-session').waitFor();assert.match(await card.locator('.favorite-session-label').textContent(),/Son seans sonrası/,'Cold load outside the session still displays its last quote');
  assert.deepEqual(errors,[],'No session quote runtime errors');
  console.log(timezoneId+' PASS: local date/time, session card/detail, original price and controls, pre/post/change basis, retained closed/stale/cold-load quotes and next-open expiry, 375/390/430/1024 light/dark');
 }finally{await context.close();}
 }
};
