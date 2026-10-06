import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Page, Segmented } from 'framework7-react';
import { overview } from './legacy-adapter';
import { AssetSearch } from './AssetSearch';
import { ChartAssets } from './ChartAssets';
import { ChartSummary } from './ChartSummary';

const ranges = [['5d', '1 hafta'], ['1mo', '1 ay'], ['3mo', '3 ay'], ['6mo', '6 ay'], ['1y', '1 yıl'], ['5y', '5 yıl']];
const actions = [['advancedSearchButton', 'Gelişmiş Arama'], ['alarmButton', 'Fiyat Alarmı'], ['exportCsv', 'CSV İndir'], ['exportPng', 'PNG İndir']];

// Existing canvases, MA and date input retain their DOM nodes and listeners.
// React controls consume the existing service-owned view model.
export function ChartShell({ chart }) {
  const host = useRef(null);
  useLayoutEffect(() => {
    let restore;
    const mount = () => { restore = overview.mountChartShell(Object.fromEntries([...host.current.querySelectorAll('[data-chart-slot]')].map(node => [node.dataset.chartSlot, node]))); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
    return () => { document.removeEventListener('DOMContentLoaded', mount); restore?.(); };
  }, []);
  return createPortal(<div id="chart-react" ref={host}>
    <Page name="chart" className="pilot-chart-page">
      <h1 className="page-brand pilot-brand"><img className="brand-lockup-mark" src="assets/brand-symbol-a.png?v=7.9" alt="" /><span className="brand-lockup-name">Özer Finans</span><span className="version-badge">v9.0.2-preview.2</span></h1>
      <h2 id="pilotChartTitle">Grafik Ve Teknik Analiz</h2>
      <AssetSearch kind="chart" onAdd={overview.chartSelect} chartState={chart} />
      <div className="toolbar pilot-chart-toolbar" role="group" aria-label="Grafik işlemleri">
        {actions.map(([id, label]) => {
          const disabled=(id === 'exportCsv' || id === 'exportPng') && (!chart.exportReady || chart.busy || (id === 'exportPng' && chart.pngBusy));
          return <Button type="button" key={id} id={`pilot-${id}`} disabled={disabled} aria-disabled={disabled} aria-busy={id === 'exportPng' ? chart.pngBusy : undefined} onClick={() => overview.chartAction(id)}>{id === 'exportPng' ? chart.pngLabel : label}</Button>;
        })}
      </div>
      <div data-chart-slot="plot" className="pilot-chart-slot" />
      <div data-chart-slot="rsi" className="pilot-chart-slot" />
      <Segmented className="periods pilot-chart-periods" role="group" aria-label="Grafik süresi">
        {ranges.map(([range, label]) => <Button type="button" key={range} data-range={range} className={!chart.start && chart.range === range ? 'active' : ''} aria-pressed={!chart.start && chart.range === range} onClick={() => overview.chartPeriod(range)}>{label}</Button>)}
        <Button id="pilotCustomPeriod" type="button" className={chart.start ? 'active' : ''} aria-pressed={Boolean(chart.start)} aria-expanded={chart.customOpen} aria-controls="datePicker" onClick={() => overview.chartPeriod('custom')}>{chart.customLabel}</Button>
        <div data-chart-slot="dates" className="pilot-chart-slot" />
      </Segmented>
      <ChartSummary summary={chart.summary} />
      <div data-chart-slot="hint" className="pilot-chart-slot" />
      <ChartAssets favorites={chart.favorites} portfolio={chart.portfolio} />
    </Page>
  </div>, document.getElementById('chartView'));
}
