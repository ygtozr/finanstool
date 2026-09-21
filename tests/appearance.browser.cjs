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
const boxes=[];
for(const mode of ['dark','light','system']){
 await page.locator('[data-theme-choice="'+mode+'"]').click();
 for(const color of ['klasik','turkuaz','safir','lavanta','sampanya']){
  await page.locator('[data-appearance-color="'+color+'"]').click();
  for(const look of ['mat','cam','cizgi','seramik','cerceve','isik','katman','doku']){
   await page.locator('[data-appearance-look="'+look+'"]').click();
   const state=await page.evaluate(()=>({color:document.documentElement.dataset.palette,look:document.documentElement.dataset.look,backup:createBackup().data.appearance,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.equal(state.color,color);assert.equal(state.look,look);assert.deepEqual(state.backup,{color,look});assert.equal(state.overflow,false);
   boxes.push(await page.locator('[data-theme-choice="dark"]').boundingBox());
  }
 }
}
assert(boxes.every(b=>b.width===boxes[0].width&&b.height===boxes[0].height),'Styles must not change button geometry');
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
