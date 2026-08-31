const crypto = require('node:crypto');
const { redis, normalizeEmail, validEmail, tokenHash, hashPassword, saveUser, createSession, sameOrigin, noStore, publicUser } = require('../lib/auth-store');

function safeTokenEqual(input, expected) {
  const left = Buffer.from(tokenHash(input));
  const right = Buffer.from(tokenHash(expected));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
  try {
    if (Number(await redis(['SCARD', 'users'])) > 0) return res.status(409).json({ error: 'İlk yönetici hesabı daha önce oluşturuldu.' });
    const setupCode = String(process.env.AUTH_BOOTSTRAP_TOKEN || '');
    if (!setupCode || !safeTokenEqual(String(req.body?.setupCode || ''), setupCode)) return res.status(403).json({ error: 'Kurulum kodu geçersiz.' });
    const email = normalizeEmail(req.body?.email);
    if (!validEmail(email)) return res.status(400).json({ error: 'Geçerli bir e-posta yazın.' });
    const user = {
      id: crypto.randomUUID(), email, passwordHash: await hashPassword(String(req.body?.password || '')),
      role: 'admin', status: 'active', sessionVersion: 1, createdAt: new Date().toISOString(),
    };
    await saveUser(user);
    await createSession(user, res);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('auth-bootstrap error', error?.message || error);
    return res.status(400).json({ error: error?.message === 'Password must be 10-128 characters' ? 'Şifre en az 10 karakter olmalıdır.' : 'Yönetici hesabı oluşturulamadı.' });
  }
};
