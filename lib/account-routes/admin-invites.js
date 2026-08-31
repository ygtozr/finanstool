const crypto = require('node:crypto');
const { redis, encryptJson, normalizeEmail, validEmail, tokenHash, getUserByEmail, requireUser, sameOrigin, noStore } = require('../auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
  try {
    const current = await requireUser(req, res, 'admin');
    if (!current) return;
    const email = normalizeEmail(req.body?.email);
    if (!validEmail(email)) return res.status(400).json({ error: 'Geçerli bir e-posta yazın.' });
    if (await getUserByEmail(email)) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });
    const code = crypto.randomBytes(24).toString('base64url');
    const invite = { email, createdBy: current.user.id, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() };
    await redis(['SET', `invite:${tokenHash(code)}`, encryptJson(invite), 'EX', 86400]);
    const origin = String(req.headers.origin || `https://${req.headers.host}`);
    return res.status(201).json({ email, expiresAt: invite.expiresAt, inviteUrl: `${origin}/?invite=${encodeURIComponent(code)}` });
  } catch (error) {
    console.error('admin-invites error', error?.message || error);
    return res.status(500).json({ error: 'Davet oluşturulamadı.' });
  }
};
