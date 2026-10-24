const assert=require('node:assert/strict');

module.exports=async({browser,seed,routeHandler})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('html[data-overview-pilot="ready"]');
  await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.pilot-quote strong'));
  await page.evaluate(()=>renderPortfolio());
  const before=await page.evaluate(()=>({books:localStorage.getItem('finans-grafigi-portfolios-v2'),favorites:localStorage.getItem('finans-grafigi-favorites'),backupFields:Object.keys(createBackup().data).sort(),font:document.documentElement.dataset.fontSize}));
  const nav=label=>page.viewportSize().width>=1024?page.locator({Özet:'#desktopOverviewNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click():page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  const choices=[['acik-sade','light','monokrom','mat'],['kompakt-monokrom','dark','monokrom','cizgi'],['safir','dark','safir','cizgi']];
  for(const width of [375,390,430,1024]){
   await page.setViewportSize({width,height:844});await nav('Diğer');
   for(const [id,mode,color,look] of choices){
    await page.locator(`[data-appearance-preset="${id}"]`).click();
    await page.waitForFunction(mode=>document.querySelector(`#pilot-theme-${mode}`)?.getAttribute('aria-pressed')==='true',mode);
    const state=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,appearance:OzerAppearance.snapshot(),backup:createBackup().data.appearance,font:document.documentElement.dataset.fontSize,storedTheme:localStorage.getItem('finans-grafigi-theme')}));
    assert.deepEqual(state,{theme:mode,appearance:{color,look},backup:{color,look},font:before.font,storedTheme:mode});
    assert.equal(await page.locator('[data-appearance-preset][aria-pressed="true"]').count(),1);
    const boxes=await page.locator('[data-appearance-preset]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),label=n.querySelector('.appearance-preset-label');return {height:r.height,width:r.width,clipped:label.scrollHeight>label.clientHeight+1||label.scrollWidth>label.clientWidth+1}}));
    assert(boxes.every(b=>b.height===76&&!b.clipped),'All theme choices have equal height and readable labels');
    assert(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))<1,'Theme choices share row width equally');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(const view of ['Özet','Portföy','Diğer']){await nav(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
   }
  }
  await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();await page.waitForSelector('html[data-palette="safir"]');await nav('Diğer');
  assert.equal(await page.locator('[data-appearance-preset="safir"]').getAttribute('aria-pressed'),'true','Selected preset survives reload');
  const color=page.locator('[data-appearance-color="lavanta"]');await color.evaluate(n=>n.closest('details').open=true);await color.click();
  assert.equal(await page.locator('[data-appearance-preset][aria-pressed="true"]').count(),0,'Custom color clears the preset indicator');
  assert.match(await page.locator('#appearancePresetStatus').textContent(),/Özel görünüm/);
  await page.locator('[data-appearance-preset="kompakt-monokrom"]').click();await page.locator('#pilot-theme-system').click();
  assert.equal(await page.locator('[data-appearance-preset][aria-pressed="true"]').count(),0,'System preference stays independent');
  await page.emulateMedia({colorScheme:'light'});await page.waitForSelector('html[data-theme="light"]');
  await page.emulateMedia({colorScheme:'dark'});await page.waitForSelector('html[data-theme="dark"]');
  await page.evaluate(()=>{const backup=normalizeBackup(createBackup());backup.theme='light';backup.appearance={color:'monokrom',look:'mat'};applyBackup(backup,'replace')});
  await page.waitForFunction(()=>document.querySelector('[data-appearance-preset="acik-sade"]')?.getAttribute('aria-pressed')==='true');
  await page.setViewportSize({width:375,height:844});await nav('Diğer');
  await page.evaluate(()=>{const select=document.getElementById('fontSizeSelect');select.value='large';select.dispatchEvent(new Event('change',{bubbles:true}))});
  await page.locator('[data-appearance-preset="safir"]').click();
  assert.equal(await page.locator('html').getAttribute('data-font-size'),'large','Presets preserve large text preference');
  const after=await page.evaluate(()=>({books:localStorage.getItem('finans-grafigi-portfolios-v2'),favorites:localStorage.getItem('finans-grafigi-favorites'),backupFields:Object.keys(createBackup().data).sort()}));
  assert.deepEqual(after,{books:before.books,favorites:before.favorites,backupFields:before.backupFields},'Financial data and backup field set are unchanged');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('[data-appearance-preset="safir"]').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
  if(process.env.PRESET_SCREENSHOT)await page.locator('[aria-labelledby="appearanceTitle"]').screenshot({path:process.env.PRESET_SCREENSHOT});
  assert.deepEqual(errors,[],'No preset runtime errors');
  console.log('PASS: 3 theme presets at 375/390/430/1024, navigation, equal controls/no clipped text, reload, customization/system/backup restore, large text/reduced motion, unchanged financial data');
 }finally{await context.close();}
};
