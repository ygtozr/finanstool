const { redis, noStore } = require('../auth-store');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const hasRedisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const hasRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  const configured = Boolean(hasRedisUrl && hasRedisToken && process.env.DATA_ENCRYPTION_KEY);
  if (!configured) return res.status(200).json({ configured: false, hasUsers: false, bootstrapAvailable: false });
  try {
    const hasUsers = Number(await redis(['SCARD', 'users'])) > 0;
    return res.status(200).json({ configured: true, hasUsers, bootstrapAvailable: !hasUsers && Boolean(process.env.AUTH_BOOTSTRAP_TOKEN) });
  } catch (error) {
    console.error('auth-config error', error?.message || error);
    return res.status(500).json({ configured: false, hasUsers: false, bootstrapAvailable: false });
  }
};
