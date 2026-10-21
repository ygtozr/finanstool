import React, { useEffect, useState } from 'react';

export function SessionQuote({ session }) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    setNow(Date.now());
    if(!session)return;
    const timer=setTimeout(()=>setNow(Date.now()),Math.max(0,session.expiresAt-Date.now())+50);
    return ()=>clearTimeout(timer);
  },[session?.expiresAt]);
  if(!session||session.expiresAt<=now)return null;
  return <span className="favorite-session" title={`${session.label} · ${session.time} · Normal seans kapanışına göre · 5 dk bar verisi; gecikmeli olabilir`}>
    <span className="favorite-session-label">{session.label}<small> · {session.time}</small></span>
    <span className="favorite-session-value"><strong>{session.price}</strong><small className={session.tone}>{session.change}</small></span>
  </span>;
}
