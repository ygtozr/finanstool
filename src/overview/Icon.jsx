import React from 'react';

// Shared with preserved DOM controls; labels belong to the interactive control.
export function Icon({name}) {
 const {path,filled}=window.OzerIcons.get(name);
 return <svg className="ui-icon" data-ui-icon={name} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={path} fill={filled?'currentColor':'none'} fillRule="evenodd" stroke={filled?'none':'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
