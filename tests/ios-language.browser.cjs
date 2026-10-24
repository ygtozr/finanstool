const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();await page.waitForSelector('html[data-overview-pilot="ready"]');
  await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.pilot-quote strong'));
  const nav=label=>page.viewportSize().width>=1024?page.locator({Özet:'#desktopOverviewNav',Grafik:'#desktopChartNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click():page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  assert.equal(await page.locator('[data-appearance-preset]').count(),0,'Rejected theme shortcuts are absent');
  const data=()=>({books:localStorage.getItem('finans-grafigi-portfolios-v2'),favorites:localStorage.getItem('finans-grafigi-favorites')});
  await page.evaluate(()=>renderPortfolio());const before=await page.evaluate(data);
  for(const width of [375,390,430,1024])for(const mode of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(mode=>{OzerAppearance.restore({color:'monokrom',look:'cizgi'},false);OzerOverviewLegacy.theme(mode)},mode);
   for(const view of ['Özet','Grafik','Portföy','Diğer']){await nav(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${view} ${width}/${mode}: no horizontal overflow`);}
   await nav('Özet');
   const paint=await page.evaluate(()=>{const root=getComputedStyle(document.documentElement),s=n=>getComputedStyle(document.querySelector(n));return{family:s('body').fontFamily,heading:s('.market-summary-head h2').fontWeight,marketSize:parseFloat(s('.pilot-market-card .market-card-value').fontSize),labelSize:parseFloat(s('.pilot-market-card .market-card-label').fontSize),bodySize:parseFloat(s('body').fontSize),badge:s('.pilot-favorite-row .favorite-card-badge').borderRadius};});
   assert.match(paint.family,/-apple-system/);assert.equal(paint.heading,'600');assert(paint.marketSize>paint.labelSize,'Price hierarchy exceeds market labels');assert.equal(paint.bodySize,17);assert.equal(paint.badge,'10px');
   assert.equal(await page.locator('.favorite-actions .ui-icon[data-ui-icon="ellipsis"]').count(),3);assert.equal(await page.locator('.favorite-actions .ui-icon[data-ui-icon="starFilled"]').count(),3);
   assert.equal(await page.locator('#pilotMarketSettings .ui-icon[data-ui-icon="sliders"]').count(),1);
   const icons=await page.locator('.favorite-actions .ui-icon').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height,getComputedStyle(n.querySelector('path')).strokeWidth]}));assert(icons.every(([w,h,stroke])=>w===20&&h===20&&stroke==='1.75px'),'One consistent action icon size and weight');
   if(width<1024){const labels=await page.locator('.pilot-tabbar button').allTextContents();assert.deepEqual(labels,['Özet','Grafik','Portföy','Diğer']);assert.equal(await page.locator('.pilot-tabbar .is-active [data-ui-icon="homeFilled"]').count(),1);const y=(await page.locator('.pilot-tabbar').boundingBox()).y;await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));assert(Math.abs((await page.locator('.pilot-tabbar').boundingBox()).y-y)<1,'iOS tab bar remains fixed');await page.evaluate(()=>scrollTo(0,0));}
   if(width===390&&process.env.IOS_VISUAL_SCREENSHOTS){for(const view of ['Özet','Portföy','Diğer']){await nav(view);await page.screenshot({path:path.join(output,`ios-${mode}-${view}.png`),fullPage:true});}}
  }
  await page.setViewportSize({width:390,height:844});await nav('Portföy');await page.locator('#pilot-portfolioPrivacyToggle').click();assert.equal(await page.locator('#pilot-portfolioPrivacyToggle [data-ui-icon="eyeSlash"]').count(),1);await page.locator('#pilot-activePortfolioPrivacyToggle').click();assert.equal(await page.locator('#pilot-portfolioPrivacyToggle [data-ui-icon="eye"]').count(),1);
  assert.equal(await page.locator('#allPortfolioCurrencyToggle [data-ui-icon="exchange"]').count(),1);assert.equal(await page.locator('.portfolio-delete [data-ui-icon="close"]').count(),1);
  await page.locator('#portfolioBookRename').click();await page.locator('#portfolioBookCancel').click();
  await nav('Özet');await page.locator('.favorite-menu-trigger').first().click();await page.locator('.pilot-action-sheet.modal-in').waitFor();await page.getByRole('button',{name:'İşlemleri kapat'}).click();await page.waitForFunction(()=>!document.getElementById('pilot-navigation').inert);
  await nav('Diğer');await page.locator('#nativeFontUp').click();await nav('Özet');assert.equal(await page.locator('html').getAttribute('data-font-size'),'large');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.favorite-menu-trigger').first().evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
  assert.deepEqual(await page.evaluate(data),before,'Visual changes preserve financial data');assert.deepEqual(errors,[]);
  console.log('PASS: iOS SVG icons/active state, real typography hierarchy, 375/390/430/1024 light/dark on four pages, no shortcuts/overflow, fixed tabs, privacy/actions, large type and reduced motion, unchanged financial data');
 }finally{await context.close();}
};
