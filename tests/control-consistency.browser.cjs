const assert=require('node:assert/strict');
const path=require('node:path');

module.exports=async function verifyControlConsistency({browser,seed,routeHandler,output}){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage();await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('#otherView[data-react-page="ready"]',{state:'attached'});
  const nav=async label=>page.viewportSize().width>=1024
   ?page.locator({Grafik:'#desktopChartNav',Portföy:'#desktopPortfolioNav',Diğer:'#desktopMoreNav'}[label]).click()
   :page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  const style=selector=>page.locator(selector).first().evaluate(n=>{
   const c=getComputedStyle(n);return Object.fromEntries(['borderRadius','borderWidth','borderStyle','paddingTop','paddingRight','paddingBottom','paddingLeft','fontSize','fontWeight','lineHeight','letterSpacing','textTransform'].map(k=>[k,c[k]]));
  });
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);
   await nav('Grafik');const choice=await style('#chart-react [data-range="5d"]'),action=await style('#pilot-advancedSearchButton');
   assert((await page.locator('#chart-react [data-range="5d"]').boundingBox()).height>=44);
   assert.deepEqual(await style('#pilotChartPortfolioToggle'),choice,'Chart range and asset choice share geometry');
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-chart.png`)});
   await nav('Portföy');await page.evaluate(()=>renderPortfolio());
   for(const selector of ['#pilot-portfolioTotalMode','[data-benchmark-range="5d"]','[data-benchmark-symbol="^GSPC"]','.portfolio-book-tab'])assert.deepEqual(await style(selector),choice,`${selector} uses the shared choice design`);
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-portfolio.png`)});
   await nav('Diğer');
   for(const selector of ['#pilot-theme-light','[data-native-select="baseCurrencySelect"][data-value="USD"]'])assert.deepEqual(await style(selector),choice,`${selector} uses the shared choice design`);
   for(const selector of ['#clearCacheButton','#backupDownload','#diagnosticsRefresh'])assert.deepEqual(await style(selector),action,`${selector} uses the shared action design`);
   assert.equal(await page.locator('#resetAppDataButton').evaluate(n=>getComputedStyle(n).color),await page.locator('body').evaluate(()=>{const n=document.createElement('span');n.style.color='var(--danger)';document.body.append(n);const color=getComputedStyle(n).color;n.remove();return color}),'Delete action retains danger color');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'No horizontal overflow');
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-settings.png`)});
  }
  await nav('Portföy');await page.locator('#portfolioBookRename').click();
  assert.deepEqual(await style('#portfolioBookSave'),await style('#portfolioBookCancel'),'Confirm and cancel share action geometry');
  await page.locator('#portfolioBookCancel').click();
  console.log('PASS: shared control design across chart, portfolio and settings, 375/390/430/1024 light/dark, action/choice/danger geometry and overflow');
 }finally{await context.close();}
};
