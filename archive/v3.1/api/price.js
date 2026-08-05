module.exports = async (req, res) => {
  const symbol = String(req.query.symbol || '').toUpperCase();
  if (!/^[A-Z0-9.^=-]{1,30}$/.test(symbol)) return res.status(400).json({ error: 'Geçersiz hisse kodu.' });
  const query = String(req.query.query || 'range=6mo&interval=1d');
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?' + query;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.status(response.status).send(await response.text());
  } catch { res.status(502).json({ error: 'Veri sağlayıcısına ulaşılamadı.' }); }
};
