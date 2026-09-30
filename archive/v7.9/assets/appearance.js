/* Independent mode, accent and surface preferences. No network requests. */
window.OzerAppearance = (() => {
  const colors={klasik:['Klasik','#52D5B1'],turkuaz:['Turkuaz','#00D5D8'],safir:['Safir','#246BFF'],lavanta:['Lavanta','#A78BFA'],sampanya:['Şampanya','#D6A34B']};
  const looks={mat:'Mat',cam:'Hafif Cam',cizgi:'İnce Çizgi',seramik:'Seramik',cerceve:'Çift Çerçeve',isik:'Köşe Işığı',katman:'Ton Katmanı',doku:'Mikro Doku'};
  const key='finans-grafigi-appearance';
  const normalize=value=>({color:Object.hasOwn(colors,value?.color)?value.color:'klasik',look:Object.hasOwn(looks,value?.look)?value.look:'cizgi'});
  let initial;try{initial=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  const legacy=localStorage.getItem('finans-grafigi-theme');
  let state=normalize(initial||(legacy==='lavender'?{color:'lavanta'}:legacy==='graphite'?{color:'safir'}:null));
  const rgb=h=>h.slice(1).match(/../g).map(v=>parseInt(v,16));
  const mix=(a,b,p)=>'#'+rgb(a).map((v,i)=>Math.round(v*(1-p)+rgb(b)[i]*p).toString(16).padStart(2,'0')).join('');
  const lum=h=>rgb(h).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  function apply(mode){
    const root=document.documentElement,light=mode==='light',accent=colors[state.color][1];
    root.dataset.palette=state.color;root.dataset.look=state.look;
    const ink=light?mix('#000000',accent,.46):accent;
    const values={'surface-page':light?'#f1f3f5':'#101827','surface-main':light?'#ffffff':'#192337','surface-section':mix(light?'#f3f4f6':'#111a2b',accent,.05),'surface-card':mix(light?'#ffffff':'#0d1523',accent,.06),'surface-soft':mix(light?'#f0f2f5':'#182235',accent,.08),'surface-summary':mix(light?'#ffffff':'#192337',accent,.12),'surface-control':light?'#e5e7eb':'#26344d','line':light?'#d1d5db':'#2b3a55','border-strong':light?'#9ca3af':'#40516e','text':light?'#172033':'#eef3fb','muted':light?'#5f6f86':'#aebbd0','accent':accent,'accent-ink':ink,'on-accent':contrast(accent,'#ffffff')>contrast(accent,'#061018')?'#ffffff':'#061018','positive':light?'#17623e':'#75efa7','negative':light?'#ad2343':'#ffb1bd','warning':light?'#80531d':'#ffd482','info':light?'#275da0':'#a8d1ff','focus-ring':ink,'chart-fill':accent+'24','chart-fill-soft':accent+'12'};
    // Match AppPalette / AppCard in the native app; accents do not tint every surface.
    Object.assign(values,{'surface-page':light?'#eef3f8':'#101827','surface-section':light?'#ffffff':'#192337','surface-card':light?'#ffffff':'#0d1523','surface-soft':light?'#f3f5f8':'#202e46','surface-summary':light?'#ffffff':'#0d1523','surface-control':light?'#d9e0e9':'#26344d','line':light?'#cbd5e1':'#2b3a55','border-strong':light?'#cbd5e1':'#2b3a55'});
    Object.entries(values).forEach(([k,v])=>root.style.setProperty('--'+k,v));
    document.querySelectorAll('[data-appearance-color],[data-appearance-look]').forEach(b=>{
      const active=b.dataset.appearanceColor?b.dataset.appearanceColor===state.color:b.dataset.appearanceLook===state.look;
      b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
    });
    window.OzerNativeUI?.sync();
  }
  function restore(value,persist=true){state=normalize(value);if(persist)localStorage.setItem(key,JSON.stringify(state));}
  function mount(refresh){
    const host=document.getElementById('appearanceChoices');
    for(const [field,items] of [['color',colors],['look',looks]]){
      const menu=document.createElement('details');menu.className='appearance-menu';
      const heading=document.createElement('summary');heading.textContent=field==='color'?'Vurgu rengi':'Yüzey stili';menu.append(heading);host.append(menu);
      const group=document.createElement('div');group.className='theme-choices';group.setAttribute('role','group');group.setAttribute('aria-label',heading.textContent);
      Object.entries(items).forEach(([value,label])=>{
        const b=document.createElement('button');b.type='button';b.className='theme-choice';
        b.dataset[field==='color'?'appearanceColor':'appearanceLook']=value;b.textContent=Array.isArray(label)?label[0]:label;
        b.addEventListener('click',()=>{restore({...state,[field]:value});refresh();menu.open=false;heading.focus();});group.append(b);
      });menu.append(group);
    }
  }
  return {normalize,apply,restore,mount,snapshot:()=>({...state})};
})();
