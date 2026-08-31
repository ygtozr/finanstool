const { redis, normalizeEmail, validEmail, tokenHash, verifyPassword, getUserByEmail, createSession, sameOrigin, noStore, publicUser } = require('../lib/auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (!validEmail(email) || !password) return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  const ip = tokenHash(String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0]);
  const attemptKey = `login-attempt:${ip}`;
  try {
    const attempts = Number(await redis(['INCR', attemptKey]));
    if (attempts === 1) await redis(['EXPIRE', attemptKey, 600]);
    if (attempts > 10) return res.status(429).json({ error: 'Çok fazla deneme yapıldı. 10 dakika sonra tekrar deneyin.' });
    const user = await getUserByEmail(email);
    if (!user || user.status !== 'active' || !(await verifyPassword(password, user.passwordHash))) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return res.status(401).json({ error: 'E-posta veya şifre yanlış.' });
    }
    await redis(['DEL', attemptKey]);
    await createSession(user, res);
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error('auth-login error', error?.message || error);
    return res.status(500).json({ error: 'Giriş işlemi tamamlanamadı.' });
  }
};
