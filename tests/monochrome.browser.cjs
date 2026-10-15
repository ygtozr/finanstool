const assert=require('node:assert/strict');
const path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test/?appearancePreview=monochrome');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('html[data-overview-pilot="ready"]');
  await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong')&&document.querySelector('.pilot-quote strong'));
  await page.evaluate(()=>renderPortfolio()); // Settle the existing provider-name enrichment before the data snapshot.
  const saved=await page.evaluate(()=>({appearance:localStorage.getItem('finans-grafigi-appearance'),books:localStorage.getItem('finans-grafigi-portfolios-v2')}));
  assert.deepEqual(JSON.parse(saved.appearance),{color:'turkuaz',look:'seramik'});
  assert.equal(await page.locator('html').getAttribute('data-look'),'seramik','Existing material is retained');
  const nav=async label=>{
   if(page.viewportSize().width>=1024)await page.locator({Özet:'#desktopOverviewNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click();
   else await page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
   if(label==='Portföy')await page.evaluate(()=>renderPortfolio());
  };
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);
   const tokens=await page.evaluate(()=>{
    const css=getComputedStyle(document.documentElement),get=k=>css.getPropertyValue('--'+k).trim();
    const lum=h=>h.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    const contrast=(a,b)=>(Math.max(lum(get(a)),lum(get(b)))+.05)/(Math.min(lum(get(a)),lum(get(b)))+.05);
    const names=['surface-page','surface-card','surface-control','text','muted','accent','on-accent','line'];
    return {neutral:names.every(k=>/^#([0-9a-f]{2})\1\1$/i.test(get(k))),accent:get('accent'),contrast:[contrast('text','surface-card'),contrast('muted','surface-card'),contrast('on-accent','accent')],positive:get('positive'),negative:get('negative')};
   });
   assert(tokens.neutral,'All interface surfaces and accent are neutral');
   assert.equal(tokens.accent,theme==='light'?'#171717':'#F5F5F5');
   assert(tokens.contrast.every(n=>n>=4.5),'Text and active buttons meet 4.5:1 contrast');
   assert.notEqual(tokens.positive,tokens.negative,'Financial direction stays distinguishable');
   for(const label of ['Özet','Portföy','Diğer']){
    await nav(label);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
    if(width===390||width===1024)await page.screenshot({path:path.join(output,`${width}-${theme}-monochrome-${label==='Özet'?'overview':label==='Portföy'?'portfolio':'settings'}.png`)});
   }
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('finans-grafigi-appearance')),saved.appearance,'Preview does not overwrite the saved color');
  assert.equal(await page.evaluate(()=>localStorage.getItem('finans-grafigi-portfolios-v2')),saved.books,'Portfolio format/data are unchanged');
  const choice=page.locator('[data-appearance-color="monokrom"]');await choice.evaluate(n=>n.closest('details').open=true);await choice.click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-appearance')).color),'monokrom','Explicit selection persists');
  await page.goto('https://parity.test');await page.waitForSelector('html[data-palette="monokrom"]');
  await page.evaluate(()=>{OzerAppearance.restore({color:'turkuaz',look:'seramik'});OzerOverviewLegacy.theme('dark')});
  assert.equal(await page.locator('html').getAttribute('data-palette'),'turkuaz','Old palette remains selectable');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--surface-page').trim()),'#101827','Old palette retains its original surfaces');
  assert.deepEqual(errors,[],'No runtime errors');
  console.log('PASS: monochrome, four widths/two themes, neutral tokens and contrast, overview/portfolio/settings, preference persistence and unchanged data');
 }finally{await context.close();}
};
