import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Page, Segmented, Toggle } from 'framework7-react';
import { overview } from './legacy-adapter';

// Preserve finance/auth/form nodes and their listeners while Framework7 owns pages.
function PreservedPage({ view, title }) {
  const content = useRef(null);
  useLayoutEffect(() => {
    let restore;
    const mount = () => { restore = overview.mountNativePage(view, content.current); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
    return () => { document.removeEventListener('DOMContentLoaded', mount); restore?.(); };
  }, [view]);
  return createPortal(<div id={`${view}-react`} className="pilot-preserved-page">
    <Page name={view}>
      <h1 className="page-brand pilot-brand"><img className="brand-lockup-mark" src="assets/brand-symbol-a.png?v=7.9" alt="" /><span className="brand-lockup-name">Özer Finans</span><span className="version-badge">v9.0.2</span></h1>
      {title ? <h2 className="pilot-page-title">{title}</h2> : null}
      <div ref={content} className="pilot-preserved-content" />
    </Page>
  </div>, document.getElementById(`${view}View`));
}

export function PortfolioShell({ state }) {
  const label = state.private ? 'Portföy rakamlarını göster' : 'Portföy rakamlarını gizle';
  const privacyButton = (id, active = false) => <Button id={id} type="button" className="portfolio-privacy-toggle pilot-privacy" aria-label={active ? `Aktif ${label.toLocaleLowerCase('tr-TR')}` : label} title={active ? `Aktif ${label.toLocaleLowerCase('tr-TR')}` : label} aria-pressed={state.private} onClick={() => overview.portfolioAction('portfolioPrivacyToggle')}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c2.5-4 5.8-6 10-6s7.5 2 10 6c-2.5 4-5.8 6-10 6S4.5 16 2 12Z" /><circle cx="12" cy="12" r="2.6" />{state.private ? <path d="m3 3 18 18" /> : null}</svg>
  </Button>;
  return <>
    <PreservedPage view="portfolio" />
    {createPortal(<>
      <Segmented className="portfolio-metric-mode pilot-portfolio-modes" role="group" aria-label="Portföy kâr zarar dönemi">
        {[['today', 'Bugün', 'portfolioTodayMode'], ['total', 'Toplam', 'portfolioTotalMode']].map(([mode, text, id]) => <Button type="button" key={mode} id={`pilot-${id}`} className={state.mode === mode ? 'is-active' : ''} aria-pressed={state.mode === mode} onClick={() => overview.portfolioAction(id)}>{text}</Button>)}
      </Segmented>
      {privacyButton('pilot-portfolioPrivacyToggle')}
    </>, document.querySelector('#allPortfolioHead .portfolio-view-toolbar'))}
    {createPortal(privacyButton('pilot-activePortfolioPrivacyToggle', true), document.querySelector('.native-selector-card .portfolio-switcher-actions'))}
  </>;
}

const notificationControls = [
  ['alarmNotificationsToggle', 'Denetim', ''],
  ['alarmSoundToggle', 'Ses', 'Alarm tetiklenince kısa bir ses çal.'],
  ['alarmVibrationToggle', 'Titreşim', 'Desteklenen cihazlarda titreşim kullan.'],
  ['alarmAutoDisableToggle', 'Otomatik Kapat', 'Aynı alarmın art arda bildirim vermesini önler.'],
];
function NotificationToggle({ id, label, note, checked }) {
  const toggle = useRef(null);
  useLayoutEffect(() => {
    const input = toggle.current.el.querySelector('input');
    input.id = `pilot-${id}`; input.setAttribute('role', 'switch');
    input.setAttribute('aria-labelledby', `pilot-${id}-label`);
    input.setAttribute('aria-describedby', `pilot-${id}-note`);
    // Framework7 owns the input event; sync external preferences without React's
    // controlled-checkbox restoration running before its native change listener.
    input.checked = checked;
  }, [id, checked]);
  return <div className="setting-switch pilot-notification">
    <span><strong id={`pilot-${id}-label`}>{label}</strong><small id={`pilot-${id}-note`}>{note}</small></span>
    <Toggle ref={toggle} defaultChecked={checked} onChange={event => overview.settingsToggle(id, event.target.checked)} />
  </div>;
}
export function OtherShell({ theme, settings }) {
  return <>
    <PreservedPage view="other" title="Diğer" />
    {createPortal(<Segmented strong className="pilot-theme-controls settings-segments" style={{ '--selected-segment': ['system', 'dark', 'light'].indexOf(theme) }}>
      {[['system', 'Sistem'], ['dark', 'Koyu'], ['light', 'Açık']].map(([mode, label]) => <Button type="button" key={mode} id={`pilot-theme-${mode}`} className={`theme-choice ${theme === mode ? 'active' : ''}`} aria-pressed={theme === mode} onClick={() => overview.theme(mode)}>{label}</Button>)}
    </Segmented>, document.querySelector('#otherView .theme-choices'))}
    {createPortal(notificationControls.map(([id, label, note]) => <NotificationToggle key={id} id={id} label={label} note={id === 'alarmNotificationsToggle' ? settings.alarmStatus : note} checked={settings[id]} />), document.querySelector('#otherView .settings-switches'))}
  </>;
}
