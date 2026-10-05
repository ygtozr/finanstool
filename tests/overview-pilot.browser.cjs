// Isolated synthetic fixtures: no user data, live accounts or supplier requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.PARITY_OUTPUT||'/tmp/ozer-overview-pilot';
const stamp=1789986600,prices=Array.from({length:270},(_,i)=>100+i*.17+Math.sin(i/8)*5),times=prices.map((_,i)=>stamp-(269-i)*86400);
const history=symbol=>({chart:{result:[{meta:{symbol,currency:'USD',longName:symbol+' örnek şirket',regularMarketTime:stamp,regularMarketPrice:prices.at(-1)},timestamp:times,indicators:{quote:[{close:prices,low:prices.map(p=>p-1),high:prices.map(p=>p+1)}],adjclose:[{adjclose:prices}]}}],error:null}});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 let unavailable=false,detailMode='',fundamentalFixture=null;const heldSearch=[],heldDetails=[];
 // Normalize only the release badge; the reference layout and finance remain v8.0.
 const referenceHtml=require('node:child_process').execFileSync('git',['show','v8.0:index.html'],{cwd:root}).toString().replaceAll('version-badge">v8.0','version-badge">v'+require('../package.json').version);
 const referenceContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const reference=await referenceContext.newPage();
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::')){errors.push(m.text());console.error('CONSOLE',m.text())}});
 const seed=()=>{
  if(localStorage.getItem('parity-seeded'))return;
  localStorage.setItem('parity-seeded','1');
  localStorage.setItem('finans-grafigi-theme','dark');
  localStorage.setItem('finans-grafigi-appearance',JSON.stringify({color:'turkuaz',look:'seramik'}));
  localStorage.setItem('finans-grafigi-refresh-interval','0');
  localStorage.setItem('finans-grafigi-favorites',JSON.stringify([{symbol:'AAPL',name:'Apple Inc.'},{symbol:'MSFT',name:'Microsoft Corporation'},{symbol:'BJKAS.IS',name:'Beşiktaş Futbol Yatırımları'}]));
  localStorage.setItem('finans-grafigi-portfolios-v2',JSON.stringify(Array.from({length:6},(_,i)=>({id:'visual-'+i,name:['Uzun Vadeli','Temettü','Amerika','Birikim','Fonlar','Altın'][i],positions:i?[]:[{symbol:'AAPL',name:'Apple Inc.',quantity:10,baseQuantity:10,unitCost:110,costCurrency:'USD',dripEnabled:false}],cashBalances:[],createdAt:'2026-01-01T00:00:00Z'}))));
  localStorage.setItem('finans-grafigi-active-portfolio','visual-0');
 };
 await context.addInitScript(seed);
 await referenceContext.addInitScript(seed);
 const routeHandler=route=>{
  const u=new URL(route.request().url());
  if(u.hostname!=='parity.test')return route.abort();
  if(u.pathname.startsWith('/api/')){
   if(['/api/search','/api/tefas'].includes(u.pathname)&&u.searchParams.get('q')==='SERVFAIL')return route.abort();
   if(u.pathname==='/api/search'&&u.searchParams.get('q')==='SLOWOLD')return new Promise(resolve=>heldSearch.push(async()=>{await route.fulfill({contentType:'application/json',body:JSON.stringify({quotes:[{symbol:'OLD',name:'Eski sorgu'}]})});resolve();}));
   const symbol=u.searchParams.get('symbol')||'AAPL';let data;requests.push(u.pathname+u.search);
   if(u.pathname==='/api/price'&&symbol==='MSFT'&&u.searchParams.get('query')==='range=1y&interval=1d'){
    if(detailMode==='hold')return new Promise(resolve=>heldDetails.push(async()=>{await route.fulfill({contentType:'application/json',body:JSON.stringify(history(symbol))});resolve();}));
    if(detailMode==='fail')return route.fulfill({contentType:'application/json',body:JSON.stringify({chart:{result:[]}})});
   }
   if(u.pathname==='/api/account')data={authenticated:false,user:null,configured:false};
   else if(u.pathname==='/api/prices'&&unavailable)data={results:{}};
   else if(u.pathname==='/api/prices')data={results:Object.fromEntries((u.searchParams.get('symbols')||'AAPL').split(',').map(s=>[s,{ok:true,data:u.searchParams.get('mode')==='compact'?{symbol:s,name:s==='AAPL'?'Apple Inc.':s==='MSFT'?'Microsoft Corporation':s,currency:s.endsWith('.IS')?'TRY':'USD',price:145.5,previousClose:143,delta:2.5,change:1.748,marketTimestamp:stamp,asOf:stamp,provider:'Test verisi'}:history(s)}]))};
   else if(u.pathname==='/api/quote')data={symbol,currency:'TRY',price:2.11,previousClose:2.08,delta:.03,change:1.44,asOf:stamp,priceType:'delayed_quote',delayed:true};
   else if(u.pathname.includes('dividend'))data={results:{},events:[],prices:[],status:'no_data'};
   else if(u.pathname==='/api/search')data={quotes:u.searchParams.get('q')==='NOMATCH'?[]:u.searchParams.get('q')==='FASTNEW'?[{symbol:'MSFT',name:'Microsoft'},{symbol:'AAPL',name:'Apple'}]:[{symbol:'NVDA',name:'NVIDIA',shortname:'NVIDIA'}]};
   else if(u.pathname==='/api/fundamentals')data=symbol==='MSFT'&&fundamentalFixture?fundamentalFixture:{status:'no_data'};
   else if(u.pathname==='/api/logo')return route.abort();
   else data=history(symbol);
   return route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }
  const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.abort();
  return route.fulfill({contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream',body:route.request().frame().page()===reference&&u.pathname==='/'?referenceHtml:fs.readFileSync(file)});
 };
 await context.route('**/*',routeHandler);
 await referenceContext.route('**/*',routeHandler);

 await page.goto('https://parity.test');
 await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong')&&document.querySelector('.pilot-quote strong'));
 await reference.goto('https://parity.test');
 await reference.locator('#authLocalContinue').click();
 await reference.locator('#marketRefresh').click();
 await reference.waitForFunction(()=>document.querySelector('#marketCards strong')?.textContent!=='Yükleniyor…');
 assert.equal(await page.locator('#marketCards > *, #favoritesList > *').count(),0,'React owns the lists; hidden legacy cards are not rendered');
 const originals=await page.evaluate(()=>({portfolios:localStorage.getItem('finans-grafigi-portfolios-v2'),appearance:localStorage.getItem('finans-grafigi-appearance'),backup:Object.keys(createBackup().data).sort()}));
 for(const width of [375,390,430,1024]){
  await page.setViewportSize({width,height:844});
  await reference.setViewportSize({width,height:844});
  for(const mode of ['light','dark']){
   await page.evaluate(mode=>OzerOverviewLegacy.theme(mode),mode);
   assert.equal(await page.locator('html').getAttribute('data-theme'),mode);
   await reference.evaluate(mode=>applyTheme(mode),mode);
   await page.waitForTimeout(350);
   await reference.evaluate(()=>scrollTo(0,0));
   await page.evaluate(()=>scrollTo(0,0));
   const measure=scope=>{
    const selectors=['.page-brand','.brand-lockup-mark','.brand-lockup-name','.market-summary','.market-summary-head','.market-cards','.market-card','.market-card-label','.market-card-value','.market-card-change','.favorites-panel','.favorites-panel-head','.favorites-list','.favorite-row','.favorite-card','.favorite-card-badge','.favorite-card-head','.favorite-card-quote','.favorite-menu-trigger','.favorite-remove','.favorite-add-search'];
    return selectors.map(selector=>{
     const node=document.querySelector(scope+' '+selector),r=node.getBoundingClientRect(),c=getComputedStyle(node);
     return [selector,...['x','y','width','height'].map(k=>Math.round(r[k]*100)/100),...['fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderRadius','padding','gap'].map(k=>c[k])];
    });
   };
   assert.deepEqual(await page.evaluate(measure,'#overview-react'),await reference.evaluate(measure,'#mainView'),'v8.0 geometry and styling at '+width+'/'+mode);
   const cardsMeasure=scope=>[...document.querySelectorAll(scope+' .favorite-card, '+scope+' .favorite-card *')].map(n=>{const r=n.getBoundingClientRect(),c=getComputedStyle(n);return [n.tagName,n.textContent.trim(),...['x','y','width','height'].map(k=>Math.round(r[k]*100)/100),...['fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderRadius','padding','gap'].map(k=>c[k])];});
   assert.deepEqual(await page.evaluate(cardsMeasure,'#overview-react'),await reference.evaluate(cardsMeasure,'#mainView'),'All stock-card contents match v8.0 at '+width+'/'+mode);
   await page.locator('.pilot-favorite-main').first().click();
   await reference.locator('#favoritesList .favorite-card').first().click();
   await page.locator('#favoriteDetailDialog .favorite-detail-hero').waitFor();
   await reference.locator('#favoriteDetailDialog .favorite-detail-hero').waitFor();
   await page.waitForTimeout(350);
   const detailMeasure=()=>[...document.querySelectorAll('#favoriteDetailDialog, #favoriteDetailDialog .favorite-detail-hero, #favoriteDetailDialog .favorite-detail-identity, #favoriteDetailDialog .favorite-detail-price, #favoriteDetailDialog .favorite-detail-metric')].map(n=>{const r=n.getBoundingClientRect(),c=getComputedStyle(n);return [n.className,n.textContent.replace(/\s/g,''),...['x','y','width','height'].map(k=>Math.round(r[k]*100)/100),...['fontSize','lineHeight','color','backgroundColor','borderRadius','padding','gap'].map(k=>c[k])];});
   assert.deepEqual(await page.evaluate(detailMeasure),await reference.evaluate(detailMeasure),'Stock detail card matches v8.0 at '+width+'/'+mode);
   await page.screenshot({path:path.join(output,`${width}-${mode}-stock-detail.png`)});
   await reference.screenshot({path:path.join(output,`${width}-${mode}-stock-detail-v8.0.png`)});
   await page.locator('.favorite-detail-close').click();
   await reference.locator('.favorite-detail-close').click();
   await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
   await reference.waitForFunction(()=>!document.body.classList.contains('modal-open'));
   if(width<601){
    const navMeasure=()=>{const n=document.querySelector('.pilot-tabbar')||document.querySelector('.mobile-bottom-nav'),r=n.getBoundingClientRect(),c=getComputedStyle(n);return [r.x,r.y,r.width,r.height,c.backgroundColor,c.borderRadius,c.padding,...[...n.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return [r.x,r.y,r.width,r.height,...['fontSize','backgroundColor','border','color','padding','gap'].map(k=>getComputedStyle(b)[k])];})];};
    assert.deepEqual(await page.evaluate(navMeasure),await reference.evaluate(navMeasure),'v8.0 mobile navigation at '+width+'/'+mode);
   }
   await reference.screenshot({path:path.join(output,`${width}-${mode}-v8.0.png`),fullPage:true});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No overflow at '+width);
   assert.equal(await page.locator('.pilot-market-card').count(),8);
   assert.equal(await page.locator('.pilot-favorite-row').count(),3);
   if(width<601){
    const nav=await page.locator('.pilot-tabbar').boundingBox();
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    const moved=await page.locator('.pilot-tabbar').boundingBox();
    assert(Math.abs(nav.y-moved.y)<1,'Tab bar stays fixed');
    assert(Math.abs(moved.y+moved.height-844)<1,'Tab bar reaches viewport bottom');
   }
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(output,`${width}-${mode}.png`),fullPage:true});
   if(width<601){
    const links=await page.locator('.pilot-tabbar button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
    assert(links.every(size=>size>width/5),'Each mobile tab has an evenly spaced touch target');
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 // React owns the detail content; the native top-layer shell preserves focus/lock.
 assert.equal(await page.locator('#favoriteDetailDialog').getAttribute('data-react-detail'),'ready');
 const clearDetailCache=()=>page.evaluate(()=>apiCache.delete(priceApiUrl('MSFT','range=1y&interval=1d')));
 await clearDetailCache();detailMode='hold';
 const pendingDetail=page.waitForRequest(r=>r.url().includes('/api/price?symbol=MSFT')&&r.url().includes('range%3D1y'));
 await page.locator('.pilot-favorite-row[data-symbol="MSFT"] .favorite-card').click();
 await pendingDetail;
 await page.locator('#favoriteDetailBody [role="status"]').filter({hasText:'Veriler yükleniyor…'}).waitFor();
 assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('modal-open')),true);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'favoriteDetailClose');
 await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'favoriteDetailPortfolio','Native dialog wraps focus');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'favoriteDetailClose');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('#favoriteDetailDialog').open&&!document.body.classList.contains('modal-open'));
 assert.equal(await page.evaluate(()=>document.activeElement.closest('.pilot-favorite-row')?.dataset.symbol),'MSFT');
 await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card').click();
 await page.locator('#favoriteDetailIdentity h3').filter({hasText:'AAPL'}).waitFor();
 await Promise.all(heldDetails.splice(0).map(release=>release()));detailMode='';
 await page.waitForTimeout(50);
 assert.equal(await page.locator('#favoriteDetailIdentity h3').textContent(),'AAPL','Late closed detail cannot replace the new symbol');
 await page.locator('#favoriteDetailClose').click();
 await clearDetailCache();detailMode='fail';
 await page.locator('.pilot-favorite-row[data-symbol="MSFT"] .favorite-card').click();
 await page.locator('#favoriteDetailBody [role="alert"]').filter({hasText:'Detay verileri alınamadı'}).waitFor();
 await page.locator('#favoriteDetailClose').click();
 await clearDetailCache();detailMode='';
 for(const [action,target] of [['Chart','chartView'],['Alarm','alarmDialog'],['Portfolio','portfolioDialog']]){
  await page.locator('.pilot-favorite-row[data-symbol="MSFT"] .favorite-card').click();
  await page.locator('#favoriteDetailIdentity h3').filter({hasText:'MSFT'}).waitFor();
  await page.locator('#favoriteDetail'+action).click();
  await page.waitForFunction(id=>{const n=document.getElementById(id);return id==='chartView'?!n.hidden:n.open},target);
  assert.equal(await page.locator('#favoriteDetailDialog').evaluate(n=>n.open),false);
  if(target==='chartView')await page.locator('.pilot-tabbar').getByRole('button',{name:'Özet',exact:true}).click();
  else {assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('modal-open')),true,'Handoff keeps the native modal lock');await page.keyboard.press('Escape');}
 }
 // Preserve formatted fundamental values and honest provider/applicability states.
 for(const [fixture,expected] of [
  [{status:'ok',pe:25.25,dividendYieldPercent:1.4,marketCap:1200000000,source:'Test temel veri'},['1,2 Mr USD','25,25','1,4%']],
  [{status:'provider_error'},['Kaynak erişilemiyor','Kaynak erişilemiyor','Kaynak erişilemiyor']],
  [{status:'unsupported'},['Desteklenmiyor','Desteklenmiyor','Desteklenmiyor']],
  [{status:'no_data',peApplicable:false,marketCapApplicable:false,dividendApplicable:false},['Uygulanamaz','Uygulanamaz','Uygulanamaz']]
 ]){
  fundamentalFixture=fixture;
  await page.evaluate(()=>apiCache.delete('/api/fundamentals?symbol=MSFT'));
  await page.locator('.pilot-favorite-row[data-symbol="MSFT"] .favorite-card').click();
  await page.locator('#favoriteDetailIdentity h3').filter({hasText:'MSFT'}).waitFor();
  assert.deepEqual((await page.locator('#favoriteDetailBody dd').allTextContents()).slice(1,4).map(value=>value.replace(/\u00a0/g,' ')),expected);
  if(fixture.source)assert.equal(await page.locator('.favorite-detail-source').textContent(),'Temel veri: Test temel veri');
  await page.locator('#favoriteDetailClose').click();
 }
 fundamentalFixture=null;
 const compact=()=>requests.filter(url=>url.startsWith('/api/prices?')&&url.includes('mode=compact')).length;
 // Advance only the test clock beyond the existing 15s cache; keep policy intact.
 await page.clock.setSystemTime(new Date(Date.now()+60000));
 const before=compact();
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>!document.getElementById('marketRefresh').disabled);
 assert.equal(compact()-before,1,'Manual refresh uses exactly one shared compact batch');
 const last= requests.filter(url=>url.startsWith('/api/prices?')&&url.includes('mode=compact')).at(-1);
 const symbols=new URL('https://parity.test'+last).searchParams.get('symbols').split(',');
 assert.equal(symbols.length,new Set(symbols).size,'Batch symbols stay deduplicated');
 // Long stock detail content must scroll independently at short viewport heights.
 const touchDevice=await context.newCDPSession(page);
 for(const width of [375,390,430,1024])for(const height of [640,500]){
  await page.setViewportSize({width,height});
  await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card').click();
  await page.locator('#favoriteDetailDialog .favorite-detail-hero').waitFor();await page.waitForTimeout(250);
  const body=page.locator('#favoriteDetailBody'),footer=page.locator('.favorite-detail-actions'),head=page.locator('.favorite-detail-head');
  const geometry=await body.evaluate(n=>({scroll:n.scrollHeight,client:n.clientHeight}));
  assert(geometry.scroll>geometry.client,'Detail content has a scroll area at '+width+'/'+height);
  const beforeFooter=await footer.boundingBox(),beforeHead=await head.boundingBox();
  assert(beforeFooter.y+beforeFooter.height<=height+.5,'Actions remain inside short viewport');
  await body.hover();await page.mouse.wheel(0,600);await page.waitForFunction(()=>document.getElementById('favoriteDetailBody').scrollTop>0);
  assert(Math.abs((await footer.boundingBox()).y-beforeFooter.y)<=.5,'Footer stays fixed while content scrolls');
  assert(Math.abs((await head.boundingBox()).y-beforeHead.y)<=.5,'Header stays fixed while content scrolls');
  await body.evaluate(n=>{n.scrollTop=0});
  const bounds=await body.boundingBox(),x=Math.round(bounds.x+bounds.width/2),y=Math.round(bounds.y+bounds.height*.75);
  await touchDevice.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
  for(let step=1;step<=6;step++){await touchDevice.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*18,id:1}]});await page.waitForTimeout(16);}
  await touchDevice.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>document.getElementById('favoriteDetailBody').scrollTop>0);
  assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('modal-open')),true,'Background remains locked during touch scroll');
  await page.screenshot({path:path.join(output,`${width}-${height}-detail-scroll.png`)});
  // Let native touch momentum settle, then keep touch input (no ghost mouse clicks).
  await page.waitForTimeout(400);
  await page.locator('#favoriteDetailClose').tap();
  await page.waitForFunction(()=>!document.getElementById('favoriteDetailDialog').open);
  await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card').click();
  await page.locator('#favoriteDetailDialog .favorite-detail-hero').waitFor();
  assert.equal(await body.evaluate(n=>n.scrollTop),0,'Reopened detail starts at the top');
  await page.locator('#favoriteDetailClose').click();
 }
 await page.setViewportSize({width:390,height:844});
 // React/F7 chart shell must preserve real Chart.js canvases and legacy controls.
 assert.equal(await page.locator('#chartView').getAttribute('data-react-chart'),'ready');
 await page.locator('.pilot-tabbar').getByRole('button',{name:'Grafik',exact:true}).click();
 await page.locator('#pilotChartSubmit').click();
 await page.waitForFunction(()=>window.Chart?.getChart(document.getElementById('priceChart'))&&!document.getElementById('submitButton').disabled);
 await page.evaluate(()=>{window.pilotPriceCanvas=document.getElementById('priceChart');window.pilotRsiCanvas=document.getElementById('rsiChart')});
 assert.equal(await page.locator('#chart-react #pilotChartSearchForm').count(),1,'React owns chart search');
 assert.equal(await page.locator('#chart-react #symbolForm, #chart-react #chartFavoritesPanel, #chart-react #periodLast').count(),0,'Migrated chart controls do not move old widgets');
 assert.equal(await page.locator('#chartFavoritesList > *, #chartPortfolioList > *').count(),0,'Hidden legacy chart asset lists stay empty');
 assert.equal(await page.locator('#priceChart').count(),1,'Single price canvas');
 assert.equal(await page.locator('#rsiChart').count(),1,'Single RSI canvas');
 assert(await page.evaluate(()=>Chart.getChart(document.getElementById('rsiChart')).data.datasets[0].data.some(Number.isFinite)),'Existing RSI has calculated values');
 const priceCalls=(symbol,range)=>requests.filter(url=>{const u=new URL('https://parity.test'+url);return u.pathname==='/api/price'&&u.searchParams.get('symbol')===symbol&&u.searchParams.get('query')===`range=${range}&interval=1d`}).length;
 await reference.setViewportSize({width:390,height:844});
 await reference.evaluate(()=>setActiveView('chart'));
 await reference.locator('#symbol').fill(await page.locator('#pilotChartSearch').inputValue());await reference.locator('#symbolForm').evaluate(form=>form.requestSubmit());
 await reference.waitForFunction(()=>!document.getElementById('submitButton').disabled&&document.getElementById('periodLast').textContent!=='—');
 const summaryMeasure=selector=>{
  const root=document.querySelector(selector);
  return [...root.querySelectorAll('h3,dt,dd,small,.period-summary-range-fill,.period-summary-range-labels')].map(n=>{const c=getComputedStyle(n);return [n.tagName,n.className,n.textContent.replace(/\s/g,''),c.fontSize,c.fontWeight,c.color,c.backgroundColor,c.borderRadius,c.padding,c.gap,n.classList.contains('period-summary-range-fill')?n.style.width:''];});
 };
 assert.deepEqual(await page.evaluate(summaryMeasure,'#pilotPeriodSummary'),await reference.evaluate(summaryMeasure,'.period-summary'),'Service-owned React summary matches v8.0');
 const initialChartSymbol=await page.locator('#pilotChartSearch').inputValue(),startCalls=priceCalls(initialChartSymbol,'1mo');
 await page.locator('#chart-react [data-range="1mo"]').click();
 await page.waitForFunction(()=>!document.getElementById('submitButton').disabled&&selectedRange==='1mo');
 assert.equal(priceCalls(initialChartSymbol,'1mo')-startCalls,1,'One legacy price request per period selection');
 assert.equal(await page.locator('#chart-react [data-range="1mo"]').getAttribute('aria-pressed'),'true');
 await page.locator('#pilotCustomPeriod').click();await page.locator('#startDate').fill('15.01.2025');await page.locator('#startDate').press('Enter');
 await page.waitForFunction(()=>selectedStart==='2025-01-15'&&!document.getElementById('submitButton').disabled);
 assert.equal(await page.locator('#pilotCustomPeriod').getAttribute('aria-pressed'),'true');
 assert.match(await page.locator('#pilotCustomPeriod').textContent(),/15.01.2025 tarihinden itibaren/);
 await page.locator('#chart-react [data-range="6mo"]').click();
 await page.waitForFunction(()=>!document.getElementById('submitButton').disabled&&!selectedStart);
 await page.locator('#pilotChartSearch').fill('NVDA');await page.locator('#pilotChartSearchSuggestions button').filter({hasText:'NVDA'}).click();
 await page.waitForFunction(()=>primarySymbol==='NVDA'&&!document.getElementById('submitButton').disabled);
 assert.equal(await page.locator('#pilotChartSearch').inputValue(),'NVDA','Selection keeps its symbol in the React input');
 assert.match(await page.locator('#meta').textContent(),/NVDA örnek şirket/);
 await page.locator('#pilotChartFavorite').click();await page.waitForFunction(()=>favorites.some(item=>item.symbol==='NVDA'));
 await page.locator('#pilotChartFavorite').click();await page.waitForFunction(()=>!favorites.some(item=>item.symbol==='NVDA'));
 await page.locator('#maToggle').click();await page.waitForFunction(()=>maEnabled&&Chart.getChart(document.getElementById('priceChart')).data.datasets.length>=4);
 await page.locator('#maToggle').click();await page.waitForFunction(()=>!maEnabled);
 await page.locator('#pilot-advancedSearchButton').click();await page.locator('#advancedSearchDialog[open]').waitFor();await page.keyboard.press('Escape');
 await page.locator('#pilot-alarmButton').click();await page.locator('#alarmDialog[open]').waitFor();await page.keyboard.press('Escape');
 // iPhone download fallback: native file picker is unavailable in mobile Safari.
 await page.evaluate(()=>{window.showSaveFilePicker=undefined});
 for(const type of ['Csv','Png']){
  const downloading=page.waitForEvent('download');await page.locator('#pilot-export'+type).click();const download=await downloading;
  assert.match(download.suggestedFilename(),type==='Csv'?/\.csv$/:/\.png$/);
  const bytes=fs.readFileSync(await download.path());
  if(type==='Csv'){assert.match(bytes.toString('utf8'),/Tarih.*NVDA.*RSI \(14\)/);assert(bytes.toString('utf8').split('\n').length>200);}
  else assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  await download.delete();
 }
 await page.evaluate(()=>{window.savedPng=null;window.showSaveFilePicker=options=>new Promise(resolve=>{window.releasePngPicker=()=>resolve({createWritable:async()=>({write:async blob=>{window.savedPng={name:options.suggestedName,size:blob.size,type:blob.type}},close:async()=>{window.savedPng.closed=true}})})})});
 await page.locator('#pilot-exportPng').click();
 await page.waitForFunction(()=>document.getElementById('pilot-exportPng').classList.contains('disabled'));
 assert.equal(await page.locator('#pilot-exportPng').getAttribute('aria-disabled'),'true');
 assert.equal(await page.locator('#pilot-exportPng').textContent(),'PNG hazırlanıyor…');
 await page.evaluate(()=>releasePngPicker());await page.waitForFunction(()=>window.savedPng?.closed);
 assert.equal(await page.evaluate(()=>savedPng.type),'image/png');assert(await page.evaluate(()=>savedPng.size>0));
 await page.locator('#pilotChartFavoritesToggle').click();await page.locator('#pilotChart-favorites').waitFor();
 await page.locator('#pilotChart-favorites button').first().click();
 await page.waitForFunction(()=>!document.getElementById('submitButton').disabled);
 assert.equal(await page.locator('#pilotChart-favorites').isVisible(),false,'Selecting a saved asset closes the panel');
 assert.equal(await page.locator('#pilotChartSearch').inputValue(),await page.evaluate(()=>primarySymbol),'Saved asset selection syncs React search');
 await page.locator('#pilotChartPortfolioToggle').click();await page.locator('#pilotChart-portfolio').waitFor();
 assert.match(await page.locator('#pilotChart-portfolio').textContent(),/AAPL/);
 // Empty/repopulated states are read from the services, even with empty legacy lists.
 await page.evaluate(()=>{window.chartFavoritesBefore=favorites;window.chartPortfolioBefore=portfolio;favorites=[];portfolio=[];renderChartAssetPanels();renderFavorites()});
 await page.locator('#pilotChart-portfolio .chart-asset-empty').filter({hasText:'Portföyünüzde hisse yok.'}).waitFor();
 await page.locator('#pilotChartFavoritesToggle').click();await page.locator('#pilotChart-favorites .chart-asset-empty').filter({hasText:'Henüz favori hisse yok.'}).waitFor();
 await page.evaluate(()=>{favorites=window.chartFavoritesBefore;portfolio=window.chartPortfolioBefore;renderChartAssetPanels();renderFavorites()});
 await page.locator('#pilotChart-favorites .chart-asset-item').first().waitFor();
 await page.locator('#pilotChartFavoritesToggle').click();
 assert.equal(await page.evaluate(()=>document.getElementById('priceChart')===window.pilotPriceCanvas&&document.getElementById('rsiChart')===window.pilotRsiCanvas),true,'React updates retain canvas nodes');
 for(const width of [375,390,430,1024])for(const mode of ['light','dark']){
  await page.setViewportSize({width,height:844});await page.evaluate(mode=>OzerOverviewLegacy.theme(mode),mode);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Chart has no horizontal overflow');
  assert(await page.locator('#priceChart').evaluate(n=>n.width>0&&n.height>0),'Live Chart.js canvas is sized');
  const toolbarBox=await page.locator('.pilot-chart-toolbar').boundingBox(),plotBox=await page.locator('#chart-react .native-plot-card').first().boundingBox();
  assert(plotBox.y>=toolbarBox.y+toolbarBox.height,'Toolbar does not overlap chart metadata');
  const actionBoxes=await page.locator('.pilot-chart-toolbar button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,height:r.height}}));
  assert(actionBoxes.every(b=>b.y+b.height<=toolbarBox.y+toolbarBox.height+.5),'All chart actions fit their toolbar');
  if(width<761)assert((await page.locator('#pilot-alarmButton').boundingBox()).height>=44,'Chart actions have mobile touch targets');
  await page.screenshot({path:path.join(output,`${width}-${mode}-chart.png`),fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('.pilot-tabbar').getByRole('button',{name:'Özet',exact:true}).click();
 const initialMarkets=await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-market-items')));
 const settingsButton=page.getByRole('button',{name:'Piyasa özetini düzenle',exact:true});
 await settingsButton.click();
 await page.locator('.pilot-market-popup.modal-in').waitFor();
 await page.waitForFunction(()=>document.activeElement.id==='pilotMarketSearch');
 assert.equal(await page.locator('#marketSettingsDialog').evaluate(n=>n.open),false,'Settings UI uses Framework7 Popup');
 assert.equal(await page.locator('main').evaluate(n=>n.inert),true);
 for(const width of [375,390,430,1024]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Market popup does not overflow at '+width);
  const popupCard=await page.locator('.pilot-market-popup .portfolio-dialog').boundingBox();
  assert(popupCard.width<=width&&popupCard.height<=844*.9+1,'Popup stays inside viewport');
  await page.screenshot({path:path.join(output,`${width}-market-settings.png`)});
 }
 await page.setViewportSize({width:390,height:844});
 // Framework sheets/popups must not start the background pull-to-refresh gesture.
 const popupList=await page.locator('.pilot-market-popup .market-settings-list').boundingBox(),popupX=Math.round(popupList.x+popupList.width/2),popupY=Math.round(popupList.y+30),popupRequests=compact();
 await touchDevice.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:popupX,y:popupY,id:2}]});
 for(let step=1;step<=5;step++){await touchDevice.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:popupX,y:popupY+step*22,id:2}]});await page.waitForTimeout(16);}
 assert.equal(await page.locator('.pull-refresh-indicator.visible').count(),0,'Popup drag does not intercept background refresh');
 await touchDevice.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(400);await page.locator('#pilotMarketSearch').tap();
 assert.equal(compact(),popupRequests,'Popup drag does not send a background price batch');
 await page.locator('#pilotMarketSearch').fill('NVDA');
 await page.locator('#pilotMarketSearchSuggestions button').filter({hasText:'NVDA'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-market-popup .market-settings-row').length===9);
 const marketHandle=page.locator('.pilot-market-popup .market-settings-row[data-symbol="NVDA"] > span');
 await marketHandle.focus();await page.keyboard.press('Alt+ArrowUp');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('finans-grafigi-market-items'))[7].symbol==='NVDA');
 await page.waitForFunction(()=>document.activeElement?.closest('.market-settings-row')?.dataset.symbol==='NVDA');
 await page.keyboard.press('Alt+ArrowDown');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('finans-grafigi-market-items'))[8].symbol==='NVDA');
 await page.locator('.pilot-market-popup .market-settings-row[data-symbol="NVDA"] button').click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-market-popup .market-settings-row').length===8);
 for(let i=0;i<8;i++)await page.locator('.pilot-market-popup .market-settings-remove').first().click();
 await page.locator('.pilot-market-popup .market-settings-empty').waitFor();
 await page.locator('#overview-react .market-settings-empty').waitFor();
 assert.equal(await page.locator('#marketCards > *').count(),0);
 await page.evaluate(items=>items.forEach(item=>OzerOverviewLegacy.addMarket(item)),initialMarkets);
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-market-popup .market-settings-row').length===8);
 await page.locator('.pilot-market-popup').getByRole('button',{name:'Kapat',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('main').inert);
 assert.equal(await settingsButton.evaluate(n=>n===document.activeElement),true,'Settings returns focus to gear');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-market-items'))),initialMarkets,'Market schema and original order preserved');
 const favoriteInput=page.locator('#pilotFavoriteSearch');
 await favoriteInput.fill('NOMATCH');
 await page.locator('#pilotFavoriteSearchSuggestions .suggestion-empty').filter({hasText:'Eşleşen ürün bulunamadı.'}).waitFor();
 await favoriteInput.fill('SERVFAIL');
 await page.locator('#pilotFavoriteSearchSuggestions .suggestion-empty').filter({hasText:'Arama servisine ulaşılamadı.'}).waitFor();
 const slow=page.waitForRequest(request=>request.url().includes('/api/search?q=SLOWOLD'));
 await favoriteInput.fill('SLOWOLD');await slow;
 await favoriteInput.fill('FASTNEW');
 await page.locator('#pilotFavoriteSearchSuggestions button').filter({hasText:'MSFT'}).waitFor();
 await Promise.all(heldSearch.splice(0).map(release=>release()));
 await page.waitForTimeout(50);
 assert.equal(await page.locator('#pilotFavoriteSearchSuggestions button').filter({hasText:'OLD'}).count(),0,'Late old search does not overwrite new results');
 await page.keyboard.press('ArrowUp');
 assert.equal(await favoriteInput.getAttribute('aria-activedescendant'),'pilotFavoriteSearchSuggestions-1','ArrowUp selects last result');
 await page.keyboard.press('ArrowDown');
 assert.equal(await favoriteInput.getAttribute('aria-activedescendant'),'pilotFavoriteSearchSuggestions-0');
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.getElementById('pilotFavoriteSearch').value==='');
 assert.equal(await page.locator('.pilot-favorite-row').count(),3,'Adding an existing favorite does not duplicate it');
 await page.locator('#pilotFavoriteSearch').fill('NVDA');
 await page.locator('#pilotFavoriteSearchSuggestions button').filter({hasText:'NVDA'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-favorite-row').length===4);
 assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites')))).some(item=>item.symbol==='NVDA'));
 await page.getByRole('button',{name:'NVDA işlemleri',exact:true}).click();
 await page.locator('.pilot-action-sheet.modal-in').waitFor();
 await page.locator('.pilot-action-sheet').getByRole('button',{name:'Favorilerden çıkar'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.pilot-favorite-row').length===3);
 await page.locator('.pilot-action-sheet.modal-in').waitFor({state:'hidden'});
 await page.waitForFunction(()=>!document.querySelector('main').inert);
 assert.equal(await page.locator('main').evaluate(n=>n.inert),false);
 const opener=page.getByRole('button',{name:'AAPL işlemleri',exact:true});
 await opener.click();
 await page.locator('.pilot-action-sheet.modal-in').waitFor();
 await page.waitForFunction(()=>document.querySelector('.pilot-action-sheet').contains(document.activeElement));
 assert.equal(await page.locator('main').evaluate(n=>n.inert),true,'Sheet makes underlying controls inert');
 assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('modal-open')),true,'Sheet shares the existing scroll lock');
 assert.equal(await page.locator('.pilot-action-sheet').getAttribute('role'),'dialog');
 await page.keyboard.press('Shift+Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Favorilerden çıkar','Focus wraps within sheet');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Kapat');
 await page.keyboard.press('Escape');
 await page.locator('.pilot-action-sheet.modal-in').waitFor({state:'hidden'});
 await page.waitForFunction(()=>!document.querySelector('main').inert);
 assert.equal(await page.locator('main').evaluate(n=>n.inert),false);
 assert.equal(await opener.evaluate(n=>n===document.activeElement),true,'Escape returns focus to opener');
 await opener.click();
 await page.locator('.pilot-action-sheet.modal-in').waitFor();
 await page.locator('.pilot-action-sheet').getByRole('button',{name:'Portföye ekle',exact:true}).click();
 await page.locator('#portfolioDialog[open]').waitFor();
 await page.waitForFunction(()=>!document.querySelector('main').inert);
 assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('modal-open')),true,'Legacy dialog keeps scroll locked after sheet closes');
 assert.equal(await page.locator('#portfolioDialog').evaluate(n=>n.contains(document.activeElement)),true,'Sheet does not steal focus from legacy dialog');
 await page.locator('#portfolioCancel').click();
 await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
 assert.equal(await page.locator('#marketCards > *, #favoritesList > *').count(),0,'Refresh/add/remove keep legacy lists empty');
 // Other screens still execute their original code through the shared navigation.
 for(const [label,view] of [['Grafik','chartView'],['Portföy','portfolioView'],['Diğer','otherView'],['Özet','mainView']]){
  await page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  await page.waitForFunction(id=>!document.getElementById(id).hidden,view);
  assert.equal(await page.locator('.pilot-tabbar [aria-current="page"]').getAttribute('aria-label'),label);
 }
 await page.locator('.pilot-market-card').first().click();
 await page.waitForFunction(()=>!document.getElementById('chartView').hidden);
 await page.locator('.pilot-tabbar').getByRole('button',{name:'Özet',exact:true}).click();
 await page.locator('.pilot-favorite-main').first().click();
 await page.locator('#favoriteDetailDialog[open]').waitFor();
 await page.locator('.favorite-detail-close').click();
 const keyboardCard=page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card');
 await keyboardCard.focus();await page.keyboard.press('Alt+ArrowDown');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites'))[1].symbol==='AAPL');
 await page.waitForFunction(()=>document.activeElement?.closest('.pilot-favorite-row')?.dataset.symbol==='AAPL');
 await page.keyboard.press('Alt+ArrowUp');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites'))[0].symbol==='AAPL');
 // Reuse stable-slot hold/reorder and persist through the existing storage format.
 const first=page.locator('.pilot-favorite-main').first(),third=page.locator('.pilot-favorite-main').nth(2);
 await first.scrollIntoViewIfNeeded();const a=await first.boundingBox(),b=await third.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.waitForTimeout(440);
 assert.equal(await page.locator('.pilot-favorite-row.native-dragging').count(),1);
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('finans-grafigi-favorites'))))[2].symbol,'AAPL');
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 assert.equal(await page.locator('.pilot-favorite-row').nth(2).getAttribute('data-symbol'),'AAPL','Favorite order survives reload');
 const current=await page.evaluate(()=>({portfolios:localStorage.getItem('finans-grafigi-portfolios-v2'),appearance:localStorage.getItem('finans-grafigi-appearance'),backup:Object.keys(createBackup().data).sort()}));
 assert.deepEqual(current,originals,'Portfolio, appearance and backup format unchanged');
 // First logo provider fails; the existing second provider must recover.
 await page.route('https://eodhd.com/img/logos/US/AAPL.png',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42"><rect width="42" height="42" fill="#00D5D8"/></svg>'}));
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForFunction(()=>{const image=document.querySelector('.pilot-favorite-row[data-symbol="AAPL"] img');return image?.src.includes('eodhd.com')&&image.naturalWidth>0;});
 await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card').click();
 await page.waitForFunction(()=>{const image=document.querySelector('#favoriteDetailIdentity img');return image?.src.includes('eodhd.com')&&image.naturalWidth>0;});
 await page.locator('#favoriteDetailClose').click();
 assert.equal(await page.locator('#marketCards > *, #favoritesList > *').count(),0);
 // Presentation must keep official timestamps and missing-close values honest.
 await page.evaluate(stamp=>{
  const quote={price:12.5,currency:'USD',delta:null,change:null,priceType:'official_daily',marketTimestamp:stamp,provider:'Resmî test verisi'};
  favoriteQuotes.set('AAPL',quote);updateFavoriteQuoteCard('AAPL');
  overviewMarketQuotes.set('TRY=X',{ok:true,...quote});notifyOverview();
 },stamp);
 await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-change').filter({hasText:'Önceki kapanış yok'}).waitFor();
 assert.equal(await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-change').evaluate(n=>n.classList.contains('positive')||n.classList.contains('negative')),false,'Missing previous close has no invented positive/negative signal');
 assert.match(await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-market-time').textContent(),/^Son resmî · /);
 assert.equal(await page.locator('.pilot-market-card').first().locator('.market-card-change').textContent(),'Önceki kapanış yok');
 assert.equal(await page.locator('#marketCards > *, #favoritesList > *').count(),0);
 // Emulate standalone and real CSS env() insets through Chromium's device API.
 await page.addInitScript(()=>{
  const original=window.matchMedia.bind(window);
  window.matchMedia=query=>{
   const result=original(query);
   if(query==='(display-mode: standalone)')Object.defineProperty(result,'matches',{value:true});
   return result;
  };
  Object.defineProperty(navigator,'standalone',{value:true,configurable:true});
 });
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForSelector('html[data-overview-pilot="ready"]');
 const device=await context.newCDPSession(page);
 await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:47,bottom:34,left:0,right:0}});
 assert.equal(await page.locator('.pilot-tabbar').evaluate(n=>getComputedStyle(n).paddingBottom),'40px','Actual bottom env inset');
 assert.equal(Math.round((await page.locator('.pilot-tabbar').boundingBox()).height),95);
 assert.equal(await page.locator('main').evaluate(n=>getComputedStyle(n).paddingTop),'47px','Top safe-area reserved once');
 assert.equal(await page.locator('#overview-react .pilot-brand').evaluate(n=>getComputedStyle(n).top),'47px','Actual sticky top env inset');
 assert.equal(await page.evaluate(()=>matchMedia('(display-mode: standalone)').matches&&navigator.standalone),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Standalone safe-area does not change viewport width');
 await page.screenshot({path:path.join(output,'standalone-safe-area.png')});
 await page.locator('.pilot-favorite-row[data-symbol="AAPL"] .favorite-card').click();
 await page.locator('#favoriteDetailDialog .favorite-detail-hero').waitFor();await page.waitForTimeout(350);
 const safeDetail=await page.locator('#favoriteDetailDialog').boundingBox();
 assert(safeDetail.x>=0&&safeDetail.y>=0&&safeDetail.y+safeDetail.height<=844.5,'Standalone detail stays in viewport');
 await page.screenshot({path:path.join(output,'standalone-safe-area-detail.png')});
 await page.locator('#favoriteDetailClose').click();
 await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:0,bottom:0,left:0,right:0}});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('meta[name="viewport"]').getAttribute('content'),'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

 // Automatic refresh also stays in the legacy scheduler, without a React timer.
 await page.addInitScript(()=>localStorage.setItem('finans-grafigi-refresh-interval','5000'));
 const startup=compact();
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong')&&document.querySelector('.pilot-quote strong'));
 assert.equal(compact()-startup,1,'Exactly one compact batch on automatic startup');
 await page.waitForResponse(response=>response.url().includes('/api/prices?mode=compact'),{timeout:12000});
 assert.equal(compact()-startup,2,'Exactly one next scheduler batch');
 unavailable=true;
 await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
 await page.locator('.pilot-market-card strong').filter({hasText:'Veri alınamadı'}).first().waitFor();
 unavailable=false;
 await page.getByRole('button',{name:'Piyasa verilerini yenile',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.pilot-market-card strong'));
 assert.equal(await page.locator('.pilot-market-card strong').filter({hasText:'Veri alınamadı'}).count(),0,'Existing data service recovers after error');
 await require('./remaining-pages.browser.cjs')({browser,seed,routeHandler,reference,output});
 await require('./audit-fixes.browser.cjs')({browser,seed,routeHandler,output});
 await require('./control-consistency.browser.cjs')({browser,seed,routeHandler,output});
 assert.deepEqual(errors,[],'No console or runtime errors');
 await require('./mobile-navigation.browser.cjs')({browser,seed,routeHandler});
 await require('./layer-audit.browser.cjs')({browser,seed,routeHandler});
 console.log('PASS: Portfolio/Other Framework7 shells and controls, book/position/cash transactions/undo/reload, settings/switches/backup/auth handoffs/short forms, React chart search/asset picker/summary, v8.0 summary parity and empty states, wheel/touch short-screen detail scroll, React chart shell/real canvases/period/custom-date/search/MA/actions/exports, React detail loading/error/stale-response/focus/native handoffs, React search/market popup add/remove/reorder/empty-list, all stock cards/detail parity, keyboard focus, DOM-independent quote projection, empty legacy lists, logo fallback, accessible sheet/focus, v8.0 visual geometry/style and mobile navigation parity, Overview 375/390/430/1024, batch/manual refresh, favorites add/remove/detail/reorder/reload, themes, legacy navigation, standalone/actual safe-area insets, automatic batch/error recovery, unchanged portfolio/backup, no console errors. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
