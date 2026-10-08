/* Independent mode, accent and surface preferences. No network requests. */
window.OzerAppearance = (() => {
  const colors={klasik:['Klasik','#52D5B1'],turkuaz:['Turkuaz','#00D5D8'],safir:['Safir','#246BFF'],lavanta:['Lavanta','#A78BFA'],sampanya:['Şampanya','#D6A34B']};
  const looks={mat:'Mat',cam:'Hafif Cam',cizgi:'İnce Çizgi',ios:'iOS Sade',seramik:'Seramik',cerceve:'Çift Çerçeve',isik:'Köşe Işığı',katman:'Ton Katmanı',doku:'Mikro Doku'};
  const key='finans-grafigi-appearance';
  const normalize=value=>({color:Object.hasOwn(colors,value?.color)?value.color:'klasik',look:Object.hasOwn(looks,value?.look)?value.look:'cizgi'});
  let initial;try{initial=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  const legacy=localStorage.getItem('finans-grafigi-theme');
  const designPreview=new URLSearchParams(location.search).get('appearancePreview')==='ios-safir';
  let state=normalize(designPreview?{color:'safir',look:'ios'}:initial||(legacy==='lavender'?{color:'lavanta'}:legacy==='graphite'?{color:'safir'}:{color:'safir',look:'ios'}));
  const rgb=h=>h.slice(1).match(/../g).map(v=>parseInt(v,16));
  const mix=(a,b,p)=>'#'+rgb(a).map((v,i)=>Math.round(v*(1-p)+rgb(b)[i]*p).toString(16).padStart(2,'0')).join('');
  const lum=h=>rgb(h).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  // Resolve each independent preference before assigning CSS tokens. Native AppCard
  // intentionally gives Mat and İnce Çizgi the same material treatment.
  function resolve({mode='dark',color=state.color,look=state.look,density='standard',systemLight=false}={}){
    const normalized=normalize({color,look});
    const theme=mode==='system'?(systemLight?'light':'dark'):mode==='light'?'light':'dark';
    const light=theme==='light',accent=normalized.color==='safir'?(light?'#245FD1':'#82ACFF'):colors[normalized.color][1];
    const material={fill:'var(--surface-card)',image:'none',shadow:'none',outline:'none',outlineOffset:'-5px',blur:'none',imageSize:'auto'};
    if(normalized.look==='cam'){
      material.fill='color-mix(in srgb,var(--surface-card) 75%,transparent)';material.blur='blur(20px)';
    }else if(normalized.look==='seramik'){
      material.image='linear-gradient(135deg,color-mix(in srgb,var(--accent) 10%,transparent),transparent,color-mix(in srgb,var(--accent) 2%,transparent))';
      material.shadow=light?'0 5px 10px #0000001a':'0 5px 10px #00000040';
    }else if(normalized.look==='cerceve'){
      material.outline='1px solid color-mix(in srgb,var(--accent) 16%,transparent)';
    }else if(normalized.look==='isik'||normalized.look==='katman'){
      const start=normalized.look==='isik'?23:10,end=normalized.look==='isik'?2:9;
      material.image=`linear-gradient(135deg,color-mix(in srgb,var(--accent) ${start}%,transparent),transparent,color-mix(in srgb,var(--accent) ${end}%,transparent))`;
    }else if(normalized.look==='doku'){
      material.image=`radial-gradient(circle at 9px 9px,color-mix(in srgb,var(--accent) ${light?29:38}%,transparent) 1px,transparent 1.2px)`;
      material.imageSize='14px 14px';
    }
    return {theme,color:normalized.color,look:normalized.look,density:['small','large'].includes(density)?density:'standard',accent,material};
  }
  function apply(mode){
    const root=document.documentElement,resolved=resolve({mode,color:state.color,look:state.look,density:root.dataset.fontSize,systemLight:matchMedia('(prefers-color-scheme: light)').matches});
    const light=resolved.theme==='light',accent=resolved.accent;
    root.dataset.theme=resolved.theme;root.dataset.palette=resolved.color;root.dataset.look=resolved.look;
    const ink=light?mix('#000000',accent,.46):accent;
    const values={'surface-page':light?'#f1f3f5':'#101827','surface-main':light?'#ffffff':'#192337','surface-section':mix(light?'#f3f4f6':'#111a2b',accent,.05),'surface-card':mix(light?'#ffffff':'#0d1523',accent,.06),'surface-soft':mix(light?'#f0f2f5':'#182235',accent,.08),'surface-summary':mix(light?'#ffffff':'#192337',accent,.12),'surface-control':light?'#e5e7eb':'#26344d','line':light?'#d1d5db':'#2b3a55','border-strong':light?'#9ca3af':'#40516e','text':light?'#172033':'#eef3fb','muted':light?'#5f6f86':'#aebbd0','accent':accent,'accent-ink':ink,'on-accent':contrast(accent,'#ffffff')>contrast(accent,'#061018')?'#ffffff':'#061018','positive':light?'#17623e':'#75efa7','negative':light?'#ad2343':'#ffb1bd','warning':light?'#80531d':'#ffd482','info':light?'#275da0':'#a8d1ff','focus-ring':ink,'chart-fill':accent+'24','chart-fill-soft':accent+'12'};
    // Match AppPalette / AppCard in the native app; accents do not tint every surface.
    Object.assign(values,{'surface-page':light?'#eef3f8':'#101827','surface-section':light?'#ffffff':'#192337','surface-card':light?'#ffffff':'#0d1523','surface-soft':light?'#f3f5f8':'#202e46','surface-summary':light?'#ffffff':'#0d1523','surface-control':light?'#d9e0e9':'#26344d','line':light?'#cbd5e1':'#2b3a55','border-strong':light?'#cbd5e1':'#2b3a55'});
    if(resolved.look==='ios')Object.assign(values,{'surface-page':light?'#F2F2F7':'#101722','surface-main':light?'#F2F2F7':'#101722','surface-section':light?'#F2F2F7':'#101722','surface-card':light?'#FFFFFF':'#1C2635','surface-soft':light?'#F7F8FA':'#222F40','surface-summary':light?'#FFFFFF':'#1C2635','surface-control':light?'#F4F6FA':'#222F40','line':light?'#DCE2EB':'#334155','border-strong':light?'#BCC8DB':'#52637B','text':light?'#182230':'#F1F5F9','muted':light?'#667085':'#A7B1C2','positive':light?'#147D43':'#59D68C','negative':light?'#C83240':'#FF7B86'});
    Object.entries(values).forEach(([k,v])=>root.style.setProperty('--'+k,v));
    Object.entries({fill:resolved.material.fill,image:resolved.material.image,shadow:resolved.material.shadow,outline:resolved.material.outline,'outline-offset':resolved.material.outlineOffset,blur:resolved.material.blur,'image-size':resolved.material.imageSize}).forEach(([k,v])=>root.style.setProperty('--material-card-'+k,v));
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
  return {normalize,resolve,apply,restore,mount,snapshot:()=>({...state})};
})();
