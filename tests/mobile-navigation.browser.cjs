const assert=require('node:assert/strict');

module.exports=async function verifyMobileNavigation({browser,seed,routeHandler}){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage();await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('html[data-overview-pilot="ready"]');
  const bar=page.locator('.pilot-tabbar');
  const check=async()=>{
   assert.equal(await bar.evaluate(n=>getComputedStyle(n).position),'fixed');
   const r=await bar.boundingBox();assert(Math.abs(r.y+r.height-page.viewportSize().height)<=1,'Navigation stays at the viewport bottom');
   for(const button of await bar.locator('button').all())assert(await button.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Every tab remains visible and receives touches');
  };
  for(const width of [375,390,430])for(const height of [844,500])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height});await page.evaluate(t=>OzerOverviewLegacy.theme(t),theme);
   for(const label of ['Özet','Grafik','Portföy','Diğer']){
    await bar.getByRole('button',{name:label,exact:true}).click();
    for(const fraction of [0,.5,1]){await page.evaluate(f=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f),fraction);await page.waitForTimeout(50);await check();}
   }
   await page.locator('#otherView .appearance-menu').first().evaluate(n=>n.open=true);await page.evaluate(()=>scrollBy(0,150));await check();
   await page.locator('#otherView .appearance-menu').first().evaluate(n=>n.open=false);
  }
  await bar.getByRole('button',{name:'Özet',exact:true}).click();await page.locator('.favorite-menu-trigger').first().click();await page.waitForTimeout(300);
  assert(await bar.locator('button').first().evaluate(n=>{const r=n.getBoundingClientRect();return !n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Modal sheet retains priority over navigation');
  await page.getByRole('button',{name:'İşlemleri kapat',exact:true}).click();await page.waitForFunction(()=>[...document.querySelectorAll('.pilot-tabbar button')].every(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));await check();
  await page.setViewportSize({width:1024,height:844});assert.equal(await bar.isVisible(),false,'Desktop uses its sidebar');
  console.log('PASS: mobile navigation fixed/visible/tappable across four pages, scroll positions, 375/390/430, short screens and light/dark; sheet priority and desktop sidebar');
 }finally{await context.close();}
};
