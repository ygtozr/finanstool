const { redis, getUserById, requireUser, noStore, publicUser } = require('../lib/auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const current = await requireUser(req, res, 'admin');
    if (!current) return;
    const ids = (await redis(['SMEMBERS', 'users'])) || [];
    const users = (await Promise.all(ids.map(getUserById))).filter(Boolean).map(publicUser).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return res.status(200).json({ users });
  } catch (error) {
    console.error('admin-users error', error?.message || error);
    return res.status(500).json({ error: 'Kullanıcılar alınamadı.' });
  }
};
