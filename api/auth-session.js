const { currentSession, deleteSession, sameOrigin, noStore, publicUser } = require('../lib/auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  try {
    if (req.method === 'GET') {
      const current = await currentSession(req);
      return res.status(200).json({ authenticated: Boolean(current), user: current ? publicUser(current.user) : null });
    }
    if (req.method === 'DELETE') {
      if (!sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
      await deleteSession(req, res);
      return res.status(200).json({ signedOut: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('auth-session error', error?.message || error);
    return res.status(500).json({ error: 'Oturum kontrol edilemedi.' });
  }
};
