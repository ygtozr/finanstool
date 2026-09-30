/* Shared chart palette and geometry; date placement remains period-aware in index.html. */
window.OzerChartTheme=(()=>{
  const read=(name,fallback)=>getComputedStyle(document.documentElement).getPropertyValue(name).trim()||fallback;
  const palette=()=>({
    text:read('--chart-label','#aebbd0'),grid:read('--chart-grid','#2b3a55'),
    accent:read('--chart-price','#52d5b1'),info:read('--info','#60a5fa'),
    fill:read('--chart-fill','#52d5b124'),fillSoft:read('--chart-fill-soft','#52d5b112'),
    infoFill:read('--info-fill','#60a5fa12'),benchmark:read('--chart-benchmark','#ff9500'),
    ma50:read('--chart-ma50','#34c759'),ma100:read('--chart-ma100','#ffcc00'),
    ma200:read('--chart-ma200','#ff3b30'),rsiHigh:read('--chart-rsi-high','#ff453a66'),
    rsiLow:read('--chart-rsi-low','#30d15866'),
    allocation:[read('--accent','#52d5b1'),'#60a5fa','#fb7185','#fbbf24','#a78bfa','#22d3ee','#f97316','#84cc16','#f472b6','#94a3b8']
  });
  const lineOptions=()=>({responsive:true,maintainAspectRatio:false,animation:false,
    interaction:{mode:'index',intersect:false},elements:{line:{tension:0,borderWidth:2},point:{radius:0,hoverRadius:4}},
    plugins:{legend:{labels:{color:palette().text,usePointStyle:true,boxWidth:10}}}});
  const doughnutOptions=()=>({responsive:true,maintainAspectRatio:false,cutout:'70%',animation:{duration:450},plugins:{legend:{display:false}}});
  return {palette,lineOptions,doughnutOptions};
})();
