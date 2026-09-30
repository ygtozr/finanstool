const crypto = require('node:crypto');
const { redis, decryptJson, normalizeEmail, validEmail, tokenHash, hashPassword, getUserByEmail, saveUser, createSession, sameOrigin, noStore, publicUser } = require('../auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
  try {
    const code = String(req.body?.inviteCode || '');
    const encoded = code ? await redis(['GET', `invite:${tokenHash(code)}`]) : null;
    if (!encoded) return res.status(400).json({ error: 'Davet bağlantısı geçersiz veya süresi dolmuş.' });
    const invite = decryptJson(encoded);
    const email = normalizeEmail(req.body?.email);
    if (!validEmail(email) || email !== normalizeEmail(invite.email)) return res.status(400).json({ error: 'Bu davet farklı bir e-posta için oluşturuldu.' });
    if (await getUserByEmail(email)) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });
    const user = {
      id: crypto.randomUUID(), email, passwordHash: await hashPassword(String(req.body?.password || '')),
      role: 'user', status: 'active', sessionVersion: 1, createdAt: new Date().toISOString(),
    };
    await saveUser(user);
    await redis(['DEL', `invite:${tokenHash(code)}`]);
    await createSession(user, res);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('auth-register error', error?.message || error);
    return res.status(400).json({ error: error?.message === 'Password must be 10-128 characters' ? 'Şifre en az 10 karakter olmalıdır.' : 'Kayıt tamamlanamadı.' });
  }
};
