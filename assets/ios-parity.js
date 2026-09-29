/* Browser equivalents of native controls and stable-slot hold-to-reorder. */
window.OzerNativeUI = (() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const configuredCharts = new WeakSet();
  let cancelCurrent = null;
  function reorder(handle, row, container, selector, commit, beforeStart = () => {}) {
    handle.classList.add('native-sortable');
    let state = null, suppressUntil = 0;
    const scrollHost = () => {
      for (let p = container; p; p = p.parentElement) {
        if (/auto|scroll/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p;
      }
      return document.scrollingElement;
    };
    const items = () => [...container.querySelectorAll(selector)];
    const clean = () => {
      if (!state) return;
      clearTimeout(state.timer); cancelAnimationFrame(state.frame);
      (state.nodes || []).forEach(n => { n.style.transform = ''; n.style.transition = ''; n.classList.remove('native-dragging'); });
      window.removeEventListener('pointermove', pointerMove); window.removeEventListener('pointerup', pointerEnd); window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('touchmove', touchMovePending); window.removeEventListener('touchmove', touchMove); window.removeEventListener('touchend', touchEnd); window.removeEventListener('touchcancel', cancel);
      window.removeEventListener('keydown', escape); window.removeEventListener('blur', cancel);
      state = null; cancelCurrent = null;
    };
    const valid = () => row.isConnected && items().every((n,i) => n === state.nodes[i]) && items().length === state.nodes.length;
    const draw = () => {
      if (!state?.active || state.settling) return;
      if (!valid()) { clean(); return; }
      const s = state, bounds = s.scroll === document.scrollingElement ? {top:0,bottom:innerHeight} : s.scroll.getBoundingClientRect();
      const speed = s.y < bounds.top + 65 ? -Math.min(5,(bounds.top+65-s.y)/13) : s.y > bounds.bottom-65 ? Math.min(5,(s.y-bounds.bottom+65)/13) : 0;
      if (speed) s.scroll.scrollTop += speed;
      const dx = s.x-s.originX, dy = s.y-s.originY+s.scroll.scrollTop-s.initialScroll;
      const center = {x:s.frames[s.from].x+dx,y:s.frames[s.from].y+dy};
      const distance = i => Math.hypot(s.frames[i].x-center.x,s.frames[i].y-center.y);
      const closest = s.frames.reduce((a,_,i) => distance(i) < distance(a) ? i : a, s.to);
      if (distance(closest)+8 < distance(s.to)) s.to=closest;
      s.nodes.forEach((node,i) => {
        if (i===s.from) { node.style.transform=`translate(${dx}px,${dy}px)`; return; }
        const slot = s.from < i && i <= s.to ? i-1 : s.to <= i && i < s.from ? i+1 : i;
        node.style.transform=`translate(${s.frames[slot].x-s.frames[i].x}px,${s.frames[slot].y-s.frames[i].y}px)`;
      });
      s.frame=requestAnimationFrame(draw);
    };
    const activate = () => {
      if (!state || !row.isConnected || state.scrolling) return;
      const s=state; s.nodes=items(); if(s.nodes.length<2) return;
      beforeStart(); s.frames=s.nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
      s.from=s.nodes.indexOf(row); s.to=s.from; s.active=true; s.originX=s.x; s.originY=s.y; s.initialScroll=s.scroll.scrollTop;
      if(s.touch) { window.removeEventListener('touchmove',touchMovePending); window.addEventListener('touchmove',touchMove,{passive:false}); }
      s.nodes.forEach(n=>n.style.transition=n===row||reduced()?'none':'transform 180ms ease-in-out');
      row.classList.add('native-dragging'); navigator.vibrate?.(15); draw();
    };
    const move = (x,y,event) => {
      if (!state || state.settling) return;
      state.x=x; state.y=y;
      if (!state.active && Math.hypot(x-state.startX,y-state.startY)>10) {
        clearTimeout(state.timer); state.scrolling=true;
      } else if(state.active) event.preventDefault();
    };
    const finish = (event,cancelled=false) => {
      if(!state || state.settling) return;
      if(!state.active) {
        if(state.scrolling) suppressUntil=Date.now()+500;
        clean(); return;
      }
      event?.preventDefault(); suppressUntil=Date.now()+500;
      const s=state; s.settling=true; cancelAnimationFrame(s.frame);
      const to=cancelled?s.from:s.to;
      row.style.transition=reduced()?'none':'transform 160ms ease-out';
      row.style.transform=`translate(${s.frames[to].x-s.frames[s.from].x}px,${s.frames[to].y-s.frames[s.from].y}px)`;
      if(cancelled) s.nodes.forEach(n=>n.style.transform='translate(0,0)');
      setTimeout(()=>{
        if(state!==s) return;
        const canCommit=!cancelled&&valid();
        const order=[...s.nodes]; order.splice(s.from,1); order.splice(to,0,row);
        clean();
        if(canCommit && to!==s.from) { order.forEach(n=>container.append(n)); commit(); }
      },reduced()?0:160);
    };
    const pointerMove=e=>{if(e.pointerId===state?.id)move(e.clientX,e.clientY,e);};
    const pointerEnd=e=>{if(e.pointerId===state?.id)finish(e);};
    const touchMovePending=e=>{const t=[...e.touches].find(t=>t.identifier===state?.id);if(t)move(t.clientX,t.clientY,e);};
    const touchMove=e=>{const t=[...e.touches].find(t=>t.identifier===state?.id);if(t)move(t.clientX,t.clientY,e);};
    const touchEnd=e=>{if([...e.changedTouches].some(t=>t.identifier===state?.id))finish(e);};
    const cancel=e=>finish(e,true);
    const escape=e=>{if(e.key==='Escape')cancel(e);};
    const begin=(id,x,y,touch)=>{
      if(state?.settling) return;
      cancelCurrent?.(); state={id,x,y,startX:x,startY:y,touch,scroll:scrollHost()}; cancelCurrent=clean;
      state.timer=setTimeout(activate,400);
      if(touch) { window.addEventListener('touchmove',touchMovePending,{passive:true});window.addEventListener('touchend',touchEnd);window.addEventListener('touchcancel',cancel); }
      else { window.addEventListener('pointermove',pointerMove,{passive:false});window.addEventListener('pointerup',pointerEnd);window.addEventListener('pointercancel',cancel); }
      window.addEventListener('keydown',escape);window.addEventListener('blur',cancel);
    };
    handle.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&e.isPrimary&&e.button===0)begin(e.pointerId,e.clientX,e.clientY,false);});
    handle.addEventListener('touchstart',e=>{if(e.touches.length!==1){cancel(e);return;}const t=e.changedTouches[0];begin(t.identifier,t.clientX,t.clientY,true);},{passive:true});
    handle.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
    handle.addEventListener('contextmenu',e=>e.preventDefault());
    handle.addEventListener('dragstart',e=>e.preventDefault());
    handle.addEventListener('keydown',e=>{
      if(!e.altKey||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
      e.preventDefault(); const nodes=items(),i=nodes.indexOf(row),next=i+(['ArrowUp','ArrowLeft'].includes(e.key)?-1:1);
      if(next<0||next>=nodes.length)return;
      if(next<i)container.insertBefore(row,nodes[next]);else container.insertBefore(row,nodes[next].nextSibling);
      commit();handle.focus();
    });
    handle.title=(handle.title?handle.title+' · ':'')+'Sıralamak için basılı tutun; klavyede Alt + yön tuşları';
  }
  function sync() {
    document.querySelectorAll('.appearance-menu').forEach(menu=>{
      const selected=menu.querySelector('button.active');let value=menu.querySelector('.appearance-value');
      if(!value){value=document.createElement('span');value.className='appearance-value';menu.querySelector('summary').append(value);}
      value.textContent=selected?.textContent||'';
    });
    document.querySelectorAll('[data-native-select]').forEach(button=>button.setAttribute('aria-pressed',String(document.getElementById(button.dataset.nativeSelect).value===button.dataset.value)));
    const font=document.getElementById('fontSizeSelect');
    const down=document.getElementById('nativeFontDown'),up=document.getElementById('nativeFontUp');
    if(down)down.disabled=font.value==='small';if(up)up.disabled=font.value==='large';
  }
  function mount() {
    const ma=document.getElementById('maToggle');document.querySelector('.chart-wrap').after(ma);
    const plot=document.querySelector('.chart-wrap'),plotCard=document.createElement('section');plotCard.className='native-plot-card';
    plot.before(plotCard);plotCard.append(plot,ma);
    const rsi=document.getElementById('rsiWrap'),rsiCard=document.createElement('section');rsiCard.className='native-plot-card';
    rsi.before(rsiCard);const rsiTitle=document.createElement('h3');rsiTitle.textContent='RSI 14';rsiCard.append(rsiTitle,rsi);
    const switcher=document.querySelector('.portfolio-switcher'),selectorCard=document.createElement('section');selectorCard.className='native-selector-card';
    switcher.before(selectorCard);selectorCard.append(switcher,document.getElementById('portfolioBookTabs'));
    const themeGroup=document.querySelector('[aria-label="Tema seçimi"]');
    ['system','dark','light'].forEach(mode=>{const b=themeGroup.querySelector('[data-theme-choice="'+mode+'"]');b.textContent=({system:'Sistem',dark:'Koyu',light:'Açık'})[mode];themeGroup.append(b);});
    const numberCard=document.getElementById('numberFormatTitle').closest('section');
    const dataControls=document.getElementById('dataPreferencesTitle').closest('section').querySelector('.settings-card-controls');
    dataControls.prepend(...numberCard.querySelector('.settings-card-controls').children);numberCard.remove();
    const shortcut=document.getElementById('otherAlarmShortcut'),shortcutCard=shortcut.closest('section');
    const notifications=document.getElementById('notificationsTitle');notifications.textContent='Fiyat Alarmları';
    notifications.closest('section').querySelector('.settings-card-controls').append(shortcut);shortcutCard.remove();
    document.querySelectorAll('.native-plot-card,.native-selector-card,.portfolio-benchmark,.portfolio-distribution,.dividend-section,.portfolio-cash').forEach(n=>n.classList.add('native-surface'));
    const font=document.getElementById('fontSizeSelect');font.closest('label').hidden=true;
    const control=document.createElement('div');control.className='native-font-control';
    control.innerHTML='<span>Yazı boyutu<small class="native-help" style="display:block">Uygulama metinlerini küçültün veya büyütün.</small></span><button id="nativeFontDown" type="button" aria-label="Yazı boyutunu azalt">A−</button><button id="nativeFontUp" type="button" aria-label="Yazı boyutunu artır">A+</button>';
    font.closest('label').after(control);
    [['nativeFontDown',-1],['nativeFontUp',1]].forEach(([id,delta])=>document.getElementById(id).addEventListener('click',()=>{
      const values=['small','standard','large'];font.value=values[Math.max(0,Math.min(2,values.indexOf(font.value)+delta))];font.dispatchEvent(new Event('change',{bubbles:true}));sync();
    }));
    const select=document.getElementById('baseCurrencySelect');select.hidden=true;
    const group=document.createElement('div');group.className='native-segments';group.setAttribute('role','group');group.setAttribute('aria-label','Tercih edilen para birimi');
    [['NATIVE','Yerel'],['TRY','TRY'],['USD','USD']].forEach(([value,label])=>{
      const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.nativeSelect=select.id;button.dataset.value=value;
      button.addEventListener('click',()=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();});group.append(button);
    });select.after(group);
    const help={defaultPortfolioSelect:'Uygulama açıldığında seçili gelecek portföy.',defaultBenchmarkSelect:'Karşılaştırma grafiğinde başlangıçta kullanılacak ürün.',baseCurrencySelect:'Yerel: ürünün kendi para birimi. Karma toplamlar USD bazındadır.',priceDecimalsSelect:'Yalnız gösterim hassasiyetini değiştirir; hesaplamalar aynı kalır.',percentDecimalsSelect:'Yüzde değişiminde virgülden sonra gösterilen basamak sayısı.',refreshIntervalSelect:'Açık sayfanın verilerini kontrol eder; kaynak gecikmesini değiştirmez.',defaultRangeSelect:'Grafik açıldığında seçili gelen zaman aralığı.',alarmCheckIntervalSelect:'Uygulama açıkken fiyatların kontrol sıklığıdır; geri sayım değildir.',backupReminderSelect:'Yedek almayı hatırlatır; otomatik yedek oluşturmaz.',restoreMode:'Birleştir mevcut portföyleri korur; eşleşen kayıtları yedekten günceller. Değiştir mevcut verinin yerine yedeği koyar.'};
    Object.entries(help).forEach(([id,text])=>{const input=document.getElementById(id),note=document.createElement('small');note.className='native-help';note.id=id+'Help';note.textContent=text;input.closest('label').append(note);input.setAttribute('aria-describedby',note.id);});
    const paths=['M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10','M3 3v18h18M6 15l5-6 4 3 5-7','M4 7h16v13H4zM7 4h10','M5 12h.01M12 12h.01M19 12h.01'];
    document.querySelectorAll('.mobile-bottom-nav button span').forEach((span,i)=>{span.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[i]+'"/></svg>';});
    const marketForm=document.getElementById('marketSettingsForm');document.getElementById('marketSettingsList').before(marketForm);
    document.querySelector('#marketSettingsDialog .portfolio-dialog-symbol').textContent='Arayarak ekleyin; sıralamak için basılı tutup sürükleyin. Çarpıyla kaldırın.';
    document.addEventListener('change',sync);sync();
    document.querySelectorAll('.appearance-menu').forEach(menu=>menu.addEventListener('toggle',()=>{
      if(!menu.open)return;
      document.querySelectorAll('.appearance-menu[open]').forEach(other=>{if(other!==menu)other.open=false;});
      const box=menu.querySelector('summary').getBoundingClientRect(),below=innerHeight-box.bottom-80;
      const up=below<160&&box.top>below;menu.classList.toggle('opens-up',up);
      menu.style.setProperty('--menu-space',Math.max(100,up?box.top-10:below)+'px');
    }));
    document.addEventListener('click',e=>document.querySelectorAll('.appearance-menu[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false;}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.appearance-menu[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
  }
  function configureCharts(Chart) {
    if(configuredCharts.has(Chart))return;
    configuredCharts.add(Chart);
    Chart.register({id:'nativeInspection',afterDatasetsDraw(chart){
      if(!['priceChart','rsiChart'].includes(chart.canvas.id))return;
      const point=chart.tooltip?.getActiveElements()[0];if(!point)return;
      const {ctx,chartArea}=chart;ctx.save();ctx.beginPath();ctx.setLineDash([4,3]);
      ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();ctx.lineWidth=1;
      ctx.moveTo(point.element.x,chartArea.top);ctx.lineTo(point.element.x,chartArea.bottom);ctx.stroke();ctx.restore();
    }});
  }
  document.addEventListener('DOMContentLoaded',mount);
  return {reorder,sync,configureCharts};
})();
