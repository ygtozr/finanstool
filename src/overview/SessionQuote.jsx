import React, { useEffect, useState } from 'react';

export function SessionQuote({ session }) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    if(!session)return;
    const current=Date.now(),next=[session.expiresAt,session.sessionEnd,session.asOf+900000].filter(t=>Number.isFinite(t)&&t>current);
    if(!next.length)return;
    const timer=setTimeout(()=>setNow(Date.now()),Math.min(...next)-current+50);
    return ()=>clearTimeout(timer);
  },[session?.expiresAt,session?.sessionEnd,session?.asOf,now]);
  const current=Math.max(now,Date.now());
  if(!session||session.expiresAt<=current)return null;
  const lastKnown=session.lastKnown||current>=session.sessionEnd||current-session.asOf>=900000;
  const label=lastKnown&&!session.lastKnown?'Son '+session.label.toLocaleLowerCase('tr-TR'):session.label;
  const time=lastKnown&&Number.isFinite(session.asOf)?new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(session.asOf)).replace(',', ''):session.time;
  return <span className="favorite-session" title={`${label} · ${time} · Yerel saat · Normal seans kapanışına göre · 5 dk bar verisi; gecikmeli olabilir`}>
    <span className="favorite-session-label">{label}<small> · {time}</small></span>
    <span className="favorite-session-value"><strong>{session.price}</strong><small className={session.tone}>{session.change}</small></span>
  </span>;
}
