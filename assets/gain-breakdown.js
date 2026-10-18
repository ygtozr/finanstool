/* Read-only presentation of the existing portfolio calculation results. */
window.OzerGainBreakdown = (() => {
  let state={status:'loading',items:[]},expanded=false,privateMode=false;
  const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function paint(){
    const host=document.getElementById('portfolioGains');if(!host)return;
    const body=host.querySelector('.gain-content'),meta=host.querySelector('.gain-meta');
    host.dataset.status=state.status;meta.textContent=(state.mode==='total'?'Toplam':'Bugün')+(state.currency?' · '+state.currency:'');
    body.replaceChildren();
    const messages={loading:'Fiyatlar ve kurlar güncelleniyor…',empty:'Kazanç dağılımı için varlık veya nakit ekleyin.',error:'Fiyat veya kur verisi eksik. Yanıltıcı bir sıralama gösterilmiyor.'};
    if(privateMode||state.status!=='ready'){
      body.append(node('p','gain-note',privateMode?'Rakamlar gizli. Görmek için portföy gizliliğini kapatın.':messages[state.status]||messages.error));return;
    }
    const items=[...state.items].sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)||a.symbol.localeCompare(b.symbol));
    if(!items.length){body.append(node('p','gain-note',messages.empty));return;}
    body.append(node('p','gain-note',state.mode==='total'?'Aktif portföyün mevcut pozisyonlarında maliyete göre kâr/zarar.':'Aktif portföyde önceki kapanışa göre değişim. Nakit varsa kur etkisi dahildir.'));
    body.append(node('p','gain-note','En büyük tutardan sıralanır; çubuklar mutlak tutara göre ölçeklenir.'));
    const list=node('ul','gain-list'),max=Math.max(...items.map(item=>Math.abs(item.value)))||1;
    for(const item of expanded?items:items.slice(0,5)){
      const row=node('li','gain-row'),line=node('div','gain-line'),identity=node('span','gain-identity');
      identity.append(node('strong','',item.symbol),node('small','',item.name));
      const value=node('strong',item.value>0?'positive':item.value<0?'negative':'',state.money(item.value,state.currency));
      line.append(identity,value);
      const track=node('div','gain-track');track.setAttribute('aria-hidden','true');
      const bar=node('span',item.value>=0?'gain-bar gain-up':'gain-bar gain-down');bar.style.width=(Math.abs(item.value)/max*50)+'%';track.append(bar);
      row.append(line,track);list.append(row);
    }
    body.append(list);
    if(items.length>5){
      const button=node('button','gain-expand',expanded?'Daha az göster':'Tümünü göster ('+items.length+')');button.type='button';button.setAttribute('aria-expanded',String(expanded));
      button.addEventListener('click',()=>{expanded=!expanded;paint();body.querySelector('.gain-expand')?.focus()});body.append(button);
    }
  }
  return {
    render(value){state=value;privateMode=Boolean(value.private);paint();},
    privacy(value){privateMode=Boolean(value);paint();}
  };
})();
