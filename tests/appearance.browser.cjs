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
 for(const className of ['favorite-card','settings-card','native-plot-card','period-summary','portfolio-glance','portfolio-summary-card','distribution-card','portfolio-overall-head']){
  const sample=document.createElement('div');sample.className=className;sample.dataset.styleTestSurface=className;sample.style.cssText='position:absolute;visibility:hidden;top:0;left:0';document.body.append(sample);
 }
});
const boxes=[],lookStyles={},accentHex={klasik:'#52D5B1',turkuaz:'#00D5D8',safir:'#246BFF',lavanta:'#A78BFA',sampanya:'#D6A34B'};
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
   if(mode!=='system'){
    const paint=await page.evaluate(()=>{
     const root=document.documentElement,card=getComputedStyle(document.getElementById('styleTestMarket')),surface=getComputedStyle(document.getElementById('styleTestSurface'));
     const inspect=style=>({color:style.color,fill:style.backgroundColor,image:style.backgroundImage,imageSize:style.backgroundSize,border:style.borderColor,borderWidth:style.borderWidth,shadow:style.boxShadow,outline:style.outlineStyle,outlineWidth:style.outlineWidth,blur:style.backdropFilter,paddingTop:style.paddingTop,paddingBottom:style.paddingBottom});
     return {theme:root.dataset.theme,accent:root.style.getPropertyValue('--accent'),token:OzerAppearance.resolve({mode:root.dataset.theme,color:root.dataset.palette,look:root.dataset.look}),card:inspect(card),surface:inspect(surface),other:[...document.querySelectorAll('[data-style-test-surface]')].map(n=>inspect(getComputedStyle(n)))};
    });
    assert.equal(paint.theme,mode);assert.equal(paint.accent,accentHex[color]);
    assert.equal(paint.card.color,mode==='dark'?'rgb(238, 243, 251)':'rgb(23, 32, 51)');
    assert.equal(paint.card.border,mode==='dark'?'rgb(43, 58, 85)':'rgb(203, 213, 225)');
    assert.equal(paint.card.borderWidth,'1px');assert.equal(paint.surface.border,paint.card.border);
    assert.equal(paint.card.image==='none',paint.token.material.image==='none');
    assert.equal(paint.surface.image==='none',paint.token.material.image==='none');
    assert.equal(paint.card.shadow==='none',paint.token.material.shadow==='none');
    assert.equal(paint.surface.shadow==='none',paint.token.material.shadow==='none');
    assert.equal(paint.card.outline==='none',paint.token.material.outline==='none');
    assert.equal(paint.card.blur==='none',paint.token.material.blur==='none');
    for(const surfacePaint of paint.other){
     assert.equal(surfacePaint.fill,paint.card.fill,'Card backgrounds share the material resolver');
     assert.equal(surfacePaint.image,paint.card.image,'Card images share the material resolver');
     assert.equal(surfacePaint.shadow,paint.card.shadow,'Card shadows share the material resolver');
     assert.equal(surfacePaint.outline,paint.card.outline,'Card outlines share the material resolver');
     assert.equal(surfacePaint.blur,paint.card.blur,'Card blur shares the material resolver');
    }
    if(look==='cam')assert.notEqual(paint.card.fill,mode==='dark'?'rgb(13, 21, 35)':'rgb(255, 255, 255)');
    else assert.equal(paint.card.fill,mode==='dark'?'rgb(13, 21, 35)':'rgb(255, 255, 255)');
    if(['seramik','isik','katman'].includes(look))assert.match(paint.card.image,/linear-gradient/);
    if(look==='doku'){assert.match(paint.card.image,/radial-gradient/);assert.equal(paint.card.imageSize,'14px 14px');}
    if(look==='cerceve')assert.equal(paint.card.outlineWidth,'1px');
    if(look==='cam')assert.match(paint.card.blur,/blur\(20px\)/);
    if(look==='seramik')assert.match(paint.card.shadow,/5px 10px/);
    if(mode==='dark'&&color==='klasik')lookStyles[look]=JSON.stringify([paint.card.fill,paint.card.image,paint.card.shadow,paint.card.outline,paint.card.blur]);
   }
   boxes.push(await page.locator('[data-theme-choice="dark"]').boundingBox());
  }
 }
}
assert(boxes.every(b=>b.width===boxes[0].width&&b.height===boxes[0].height),'Styles must not change button geometry');
assert.equal(lookStyles.mat,lookStyles.cizgi,'Native Mat and İnce Çizgi intentionally share one AppCard material');
assert.equal(new Set(Object.values(lookStyles)).size,7,'The six remaining native materials must have their own paint');
const marketSpacing=await page.locator('#styleTestMarket').evaluate(card=>({height:card.getBoundingClientRect().height,paddingTop:getComputedStyle(card).paddingTop,paddingBottom:getComputedStyle(card).paddingBottom}));
assert.equal(marketSpacing.paddingTop,'4px');assert.equal(marketSpacing.paddingBottom,'4px');assert(marketSpacing.height<=58,'Market card should stay compact');
for(const [density,expected] of [['small',['11px','16px','11px']],['standard',['12px','17px','12px']],['large',['13px','18px','13px']]]){
 const actual=await page.evaluate(density=>{
  document.documentElement.dataset.fontSize=density;
  const card=document.getElementById('styleTestMarket');
  return [getComputedStyle(card.querySelector('.market-card-label')).fontSize,getComputedStyle(card.querySelector('strong')).fontSize,getComputedStyle(card.querySelector('.market-card-change')).fontSize,getComputedStyle(card).paddingTop];
 },density);
 assert.deepEqual(actual,[...expected,'4px'],'Market type roles must scale once without changing padding');
 await page.setViewportSize({width:320,height:700});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Density must not cause horizontal overflow at 320px');
}
await page.setViewportSize({width:390,height:844});
for(const scheme of ['light','dark']){
 await page.emulateMedia({colorScheme:scheme});
 await page.evaluate(()=>applyTheme('system',{persist:false}));
 assert.equal(await page.locator('html').getAttribute('data-theme'),scheme,'System mode must resolve OS appearance');
 assert.equal(await page.locator('#styleTestMarket').evaluate(n=>getComputedStyle(n).backgroundColor),scheme==='dark'?'rgb(13, 21, 35)':'rgb(255, 255, 255)');
}
await page.evaluate(()=>applyTheme('system',{persist:false}));
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
console.log('PASS: 80 computed material states, 2 OS system modes, 3 density roles, 120 preference combinations, mobile/desktop overflow, geometry, persistence, backup restore, no page errors');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
