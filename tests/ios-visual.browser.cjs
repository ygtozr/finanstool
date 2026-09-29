// Isolated synthetic fixtures: no user data, live accounts or supplier requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.PARITY_OUTPUT||'/private/tmp/ozer-web-ios-parity';
const stamp=1789986600,prices=Array.from({length:270},(_,i)=>100+i*.17+Math.sin(i/8)*5),times=prices.map((_,i)=>stamp-(269-i)*86400);
const history=symbol=>({chart:{result:[{meta:{symbol,currency:'USD',longName:symbol+' örnek şirket',regularMarketTime:stamp,regularMarketPrice:prices.at(-1)},timestamp:times,indicators:{quote:[{close:prices,low:prices.map(p=>p-1),high:prices.map(p=>p+1)}],adjclose:[{adjclose:prices}]}}],error:null}});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  if(localStorage.getItem('parity-seeded'))return;
  localStorage.setItem('parity-seeded','1');
  localStorage.setItem('finans-grafigi-theme','dark');
  localStorage.setItem('finans-grafigi-refresh-interval','0');
  localStorage.setItem('finans-grafigi-favorites',JSON.stringify([{symbol:'AAPL',name:'Apple Inc.'},{symbol:'MSFT',name:'Microsoft Corporation'},{symbol:'BJKAS.IS',name:'Beşiktaş Futbol Yatırımları'}]));
  localStorage.setItem('finans-grafigi-portfolios-v2',JSON.stringify(Array.from({length:6},(_,i)=>({id:'visual-'+i,name:['Uzun Vadeli','Temettü','Amerika','Birikim','Fonlar','Altın'][i],positions:i?[]:[{symbol:'AAPL',name:'Apple Inc.',quantity:10,baseQuantity:10,unitCost:110,costCurrency:'USD',dripEnabled:false}],cashBalances:[],createdAt:'2026-01-01T00:00:00Z'}))));
  localStorage.setItem('finans-grafigi-active-portfolio','visual-0');
 });
 await page.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.hostname!=='parity.test')return route.abort();
  if(u.pathname.startsWith('/api/')){
   const symbol=u.searchParams.get('symbol')||'AAPL';let data;
   if(u.pathname==='/api/account')data={authenticated:false,user:null,configured:false};
   else if(u.pathname==='/api/prices')data={results:Object.fromEntries((u.searchParams.get('symbols')||'AAPL').split(',').map(s=>[s,{ok:true,data:u.searchParams.get('mode')==='compact'?{symbol:s,name:s,currency:s.endsWith('.IS')?'TRY':'USD',price:145.5,previousClose:143,delta:2.5,change:1.748,marketTimestamp:stamp,asOf:stamp,provider:'Test verisi'}:history(s)}]))};
   else if(u.pathname==='/api/quote')data={symbol,currency:'TRY',price:2.11,previousClose:2.08,delta:.03,change:1.44,asOf:stamp,priceType:'delayed_quote',delayed:true};
   else if(u.pathname.includes('dividend'))data={results:{},events:[],prices:[],status:'no_data'};
   else if(u.pathname==='/api/search')data={quotes:[{symbol:'AAPL',shortname:'Apple Inc.'}]};
   else if(u.pathname==='/api/fundamentals')data={status:'no_data'};
   else if(u.pathname==='/api/logo')return route.abort();
   else data=history(symbol);
   return route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }
  const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.abort();
  return route.fulfill({contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
 await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
 await page.waitForFunction(()=>document.querySelector('#nativeFontUp')&&document.querySelector('.favorite-card-price'));
 assert.deepEqual(errors,[],'Startup errors');
 const favoriteAlignment=await page.locator('.favorite-card').first().evaluate(card=>{
  const middle=card.getBoundingClientRect().top+card.getBoundingClientRect().height/2;
  return ['.favorite-card-badge','.favorite-card-head','.favorite-card-quote'].map(selector=>{const r=card.querySelector(selector).getBoundingClientRect();return Math.abs(r.top+r.height/2-middle)});
 });
 assert(favoriteAlignment.every(offset=>offset<3),'Favorite logo, name and quote should share the card center');
 const view=async name=>{await page.evaluate(async name=>{setActiveView(name);await refreshActiveView({force:true});if(name==='portfolio')await renderPortfolioBenchmark();},name);await page.evaluate(()=>scrollTo(0,0));};
 const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
 for(const mode of ['dark','light']){
  await page.evaluate(mode=>applyTheme(mode),mode);
  for(const name of ['main','chart','portfolio','other']){
   await view(name);if(name==='chart')await page.waitForFunction(()=>typeof chart!=='undefined'&&chart?.data.datasets[0].data.length);
   await noOverflow();await page.screenshot({path:path.join(output,mode+'-'+name+'.png'),fullPage:true});
  }
 }
 await view('other');await page.locator('#nativeFontUp').click();
 assert.equal(await page.locator('html').getAttribute('data-font-size'),'large');
 await page.locator('#nativeFontDown').click();
 await page.locator('[data-native-select="baseCurrencySelect"][data-value="TRY"]').click();
 assert.equal(await page.evaluate(()=>createBackup().data.preferences.baseCurrency),'TRY');
 await page.locator('.appearance-menu summary').first().click();await page.locator('[data-appearance-color="lavanta"]').click();
 assert.equal(await page.locator('.appearance-menu .appearance-value').first().innerText(),'Lavanta');
 await page.locator('.appearance-menu summary').last().click();await page.locator('[data-appearance-look="doku"]').click();
 assert.equal(await page.locator('html').getAttribute('data-look'),'doku');
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 assert.equal(await page.locator('html').getAttribute('data-look'),'doku');
 await view('portfolio');
 const tops=await page.locator('.portfolio-book-tab').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
 assert.equal(tops[0],tops[2]);assert(tops[3]>tops[2],'Three portfolios per row');
 async function drag(from,to,cancel=false){
  await from.scrollIntoViewIfNeeded();const a=await from.boundingBox(),b=await to.boundingBox();
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.waitForTimeout(430);
  assert.equal(await page.locator('.native-dragging').count(),1);
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.waitForTimeout(50);
  if(cancel)await page.keyboard.press('Escape');await page.mouse.up();await page.waitForTimeout(200);
  assert.equal(await page.locator('.native-dragging').count(),0);
 }
 await drag(page.locator('.portfolio-book-tab').first(),page.locator('.portfolio-book-tab').nth(4));
 const saved=await page.evaluate(()=>createBackup().data.portfolios.map(b=>b.id));assert.equal(saved[4],'visual-0');
 await drag(page.locator('.portfolio-book-tab').first(),page.locator('.portfolio-book-tab').nth(2),true);
 assert.deepEqual(await page.evaluate(()=>createBackup().data.portfolios.map(b=>b.id)),saved,'Cancel must not save');
 await view('main');await page.locator('#marketSettingsButton').click();
 assert(await page.locator('#marketSettingsForm').evaluate(n=>n.compareDocumentPosition(document.getElementById('marketSettingsList'))&Node.DOCUMENT_POSITION_FOLLOWING));
 const before=await page.evaluate(()=>createBackup().data.marketItems.map(i=>i.symbol));
 await drag(page.locator('.market-settings-row > span').first(),page.locator('.market-settings-row > span').nth(2));
 assert.equal((await page.evaluate(()=>createBackup().data.marketItems.map(i=>i.symbol)))[2],before[0]);
 await page.locator('#marketSettingsClose').click();
 await drag(page.locator('.favorite-card').first(),page.locator('.favorite-card').nth(2));
 assert.equal((await page.evaluate(()=>createBackup().data.favorites.map(i=>i.symbol)))[2],'AAPL');
 // Touch tap still opens detail; touch hold reorders without a duplicate click.
 const card=page.locator('.favorite-card').first();await card.scrollIntoViewIfNeeded();await card.tap();
 assert(await page.locator('dialog[open]').count());await page.keyboard.press('Escape');
 const beforeTouch=await page.evaluate(()=>createBackup().data.favorites.map(i=>i.symbol));
 await page.locator('.favorite-card').first().scrollIntoViewIfNeeded();
 const ta=await page.locator('.favorite-card').first().boundingBox(),tb=await page.locator('.favorite-card').nth(1).boundingBox();
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:ta.x+ta.width/2,y:ta.y+ta.height/2}]});
 await page.waitForTimeout(430);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tb.x+tb.width/2,y:tb.y+tb.height/2}]});
 await page.waitForTimeout(80);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
 assert.equal((await page.evaluate(()=>createBackup().data.favorites.map(i=>i.symbol)))[1],beforeTouch[0],'Touch reorder');
 assert.equal(await page.locator('dialog[open]').count(),0,'Drag must not also open detail');
 await page.evaluate(()=>scrollTo(0,0));
 const swipeCard=await page.locator('.favorite-card').first().boundingBox();
 const swipeX=swipeCard.x+Math.min(60,swipeCard.width/3),swipeY=swipeCard.y+swipeCard.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:swipeX,y:swipeY}]});
 for(let delta=25;delta<=175;delta+=25){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:swipeX,y:swipeY-delta}]});await page.waitForTimeout(20)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);
 assert(await page.evaluate(()=>scrollY)>20,'Swiping a favorite card should use native page scrolling');
 await view('chart');
 const periodColumns=await page.locator('.periods').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length);assert.equal(periodColumns,3);
 await page.locator('#maToggle').click();assert.equal(await page.locator('#maToggle').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#maToggle').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)','MA switch has no filled button background');
 await page.waitForFunction(()=>chart.data.datasets.length===4);
 const plot=await page.locator('#priceChart').boundingBox();await page.mouse.move(plot.x+plot.width*.7,plot.y+plot.height*.5);
 await page.waitForFunction(()=>chart.tooltip.getActiveElements().length>0);
 const inspection=await page.evaluate(()=>({price:chart.options.plugins.tooltip.callbacks.afterBody([{dataIndex:200}]),rsi:rsiChart.options.plugins.tooltip.callbacks.afterBody([{dataIndex:200}])}));
 assert.match(inspection.price[0],/^RSI \(14\): \d/,'Price tooltip includes RSI');
 assert.match(inspection.rsi[0],/^Fiyat: /,'RSI tooltip includes price');
 await page.screenshot({path:path.join(output,'chart-inspection.png')});
 await context.grantPermissions([]);
 for(const width of [320,390,760,1440]){
  await page.setViewportSize({width,height:1000});
  for(const name of ['main','chart','portfolio','other']){await view(name);await noOverflow();}
 }
 await page.setViewportSize({width:1440,height:1000});await view('portfolio');
 const desktopTabs=await page.locator('.portfolio-book-tab').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
 assert.equal(desktopTabs[0],desktopTabs[3],'Desktop portfolio shortcuts should flow beyond three per row');
 const portfolioCardFill=await page.locator('.portfolio-row').first().evaluate(card=>card.getBoundingClientRect().width/card.parentElement.getBoundingClientRect().width);
 assert(portfolioCardFill>.9,'The last desktop holding should fill its row');
 await page.screenshot({path:path.join(output,'desktop-portfolio.png'),fullPage:true});
 await page.screenshot({path:path.join(output,'desktop-settings.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.settings-card').first().evaluate(n=>getComputedStyle(n).animationName),'none');
 assert.deepEqual(errors,[]);
 console.log('PASS: 4 screens, light/dark, 320–1440px, controls/persistence, three reorder lists/cancel, touch tap, reduced motion. Screenshots: '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
