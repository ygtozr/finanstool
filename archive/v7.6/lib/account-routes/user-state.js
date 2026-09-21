const { redis, encryptJson, decryptJson, requireUser, sameOrigin, noStore } = require('../auth-store');

const MAX_STATE_BYTES = 1024 * 1024;

function validState(state) {
  return Boolean(state && typeof state === 'object' && !Array.isArray(state)
    && Number.isInteger(Number(state.schemaVersion)) && state.data && typeof state.data === 'object'
    && Buffer.byteLength(JSON.stringify(state), 'utf8') <= MAX_STATE_BYTES);
}

module.exports = async function handler(req, res) {
  noStore(res);
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (req.method !== 'GET' && !sameOrigin(req)) return res.status(403).json({ error: 'Geçersiz istek kaynağı.' });
  try {
    const current = await requireUser(req, res);
    if (!current) return;
    const key = `user-state:${current.user.id}`;
    if (req.method === 'GET') {
      const encoded = await redis(['GET', key]);
      if (!encoded) return res.status(200).json({ exists: false, version: 0, state: null });
      const record = decryptJson(encoded);
      return res.status(200).json({ exists: true, state: record.state, version: record.version, updatedAt: record.updatedAt });
    }
    if (req.method === 'DELETE') {
      await redis(['DEL', key]);
      return res.status(200).json({ deleted: true });
    }
    const appState = req.body?.state;
    const expectedVersion = Number(req.body?.expectedVersion);
    if (!validState(appState)) return res.status(400).json({ error: 'Geçersiz uygulama verisi.' });
    if (!Number.isInteger(expectedVersion) || expectedVersion < 0) return res.status(400).json({ error: 'Geçersiz veri sürümü.' });
    const existing = await redis(['GET', key]);
    const currentRecord = existing ? decryptJson(existing) : null;
    const currentVersion = Number(currentRecord?.version || 0);
    if (currentVersion !== expectedVersion) return res.status(409).json({ error: 'Veri çakışması.', version: currentVersion, updatedAt: currentRecord?.updatedAt || null });
    const record = { state: appState, version: currentVersion + 1, updatedAt: new Date().toISOString() };
    await redis(['SET', key, encryptJson(record)]);
    return res.status(200).json({ saved: true, version: record.version, updatedAt: record.updatedAt });
  } catch (error) {
    console.error('user-state error', error?.message || error);
    return res.status(500).json({ error: 'Bulut verisi işlenemedi.' });
  }
};
