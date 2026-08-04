module.exports = async (req, res) => {
  try {
    const q = String(req.query.q || '').slice(0, 40);
    const advanced = String(req.query.advanced || '') === '1';
    const response = await fetch('https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(q), { headers: { 'User-Agent':'Mozilla/5.0' } });
    const data = await response.json();
    const limit = advanced ? 20 : 5;
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({
      quotes: (data.quotes || [])
        .filter(item => item.symbol && (item.shortname || item.longname))
        .slice(0, limit)
        .map(item => ({
          symbol: item.symbol,
          name: item.shortname || item.longname,
          exchange: item.exchDisp || item.exchange || '',
          type: item.quoteType || ''
        }))
    });
  } catch {
    res.status(502).json({ quotes: [] });
  }
};
