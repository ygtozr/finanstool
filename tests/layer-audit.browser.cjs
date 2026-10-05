const assert=require('node:assert/strict');

module.exports=async function verifyLayers({browser,seed,routeHandler}){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.pathname==='/api/search'&&u.searchParams.get('q')==='LAYERS')return route.fulfill({contentType:'application/json',body:JSON.stringify({quotes:Array.from({length:8},(_,i)=>({symbol:'LAYER'+i,name:'Katman test şirketi '+i}))})});
   return routeHandler(route);
  });
  const page=await context.newPage();await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();await page.waitForSelector('html[data-overview-pilot="ready"]');
  const failures=[];
  const nav=label=>page.viewportSize().width>=1024?page.locator({Özet:'#desktopOverviewNav',Grafik:'#desktopChartNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click():page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  const hit=async(selector,label)=>{
   const result=await page.locator(selector).evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),p=n.closest('.search-suggestions,.theme-choices'),clip=p?.getBoundingClientRect();const y=r.y+r.height/2,x=r.x+r.width/2;if(!r.width||!r.height||y<70||y>innerHeight-85||(clip&&(y<clip.top||y>clip.bottom)))return null;const top=document.elementFromPoint(x,y);return n.contains(top)?null:{text:n.textContent.trim(),coveredBy:top?.className};}).filter(Boolean));
   if(result.length)failures.push({label,result});
  };
  for(const width of [375,390,430,1024])for(const theme of ['light','dark'])for(const look of ['mat','cam','cizgi','seramik','cerceve','isik','katman','doku']){
   await page.setViewportSize({width,height:844});await page.evaluate(({theme,look})=>{OzerAppearance.restore({color:'turkuaz',look},false);OzerOverviewLegacy.theme(theme);},{theme,look});
   for(const [label,input,list] of [['Grafik','#pilotChartSearch','#pilotChartSearchSuggestions'],['Portföy','#portfolioSymbol','#portfolioSuggestions']]){
    await nav(label);await page.locator(input).fill('LAYERS');await page.locator(list+'.visible button').first().waitFor();
    await page.locator(input).evaluate(n=>scrollTo(0,scrollY+n.getBoundingClientRect().top-130));await page.waitForTimeout(30);
    await hit(list+' button',width+'/'+theme+'/'+look+'/'+label);await page.locator(input).press('Escape');
   }
   await nav('Diğer');await page.locator('.appearance-menu').first().evaluate(n=>{n.open=true;scrollTo(0,scrollY+n.getBoundingClientRect().top-130)});await hit('.appearance-menu[open] .theme-choice',width+'/'+theme+'/'+look+'/appearance');await page.locator('.appearance-menu').first().evaluate(n=>n.open=false);
  }
  console.log('LAYER AUDIT',JSON.stringify(failures));assert.deepEqual(failures,[],'Dropdowns stay above adjacent surfaces in every material');
  await page.setViewportSize({width:390,height:500});await nav('Özet');await page.locator('#pilotMarketSettings').click();await page.locator('.pilot-market-popup.modal-in').waitFor();
  const close=page.locator('.pilot-market-popup .dialog-cancel');await close.scrollIntoViewIfNeeded();assert(await close.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'Popup action is above content and navigation');await close.click();await page.waitForFunction(()=>!document.getElementById('pilot-navigation').inert);
  await nav('Portföy');await page.locator('#portfolioBookRename').click();assert(await page.locator('#portfolioBookCancel').evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'Native dialog is above every ordinary layer');await page.locator('#portfolioBookCancel').click();
  await page.evaluate(()=>offerUndo('Katman test bildirimi',()=>{}));await page.locator('#undoButton').click();assert.equal(await page.locator('#undoToast').evaluate(n=>n.classList.contains('visible')),false,'Undo toast receives clicks above page content');
  await nav('Diğer');await page.locator('#accountAction').click();await page.locator('#authGate').waitFor();await page.locator('.pilot-tabbar').waitFor({state:'detached'});await page.locator('#authLocalContinue').scrollIntoViewIfNeeded();assert(await page.locator('#authLocalContinue').evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'Account gate remains accessible');await page.locator('#authLocalContinue').click();
  console.log('PASS: layer audit, four widths/two themes/eight materials, chart/portfolio/appearance dropdowns, popup, native dialog, toast and account gate');
 }finally{await context.close();}
};
