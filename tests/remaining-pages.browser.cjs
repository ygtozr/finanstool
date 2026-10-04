const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

// Separate synthetic storage: transactions below never touch the overview fixture.
module.exports=async function verifyRemainingPages({browser,seed,routeHandler,reference,output}){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await context.addInitScript(seed);await context.route('**/*',routeHandler);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('net::'))errors.push(message.text());});
  page.on('dialog',dialog=>dialog.accept());
  await page.goto('https://parity.test');await page.locator('#authLocalContinue').click();
  await page.waitForSelector('#portfolioView[data-react-page="ready"]',{state:'attached'});
  await page.waitForSelector('#otherView[data-react-page="ready"]',{state:'attached'});
  const nav=async label=>{
   if((await page.viewportSize()).width>=1024)return page.locator(label==='Portföy'?'#desktopPortfolioNav':'#desktopMoreNav').click();
   return page.locator('.pilot-tabbar').getByRole('button',{name:label,exact:true}).click();
  };
  await nav('Portföy');await page.evaluate(()=>renderPortfolio());
  await page.locator('#portfolioList .portfolio-row[data-symbol="AAPL"]').waitFor();
  await reference.evaluate(async()=>{setActiveView('portfolio');await renderPortfolio()});
  const amounts=()=>['portfolioTotalValue','portfolioDailyChange','allPortfolioTotalValue'].map(id=>document.getElementById(id).textContent);
  assert.deepEqual(await page.evaluate(amounts),await reference.evaluate(amounts),'Same financial output as v8.0');
  await page.evaluate(()=>{window.retainedNodes=['portfolioList','portfolioAllocationChart','portfolioCurrencyChart','portfolioBenchmarkChart','backupFile','accountAction'].map(id=>document.getElementById(id))});
  for(const width of [375,390,430,1024])for(const mode of ['light','dark']){
   await page.setViewportSize({width,height:844});await page.evaluate(mode=>OzerOverviewLegacy.theme(mode),mode);
   for(const [label,kind] of [['Portföy','portfolio'],['Diğer','other']]){
    await nav(label);await page.waitForTimeout(120);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,kind+' horizontal overflow');
    assert.equal(await page.locator(`#${kind}-react .page-brand`).count(),1,'Single visible React brand');
    assert.equal(await page.locator(`#${kind}View > .page-brand`).isVisible(),false);
    if(width<761){
     const controls=kind==='portfolio'?'#pilot-portfolioTodayMode,#pilot-portfolioPrivacyToggle,#portfolioBookAdd,#portfolioBookTabs button':'#pilot-theme-light,#nativeFontUp,.pilot-notification .toggle';
     assert(await page.locator(controls).evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)),'Mobile controls have 44px touch targets');
    }
    await page.screenshot({path:path.join(output,`${width}-${mode}-${kind}.png`),fullPage:true});
   }
  }
  await page.setViewportSize({width:390,height:844});
  const layoutDevice=await context.newCDPSession(page);
  await layoutDevice.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:47,bottom:34,left:0,right:0}});
  for(const [label,kind] of [['Portföy','portfolio'],['Diğer','other']]){
   await nav(label);
   assert.equal(await page.locator(`#${kind}-react .pilot-brand`).evaluate(n=>getComputedStyle(n).top),'47px','Page header uses top safe area');
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   const tabbar=await page.locator('.pilot-tabbar').boundingBox();
   assert.equal(Math.round(tabbar.y+tabbar.height),844,'Tabbar stays fixed while scrolling');
   assert.equal(await page.locator('.pilot-tabbar').evaluate(n=>getComputedStyle(n).paddingBottom),'40px','Tabbar reserves bottom safe area');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Safe area preserves page width');
  }
  await layoutDevice.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:0,bottom:0,left:0,right:0}});
  await nav('Portföy');
  await page.locator('#pilot-portfolioTotalMode').click();
  await page.waitForFunction(()=>portfolioMetricsMode==='total'&&document.getElementById('pilot-portfolioTotalMode').getAttribute('aria-pressed')==='true');
  await page.locator('#pilot-portfolioTodayMode').click();
  await page.waitForFunction(()=>portfolioMetricsMode==='today');
  await page.locator('#pilot-portfolioPrivacyToggle').click();
  await page.waitForFunction(()=>document.getElementById('portfolioView').classList.contains('is-private'));
  assert.equal(await page.locator('#pilot-portfolioPrivacyToggle').getAttribute('aria-label'),'Portföy rakamlarını göster');
  await page.locator('#pilot-portfolioPrivacyToggle').click();
  await page.waitForFunction(()=>!portfolioPrivacyEnabled);
  // Book sorting, create/rename/delete and undo retain their native service.
  const tab=page.locator('#portfolioBookTabs [data-book-id="visual-0"]');await tab.focus();await page.keyboard.press('Alt+ArrowRight');
  await page.waitForFunction(()=>portfolioBooks[1].id==='visual-0');await page.keyboard.press('Alt+ArrowLeft');
  await page.waitForFunction(()=>portfolioBooks[0].id==='visual-0');
  await page.locator('#portfolioBookAdd').click();await page.locator('#portfolioBookName').fill('Pilot test');await page.locator('#portfolioBookSave').click();
  await page.waitForFunction(()=>activePortfolioBook().name==='Pilot test');
  await page.locator('#portfolioEmptyStart').waitFor();
  await page.locator('#portfolioBookRename').click();await page.locator('#portfolioBookName').fill('Pilot renamed');await page.locator('#portfolioBookSave').click();
  await page.waitForFunction(()=>activePortfolioBook().name==='Pilot renamed');
  await page.locator('#emptyAddCash').click();await page.locator('#cashCurrency').selectOption('USD');await page.locator('#cashAmount').fill('123.45');await page.locator('#cashSave').click();
  await page.waitForFunction(()=>cashBalances.some(item=>item.currency==='USD'&&item.amount===123.45));
  await page.locator('#portfolioBookDelete').click();await page.waitForFunction(()=>!portfolioBooks.some(book=>book.name==='Pilot renamed'));
  await page.locator('#undoButton').click();await page.waitForFunction(()=>activePortfolioBook().name==='Pilot renamed');
  assert.equal(await page.evaluate(()=>cashBalances[0].amount),123.45,'Undo restores book cash');
  await page.locator('#portfolioBookSelect').selectOption('visual-0');
  await page.locator('#portfolioList .portfolio-row[data-symbol="AAPL"]').waitFor();
  await page.locator('.native-position-add').click();assert.equal(await page.locator('#portfolioSymbol').evaluate(n=>n===document.activeElement),true);
  await page.locator('#portfolioSymbol').fill('NVDA');await page.locator('#portfolioSuggestions button').filter({hasText:'NVDA'}).click();
  await page.locator('#portfolioQuantity').fill('2');await page.locator('#portfolioCost').fill('100');await page.locator('#portfolioSave').click();
  await page.waitForFunction(()=>portfolio.some(position=>position.symbol==='NVDA'&&position.quantity===2));
  await page.locator('#portfolioList .portfolio-row[data-symbol="NVDA"]').click();await page.locator('#portfolioQuantity').fill('3');await page.locator('#portfolioSave').click();
  await page.waitForFunction(()=>portfolio.find(position=>position.symbol==='NVDA')?.quantity===3);
  await page.locator('#portfolioList .portfolio-row[data-symbol="NVDA"] .portfolio-delete').click();await page.waitForFunction(()=>!portfolio.some(position=>position.symbol==='NVDA'));
  await page.locator('#undoButton').click();await page.waitForFunction(()=>portfolio.find(position=>position.symbol==='NVDA')?.quantity===3);
  // A short, safe-area viewport must expose the entire existing DRIP form.
  await page.setViewportSize({width:390,height:500});const device=await context.newCDPSession(page);
  await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:47,bottom:34,left:0,right:0}});
  await page.locator('#portfolioList .portfolio-row[data-symbol="AAPL"]').click();await page.locator('#portfolioDripEnabled').check();
  const dialog=page.locator('#portfolioDialog'),box=await dialog.boundingBox();
  assert(box.y>=0&&box.y+box.height<=500.5,'Short form stays inside viewport');
  assert.equal(await dialog.evaluate(n=>getComputedStyle(n).paddingBottom),'54px','Form reserves bottom safe area');
  await page.mouse.move(box.x+box.width/2,box.y+80);await page.mouse.wheel(0,900);await page.waitForTimeout(180);
  assert(await dialog.evaluate(n=>n.scrollTop>0),'Long form can wheel scroll');
  await page.locator('#portfolioCancel').click();await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
  await device.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:0,bottom:0,left:0,right:0}});await page.setViewportSize({width:390,height:844});
  await nav('Diğer');
  for(const mode of ['light','dark','system']){
   await page.locator(`#pilot-theme-${mode}`).click();await page.waitForFunction(mode=>localStorage.getItem('finans-grafigi-theme')===mode,mode);
   assert.equal(await page.locator(`#pilot-theme-${mode}`).getAttribute('aria-pressed'),'true');
  }
  for(const id of ['alarmNotificationsToggle','alarmSoundToggle','alarmVibrationToggle','alarmAutoDisableToggle']){
   const input=page.locator('#pilot-'+id),initial=await input.isChecked();
   assert(await input.getAttribute('aria-labelledby'),'Framework7 switch has accessible name');
   await input.focus();await page.keyboard.press('Space');await page.waitForFunction(({id,value})=>document.getElementById(id).checked===value,{id,value:!initial});
   assert.equal(await input.isChecked(),!initial);await page.keyboard.press('Space');
   await page.waitForFunction(({id,value})=>document.getElementById(id).checked===value,{id,value:initial});
  }
  await page.locator('#nativeFontUp').click();await page.waitForFunction(()=>fontSize==='large');
  await page.locator('#nativeFontDown').click();await page.waitForFunction(()=>fontSize==='standard');
  await page.locator('#priceDecimalsSelect').selectOption('4');await page.waitForFunction(()=>priceDecimalsPreference==='4');
  await page.locator('#priceDecimalsSelect').selectOption('auto');
  await page.locator('#clearCacheButton').click();assert.match(await page.locator('#storageStatus').textContent(),/temizlendi/);
  await page.locator('#diagnosticsRefresh').click();assert(await page.locator('#diagnosticsList dt').count()>0);
  await page.locator('#otherAlarmShortcut').click();await page.locator('#alarmDialog[open]').waitFor();await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
  // The existing alarm shortcut navigates to Grafik before opening its dialog.
  await nav('Diğer');
  await page.locator('#backupDownload').evaluate(n=>n.scrollIntoView({block:'center'}));
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#backupDownload').tap()]);
  const bytes=fs.readFileSync(await download.path()),backup=JSON.parse(bytes);
  assert.equal(backup.schemaVersion,3);assert(backup.data.portfolios.some(book=>book.name==='Pilot renamed'));
  await page.locator('#backupFile').setInputFiles({name:'pilot-backup.json',mimeType:'application/json',buffer:bytes});
  await page.waitForFunction(()=>!document.getElementById('restoreBackup').disabled);await page.locator('#restoreBackup').tap();
  await page.locator('#backupPreview.success').waitFor();
  assert.match(await page.locator('#backupPreview').textContent(),/Geri yükleme tamamlandı/);
  assert(await page.evaluate(()=>portfolioBooks.some(book=>book.name==='Pilot renamed')));
  await download.delete();
  await page.locator('#accountAction').tap();await page.locator('#authGate').waitFor();await page.locator('#authLocalContinue').tap();
  await page.waitForFunction(()=>document.getElementById('authGate').hidden);
  assert(await page.evaluate(()=>window.retainedNodes.every(node=>document.getElementById(node.id)===node)),'Native nodes/listeners and canvases retain identity');
  await page.reload();if(await page.locator('#authLocalContinue').isVisible())await page.locator('#authLocalContinue').click();
  await nav('Portföy');await page.waitForSelector('#portfolio-react .native-selector-card');
  assert(await page.evaluate(()=>portfolioBooks.some(book=>book.name==='Pilot renamed'&&book.cashBalances[0]?.amount===123.45)),'Transactions survive reload');
  assert.deepEqual(errors,[],'No remaining-page runtime/console errors');
 }finally{await context.close();}
};
