const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 fs.mkdirSync(output,{recursive:true});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test/?appearancePreview=ios-safir');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('html[data-overview-pilot="ready"]');
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.look),'ios');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-appearance'))),{color:'turkuaz',look:'seramik'},'Preview preserves saved preferences');
  const nav=async label=>{
   if(page.viewportSize().width>=1024)await page.locator({Özet:'#desktopOverviewNav',Grafik:'#desktopChartNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click();
   else await page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
   if(label==='Portföy')await page.evaluate(()=>renderPortfolio());
  };
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);await nav('Portföy');
   await page.locator('.portfolio-ios-actions').first().waitFor();
   assert.equal(await page.locator('.portfolio-ios-actions').first().locator('button').count(),3,'Cached rerenders do not duplicate actions');
   assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()),theme==='light'?'#245FD1':'#82ACFF');
   assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--surface-page').trim()),theme==='light'?'#F2F2F7':'#101722');
   assert.equal(await page.locator('.portfolio-overall-head').evaluate(n=>getComputedStyle(n).borderRadius),'14px');
   for(const button of await page.locator('.portfolio-ios-actions').first().locator('button').all()){
    assert.equal((await button.boundingBox()).height,44);
    assert(await button.evaluate(n=>{const r=n.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===n}),'Stock action remains clickable');
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
   await page.screenshot({path:path.join(output,`${width}-${theme}-ios-portfolio.png`)});
   await nav('Diğer');assert.equal(await page.locator('[data-appearance-look="ios"]').count(),1,'iOS style is available in settings');
   await page.screenshot({path:path.join(output,`${width}-${theme}-ios-settings.png`)});
  }
  await page.setViewportSize({width:390,height:844});await nav('Portföy');
  await page.getByRole('button',{name:'AAPL Grafik',exact:true}).click();await page.locator('#chart-react').waitFor();
  await nav('Portföy');await page.getByRole('button',{name:'AAPL Alarm',exact:true}).click();await page.locator('#alarmDialog[open]').waitFor();assert.equal(await page.locator('#alarmSymbol').inputValue(),'AAPL');await page.locator('#alarmClose').click();
  await page.getByRole('button',{name:'AAPL Ekle',exact:true}).click();await page.locator('#portfolioDialog[open]').waitFor();assert.equal(await page.locator('#portfolioSymbol').inputValue(),'AAPL');await page.locator('#portfolioCancel').click();
  await nav('Diğer');const choice=page.locator('[data-appearance-look="ios"]');await choice.evaluate(n=>n.closest('details').open=true);await choice.click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-appearance')).look),'ios','Explicit style choice persists');
  assert.deepEqual(errors,[],'No iOS runtime errors');
  console.log('PASS: iOS Safir light/dark, four widths, card/action geometry, saved preference protection and chart/alarm/portfolio handoffs');
 }finally{await context.close();}
};
