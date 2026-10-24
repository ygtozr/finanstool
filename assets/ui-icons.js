/* Original SVG drawings on a shared 24 px grid; no font download or Apple assets. */
window.OzerIcons=(()=>{
 const paths={
  home:'M3 10.5 12 3l9 7.5M5.5 9.5V21h4.3v-6h4.4v6h4.3V9.5',
  homeFilled:'M2 10.5 12 2l10 8.5-1.6 1.9L19 11.2V22h-5v-7h-4v7H5V11.2l-1.4 1.2Z',
  chart:'M4 3v17h17M7 15l4-5 4 3 5-7',
  chartFilled:'M3 3h2v14l6-7 4 3 6-8v16H3Z',
  briefcase:'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 7h18v14H3ZM3 11c5 4 13 4 18 0M10 12v3h4v-3',
  briefcaseFilled:'M8 2h8l2 4h4v16H2V6h4Zm1.2 4h5.6l-1-2h-3.6ZM3 11v2c5.4 3 12.6 3 18 0v-2c-5.4 3-12.6 3-18 0Z',
  more:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM7 12h.01M12 12h.01M17 12h.01',
  moreFilled:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM8 12a1.2 1.2 0 1 0-2.4 0 1.2 1.2 0 0 0 2.4 0Zm5.2 0a1.2 1.2 0 1 0-2.4 0 1.2 1.2 0 0 0 2.4 0Zm5.2 0a1.2 1.2 0 1 0-2.4 0 1.2 1.2 0 0 0 2.4 0Z',
  ellipsis:'M5 12h.01M12 12h.01M19 12h.01',
  refresh:'M20 7v5h-5M20 12a8 8 0 1 0-2 5',
  sliders:'M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10M11 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM17 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM11 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  star:'m12 2.5 3 6.1 6.7 1-4.9 4.8 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.8 6.7-1Z',
  starFilled:'m12 2.5 3 6.1 6.7 1-4.9 4.8 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.8 6.7-1Z',
  plus:'M12 4v16M4 12h16',close:'m6 6 12 12M6 18 18 6',
  pencil:'m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z',
  trash:'M4 6h16M9 3h6M6 6l1 15h10l1-15M10 10v7m4-7v7',
  bell:'M5 16h14l-2-3V9a5 5 0 0 0-10 0v4ZM10 20h4M12 2v2',
  eye:'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeSlash:'m3 3 18 18M9 6.4c1-.3 2-.4 3-.4 6 0 10 6 10 6a20 20 0 0 1-3 3.5M6 7.5A20 20 0 0 0 2 12s4 6 10 6c1.5 0 3-.4 4.2-1M10 10a3 3 0 0 0 4 4',
  exchange:'M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4',
  chevron:'m8 5 7 7-7 7',search:'M16.5 16.5 21 21M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
 };
 const get=name=>({path:paths[name]||paths.ellipsis,filled:name.endsWith('Filled')});
 const markup=name=>{const {path,filled}=get(name);return '<svg class="ui-icon" data-ui-icon="'+(paths[name]?name:'ellipsis')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+path+'" fill="'+(filled?'currentColor':'none')+'" fill-rule="evenodd" stroke="'+(filled?'none':'currentColor')+'" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
 return Object.freeze({get,markup});
})();
