const assert=require('node:assert/strict');
const path=require('node:path');
const version=require('../package.json').version;

// Synthetic isolated data: validates recovery from errors, without live accounts.
module.exports=async function verifyAuditFixes({browser,seed,routeHandler,output}){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);
  let searchUnavailable=true;
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.pathname==='/api/price'&&u.searchParams.get('symbol')==='FAIL')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Denetim: fiyat servisi erişilemiyor'})});
   if(u.pathname==='/api/search'&&u.searchParams.get('advanced')==='1'){
    if(searchUnavailable)return route.abort();
    return route.fulfill({contentType:'application/json',body:JSON.stringify({quotes:u.searchParams.get('q')==='EMPTY'?[]:[{symbol:'AAPL',name:'Apple',exchange:'NYSE',type:'EQUITY'}]})});
   }
   return routeHandler(route);
  });
  const page=await context.newPage(),errors=[];let downloads=0;
  page.on('pageerror',error=>errors.push(error.message));page.on('download',()=>downloads++);
  page.on('dialog',dialog=>dialog.accept());
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('#portfolioView[data-react-page="ready"]',{state:'attached'});
  const nav=async label=>{
   if(page.viewportSize().width>=1024)return page.locator({Özet:'#desktopOverviewNav',Portföy:'#desktopPortfolioNav',Grafik:'#desktopChartNav',Diğer:'#desktopMoreNav'}[label]).click();
   return page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  };
  await nav('Portföy');await page.evaluate(()=>renderPortfolio());
  await page.locator('#portfolioList .portfolio-row[data-symbol="AAPL"]').click();
  await page.locator('#portfolioDripEnabled').check();await page.locator('#portfolioPurchaseDate').fill('');
  await page.locator('#portfolioSave').click();assert.equal(await page.locator('#portfolioPurchaseDate').evaluate(n=>n.checkValidity()),false);
  await page.locator('#portfolioPurchaseDate').fill('2025-01-01');
  assert.equal(await page.locator('#portfolioPurchaseDate').evaluate(n=>n.checkValidity()),true);
  await page.locator('#portfolioSave').click();await page.waitForFunction(()=>!document.getElementById('portfolioDialog').open);
  assert.equal(await page.evaluate(()=>portfolio[0].purchaseDate),'2025-01-01');
  assert.equal(await page.evaluate(()=>portfolio[0].dripEnabled),true);
  await page.locator('#portfolioList .portfolio-row[data-symbol="AAPL"]').click();
  await page.locator('#portfolioPurchaseDate').fill('');await page.locator('#portfolioSave').click();
  await page.locator('#portfolioDripEnabled').uncheck();
  assert.equal(await page.locator('#portfolioPurchaseDate').evaluate(n=>n.checkValidity()),true);
  await page.locator('#portfolioSave').click();await page.waitForFunction(()=>!document.getElementById('portfolioDialog').open);
  await page.locator('#portfolioBookRename').click();await page.locator('#portfolioBookName').fill('Temettü');await page.locator('#portfolioBookSave').click();
  assert.equal(await page.locator('#portfolioBookName').evaluate(n=>n.checkValidity()),false);
  await page.locator('#portfolioBookName').fill('Denetim yeni adı');await page.locator('#portfolioBookSave').click();
  await page.waitForFunction(()=>!document.getElementById('portfolioBookDialog').open);
  assert.equal(await page.evaluate(()=>activePortfolioBook().name),'Denetim yeni adı');
  await page.locator('#portfolioBookAdd').click();await page.locator('#portfolioBookName').fill('Denetim yeni adı');await page.locator('#portfolioBookSave').click();
  assert.equal(await page.locator('#portfolioBookName').evaluate(n=>n.checkValidity()),false);
  await page.locator('#portfolioBookName').fill('Denetim yeni portföy');await page.locator('#portfolioBookSave').click();
  await page.waitForFunction(()=>!document.getElementById('portfolioBookDialog').open);
  assert.equal(await page.evaluate(()=>activePortfolioBook().name),'Denetim yeni portföy');
  await nav('Grafik');
  const load=async symbol=>{await page.locator('#pilotChartSearch').fill(symbol);await page.locator('#pilotChartSearch').press('Escape');await page.locator('#pilotChartSearchForm').evaluate(f=>f.requestSubmit());await page.waitForFunction(()=>!document.getElementById('submitButton').disabled);};
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);
   await load('AAPL');await page.waitForFunction(()=>chartExportReady&&chart);
   assert.equal(await page.locator('#pilot-exportCsv').getAttribute('aria-disabled'),'false');
   await load('FAIL');await page.waitForFunction(()=>document.getElementById('meta').textContent.includes('erişilemiyor'));
   assert.equal(await page.locator('#priceChart').isVisible(),false,'No empty stale graph area remains');
   assert.equal(await page.evaluate(()=>Chart.getChart(document.getElementById('priceChart'))),undefined);
   assert.equal(await page.evaluate(()=>Chart.getChart(document.getElementById('rsiChart'))),undefined);
   assert.deepEqual(await page.evaluate(()=>[lastLabels.length,lastPrices.length,lastRsiValues.length]),[0,0,0]);
   for(const id of ['Csv','Png'])assert.equal(await page.locator('#pilot-export'+id).getAttribute('aria-disabled'),'true');
   const before=downloads;await page.evaluate(async()=>{exportChartCsv();await exportChartPng()});assert.equal(downloads,before,'Native exports also refuse failed data');
   await page.screenshot({path:path.join(output,`${width}-${theme}-failed-chart-fixed.png`)});
  }
  await page.setViewportSize({width:390,height:844});await load('AAPL');await page.waitForFunction(()=>chartExportReady&&chart);
  assert.equal(await page.locator('#priceChart').isVisible(),true,'Successful retry restores the chart');
  const waiting=page.waitForEvent('download');await page.locator('#pilot-exportCsv').click();const dl=await waiting;assert.match(dl.suggestedFilename(),/\.csv$/);await dl.delete();
  await page.locator('#pilot-advancedSearchButton').click();await page.locator('#advancedQuery').fill('AUDIT');await page.locator('#advancedSearchForm button[type=submit]').click();
  await page.locator('#advancedResults [role="alert"]').waitFor();assert.match(await page.locator('#advancedResults').textContent(),/Arama servisine ulaşılamadı/);
  await page.screenshot({path:path.join(output,'advanced-search-error-fixed.png')});
  searchUnavailable=false;await page.locator('#advancedResults').getByRole('button',{name:'Tekrar Dene'}).click();await page.locator('.advanced-result').waitFor();
  await page.locator('#advancedQuery').fill('EMPTY');await page.locator('#advancedSearchForm button[type=submit]').click();
  await page.waitForFunction(()=>document.getElementById('advancedResults').textContent==='Uygun sonuç bulunamadı.');await page.locator('#advancedClose').click();
  await nav('Diğer');await page.locator('#priceDecimalsSelect').selectOption('6');await page.locator('#percentDecimalsSelect').selectOption('3');
  await page.setViewportSize({width:320,height:844});await nav('Özet');await page.locator('.market-card-value').first().waitFor();
  assert(await page.locator('.market-card-value,.market-card-change').evaluateAll(ns=>ns.every(n=>n.scrollWidth<=n.clientWidth+1)),'Full price and change remain readable at 320px');
  await page.screenshot({path:path.join(output,'320-precision-fixed.png')});
  await page.setViewportSize({width:1440,height:900});await nav('Diğer');
  assert.equal(await page.locator('#desktopVersion').textContent(),'v'+version);
  assert.equal(await page.locator('.settings-version strong').textContent(),'v'+version);
  assert.match(await page.title(),new RegExp(version.replaceAll('.','\\.')));
  await page.screenshot({path:path.join(output,'desktop-version-fixed.png')});
  assert.deepEqual(errors,[],'No runtime exceptions');
  console.log('PASS: audit fixes — date/DRIP and duplicate-name recovery, failed charts/exports and recovery, advanced error/retry/empty state, version consistency, compact price precision');
 }finally{await context.close();}
};
