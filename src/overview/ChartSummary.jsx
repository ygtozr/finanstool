import React from 'react';

// The existing service owns calculation, currency/date formatting and clamping.
export function ChartSummary({ summary }) {
  return <section id="pilotPeriodSummary" className="period-summary" aria-labelledby="pilotPeriodSummaryTitle" aria-live="polite">
    <h3 id="pilotPeriodSummaryTitle">Dönem Özeti</h3>
    <dl className="period-summary-list">
      {[[summary.label, summary.last, summary.lastDate, ''], ['Dönem değişimi', summary.change, '', summary.tone], ['Dönem düşük', summary.low, summary.lowDate, ''], ['Dönem yüksek', summary.high, summary.highDate, '']].map(([label, value, date, tone], index) => <div className="period-summary-item" key={index}><dt>{label}</dt><dd><span className={tone || undefined}>{value}</span>{date ? <small className="period-summary-date">{date}</small> : null}</dd></div>)}
    </dl>
    <div className="period-summary-range"><div className="period-summary-range-track" role="progressbar" aria-label="Güncel fiyatın dönem aralığındaki konumu" aria-valuemin="0" aria-valuemax="100" aria-valuenow={summary.positionValue}><span className="period-summary-range-fill" style={{ width: summary.width }} /></div>
      <div className="period-summary-range-labels"><span>Düşük</span><span>{summary.position}</span><span>Yüksek</span></div>
    </div>
  </section>;
}
