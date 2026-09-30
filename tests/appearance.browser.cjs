const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{
 const u=new URL(r.request().url()),file=path.resolve(__dirname,'..','.'+(u.pathname==='/'?'/index.html':u.pathname));
 if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,contentType:'application/json',body:'{"error":"offline test"}'});
 if(!file.startsWith(path.resolve(__dirname,'..')+path.sep)||!fs.existsSync(file))return r.abort();
 const ext=path.extname(file),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
 return r.fulfill({body:fs.readFileSync(file),contentType:types[ext]||'application/octet-stream'});
});
await page.goto('https://appearance.test');
await page.waitForFunction(()=>typeof OzerAppearance!=='undefined'&&document.querySelectorAll('[data-appearance-look]').length===8);
await page.locator('#authLocalContinue').click();
await page.evaluate(()=>setActiveView('other'));
assert.equal(await page.locator('[data-appearance-color]').count(),5);
await page.evaluate(()=>{
 const card=document.createElement('div');card.id='styleTestMarket';card.className='market-card';card.style.cssText='position:absolute;visibility:hidden;width:160px;top:0;left:0';
 card.innerHTML='<span class="market-card-label">USD/TRY</span><strong>42,00</strong><small class="market-card-change">+1,0%</small>';
 document.body.append(card);
 const surface=document.createElement('div');surface.id='styleTestSurface';surface.className='native-surface';surface.style.cssText='position:absolute;visibility:hidden;top:0;left:0';document.body.append(surface);
});
const boxes=[],lookStyles=[];
for(const mode of ['dark','light','system']){
 await page.locator('[data-theme-choice="'+mode+'"]').click();
 for(const color of ['klasik','turkuaz','safir','lavanta','sampanya']){
  await page.locator('.appearance-menu').first().locator('summary').click();
  await page.locator('[data-appearance-color="'+color+'"]').click();
  for(const look of ['mat','cam','cizgi','seramik','cerceve','isik','katman','doku']){
   await page.locator('.appearance-menu').last().locator('summary').click();
   await page.locator('[data-appearance-look="'+look+'"]').click();
   const state=await page.evaluate(()=>({color:document.documentElement.dataset.palette,look:document.documentElement.dataset.look,backup:createBackup().data.appearance,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.equal(state.color,color);assert.equal(state.look,look);assert.deepEqual(state.backup,{color,look});assert.equal(state.overflow,false);
   if(mode==='dark'&&color==='klasik')lookStyles.push(await page.evaluate(()=>{
    const card=getComputedStyle(document.getElementById('styleTestMarket')),surface=getComputedStyle(document.getElementById('styleTestSurface'));
    return [card.backgroundColor,card.backgroundImage,card.borderColor,card.boxShadow,card.outlineColor,card.backdropFilter,surface.boxShadow].join('|');
   }));
   boxes.push(await page.locator('[data-theme-choice="dark"]').boundingBox());
  }
 }
}
assert(boxes.every(b=>b.width===boxes[0].width&&b.height===boxes[0].height),'Styles must not change button geometry');
assert.equal(new Set(lookStyles).size,8,'All eight surface styles must be visibly distinct');
const marketSpacing=await page.locator('#styleTestMarket').evaluate(card=>({height:card.getBoundingClientRect().height,paddingTop:getComputedStyle(card).paddingTop,paddingBottom:getComputedStyle(card).paddingBottom}));
assert.equal(marketSpacing.paddingTop,'4px');assert.equal(marketSpacing.paddingBottom,'4px');assert(marketSpacing.height<=58,'Market card should stay compact');
await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.look==='doku');
if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
assert.equal(await page.evaluate(()=>OzerAppearance.snapshot().color),'sampanya');
await page.evaluate(()=>{const b=normalizeBackup(createBackup());b.appearance={color:'turkuaz',look:'cam'};applyBackup(b,'replace');});
assert.deepEqual(await page.evaluate(()=>OzerAppearance.snapshot()),{color:'turkuaz',look:'cam'});
assert.deepEqual(await page.evaluate(()=>OzerAppearance.normalize({color:'invalid',look:'invalid'})),{color:'klasik',look:'cizgi'});
await page.evaluate(()=>setActiveView('other'));
await page.locator('#appearanceChoices').screenshot({path:process.env.TEMP+'/ozer-v77-settings.png'});
await page.setViewportSize({width:1440,height:1000});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.deepEqual(errors,[]);
console.log('PASS: 120 combinations, mobile/desktop overflow, geometry, persistence, backup restore, no page errors');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
