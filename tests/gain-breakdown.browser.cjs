const assert=require('node:assert/strict'),path=require('node:path');
module.exports=async({browser,seed,routeHandler,output})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);
  await context.addInitScript(()=>{
   if(sessionStorage.getItem('gains-seeded'))return;sessionStorage.setItem('gains-seeded','1');
   const books=JSON.parse(localStorage.getItem('finans-grafigi-portfolios-v2'));
   books[0].positions.push({symbol:'MSFT',name:'Microsoft',quantity:4,baseQuantity:4,unitCost:200,costCurrency:'USD',dripEnabled:false});
   books[0].cashBalances=[{currency:'USD',amount:100},{currency:'TRY',amount:100}];
   localStorage.setItem('finans-grafigi-portfolios-v2',JSON.stringify(books));
  });
  await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('#portfolioView[data-react-page="ready"]',{state:'attached'});
  const nav=async()=>{if(page.viewportSize().width>=1024)await page.locator('#desktopPortfolioNav').click();else await page.locator('.pilot-tabbar').getByRole('button',{name:'Portföy',exact:true}).click();};
  await nav();await page.evaluate(()=>renderPortfolio());
  await page.locator('#portfolioGains > summary').click();
  const parse=text=>Number(text.replace(/[^0-9,.-]/g,'').replaceAll('.','').replace(',','.'));
  const reconciles=async()=>{
   await page.locator('#portfolioGains[data-status="ready"]').waitFor();
   const values=await page.locator('.gain-line > strong').allTextContents(),sum=values.map(parse).reduce((a,b)=>a+b,0);
   const summary=parse((await page.locator('#portfolioDailyChange').textContent()).split(' · ')[0]);
   assert(Math.abs(sum-summary)<=values.length*.011,'Contributions reconcile to the existing portfolio summary within display rounding');
  };
  await page.locator('#pilot-portfolioTotalMode').click();await page.evaluate(()=>renderPortfolio());await reconciles();
  assert.equal(await page.locator('.gain-row .gain-identity strong').first().textContent(),'AAPL','Largest absolute contribution first');
  assert.equal(await page.locator('.gain-line > .negative').count(),1,'Loss is signed and red');
  const expected=10*((100+269*.17+Math.sin(269/8)*5)-110);
  assert.equal(await page.locator('.gain-line > strong').first().textContent(),await page.evaluate(v=>money(v,'USD'),expected),'Actual position profit uses the existing finance result');
  for(const width of [375,390,430,1024])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(theme=>OzerOverviewLegacy.theme(theme),theme);await nav();
   await page.locator('#portfolioGains').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
   await page.screenshot({path:path.join(output,`${width}-${theme}-gain-breakdown.png`)});
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#pilot-portfolioTodayMode').click();await page.evaluate(()=>renderPortfolio());await reconciles();
  await page.locator('#portfolioCurrencyToggle').click();await page.evaluate(()=>renderPortfolio());await reconciles();
  assert.match(await page.locator('.gain-meta').textContent(),/TRY/,'One comparison currency, including cash FX effects');
  const saved=await page.evaluate(()=>localStorage.getItem('finans-grafigi-portfolios-v2'));
  await page.locator('#pilot-activePortfolioPrivacyToggle').click();
  assert.equal(await page.locator('.gain-row').count(),0,'Privacy removes numbers and bars from the accessible DOM');
  assert.match(await page.locator('.gain-content').textContent(),/Rakamlar gizli/);
  await page.locator('#pilot-activePortfolioPrivacyToggle').click();await reconciles();
  assert.equal(await page.evaluate(()=>localStorage.getItem('finans-grafigi-portfolios-v2')),saved,'Read-only breakdown and privacy do not change portfolio data');
  await page.evaluate(()=>{window.gainsOriginal=fetchPortfolioItem;fetchPortfolioItem=async()=>{throw Error('Fixture unavailable')}});
  await page.evaluate(()=>renderPortfolio());assert.equal(await page.locator('#portfolioGains').getAttribute('data-status'),'error');assert.equal(await page.locator('.gain-row').count(),0,'Incomplete data never appears as zero gains');
  await page.evaluate(()=>{fetchPortfolioItem=window.gainsOriginal});await page.evaluate(()=>renderPortfolio());await reconciles();
  await page.locator('#portfolioBookSelect').selectOption('visual-1');await page.evaluate(()=>renderPortfolio());
  assert.equal(await page.locator('#portfolioGains').getAttribute('data-status'),'empty');assert.equal(await page.locator('.gain-row').count(),0,'Switching to an empty book clears old gains');
  await page.locator('#portfolioBookSelect').selectOption('visual-0');await page.evaluate(()=>renderPortfolio());await reconciles();
  await page.evaluate(()=>OzerGainBreakdown.render({status:'ready',mode:'total',currency:'USD',money,items:Array.from({length:7},(_,i)=>({symbol:'TEST'+i,name:'Uzun varlık adı '+i,value:i-3}))}));
  assert.equal(await page.locator('.gain-row').count(),5);await page.locator('.gain-expand').click();assert.equal(await page.locator('.gain-row').count(),7);await page.locator('.gain-expand').click();assert.equal(await page.locator('.gain-row').count(),5);
  await page.evaluate(()=>OzerGainBreakdown.render({status:'ready',mode:'total',currency:'USD',money,items:[{symbol:'SMALL',name:'Küçük tutar',value:.005},{symbol:'ZERO',name:'Sıfır',value:0}]}));
  assert.equal(await page.locator('.gain-bar').first().evaluate(n=>n.style.width),'50%','Small gains retain the same relative bar scale');
  assert.deepEqual(errors,[],'No gain breakdown runtime errors');
  console.log('PASS: gain breakdown, total/daily reconciliation including cash and FX, mixed currency, privacy, empty/error/recovery/switch, expansion and four widths/two themes');
 }finally{await context.close();}
};
