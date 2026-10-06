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
  await nav('Portföy');await page.locator('#portfolioBookRename').click();await page.locator('#portfolioBookName').fill('Amerika Uzun Vadeli Birikim Portföyü');await page.locator('#portfolioBookSave').click();
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);
   await nav('Grafik');const choice=await style('#chart-react [data-range="5d"]'),action=await style('#pilot-advancedSearchButton');
   assert((await page.locator('#chart-react [data-range="5d"]').boundingBox()).height>=44);
   assert.deepEqual(await style('#pilotChartPortfolioToggle'),choice,'Chart range and asset choice share geometry');
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-chart.png`)});
   await nav('Portföy');await page.evaluate(()=>renderPortfolio());
   for(const selector of ['#pilot-portfolioTotalMode','[data-benchmark-range="5d"]','[data-benchmark-symbol="^GSPC"]','.portfolio-book-tab'])assert.deepEqual(await style(selector),choice,`${selector} uses the shared choice design`);
   assert.match(await page.locator('.portfolio-book-tab').first().textContent(),/Amerika Uzun Vadeli Birikim Portföyü/);
   assert.equal(await page.locator('#pilot-portfolioTodayMode').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)','Paint only the inset compact surface');
   for(const size of ['small','standard','large']){
    await page.evaluate(size=>document.documentElement.dataset.fontSize=size,size);
    for(const selector of ['.portfolio-book-tab','.portfolio-metric-mode button','.benchmark-presets button','.benchmark-ranges button']){
     assert(await page.locator(selector).evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1)),selector+' labels fit at '+width+'/'+theme+'/'+size);
     for(const button of await page.locator(selector+':visible').all())assert((await button.boundingBox()).height>=44,'Compact choices retain touch targets');
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Large text has no horizontal overflow');
   }
   await page.evaluate(()=>document.documentElement.dataset.fontSize='standard');
   assert.equal(await page.locator('.portfolio-book-tab').first().evaluate(n=>getComputedStyle(n).textOverflow),'clip','Full book name wraps instead of ellipsis');
   assert.equal(await page.locator('#pilot-portfolioTodayMode').evaluate(n=>getComputedStyle(n,'::before').top),'5px','Compact paint is inset inside touch target');
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-portfolio.png`)});
   await nav('Diğer');
   assert.deepEqual(await style('#pilot-theme-light'),await style('[data-native-select="baseCurrencySelect"][data-value="USD"]'),'Compact settings choices share geometry');
   for(const group of ['.pilot-theme-controls','.native-segments.settings-segments']){
    assert((await page.locator(group+' button').first().boundingBox()).height>=44,'Compact paint retains a 44px touch target');
    assert.equal(await page.locator(group).evaluate(n=>getComputedStyle(n,'::before').top),'6px','Visible track is inset');
    assert(await page.locator(group).evaluate(n=>Math.abs(n.getBoundingClientRect().width-n.parentElement.clientWidth)<=1),'Three choices fill their row');
    assert.equal(await page.locator(group+' .segmented-highlight').evaluate(n=>getComputedStyle(n).backgroundColor),await page.evaluate(()=>{const n=document.createElement('span');n.style.background='var(--accent)';document.body.append(n);const c=getComputedStyle(n).backgroundColor;n.remove();return c}),'Selection uses the current accent');
   }
   assert.equal(await page.locator('#otherView .settings-grid > .settings-group').count(),0,'Merged groups are removed');
   assert.equal(await page.locator('#otherView .settings-grid > .settings-card').count(),10,'Original setting cards are restored');
   assert.equal(await page.locator('.market-card-value').first().evaluate(n=>getComputedStyle(n).fontVariantNumeric),'tabular-nums','Financial values use equal-width digits');
   for(const selector of ['#clearCacheButton','#backupDownload','#diagnosticsRefresh'])assert.deepEqual(await style(selector),action,`${selector} uses the shared action design`);
   assert.equal(await page.locator('#resetAppDataButton').evaluate(n=>getComputedStyle(n).color),await page.locator('body').evaluate(()=>{const n=document.createElement('span');n.style.color='var(--danger)';document.body.append(n);const color=getComputedStyle(n).color;n.remove();return color}),'Delete action retains danger color');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'No horizontal overflow');
   await page.screenshot({path:path.join(output,`${width}-${theme}-consistent-settings.png`)});
  }
  await nav('Portföy');await page.locator('#portfolioBookRename').click();
  assert.deepEqual(await style('#portfolioBookSave'),await style('#portfolioBookCancel'),'Confirm and cancel share action geometry');
  await page.locator('#portfolioBookCancel').click();
  await nav('Diğer');await page.locator('#pilot-theme-light').click();await page.waitForTimeout(250);
  assert.equal(await page.locator('.pilot-theme-controls').evaluate(n=>n.style.getPropertyValue('--selected-segment')),'2');
  await page.locator('[data-native-select="baseCurrencySelect"][data-value="USD"]').click();
  assert.equal(await page.locator('.native-segments.settings-segments').evaluate(n=>n.style.getPropertyValue('--selected-segment')),'2');
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const group of ['.pilot-theme-controls','.native-segments.settings-segments'])assert.equal(await page.locator(group+' .segmented-highlight').evaluate(n=>getComputedStyle(n).transitionDuration),'0s','Reduced motion disables sliding');
  console.log('PASS: shared control design across chart, portfolio and settings, 375/390/430/1024 light/dark, action/choice/danger geometry and overflow');
 }finally{await context.close();}
};
