const MAX_STATE_BYTES = 1024 * 1024;

let schemaReady;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || '';
}

async function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) throw new Error('Database is not configured');
  const { neon } = await import('@neondatabase/serverless');
  return neon(databaseUrl);
}

async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS user_app_states (
        user_id TEXT PRIMARY KEY,
        state JSONB NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.catch(error => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

function requestOrigin(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  if (!forwardedHost) return '';
  return `${forwardedProto}://${forwardedHost}`;
}

async function authenticatedUserId(req) {
  const authorization = String(req.headers.authorization || '');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token || !process.env.CLERK_SECRET_KEY) return '';
  const { verifyToken } = await import('@clerk/backend');
  const origin = requestOrigin(req);
  const verified = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    ...(origin ? { authorizedParties: [origin] } : {}),
  });
  return String(verified.sub || '');
}

function validState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  if (!Number.isInteger(Number(state.schemaVersion)) || !state.data || typeof state.data !== 'object') return false;
  return Buffer.byteLength(JSON.stringify(state), 'utf8') <= MAX_STATE_BYTES;
}

module.exports = async function handler(req, res) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');
  try {
    const userId = await authenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sql = await getSql();
    await ensureSchema(sql);

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT state, version, updated_at
        FROM user_app_states
        WHERE user_id = ${userId}
        LIMIT 1
      `;
      if (!rows.length) return res.status(200).json({ exists: false, version: 0, state: null });
      return res.status(200).json({ exists: true, state: rows[0].state, version: rows[0].version, updatedAt: rows[0].updated_at });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM user_app_states WHERE user_id = ${userId}`;
      return res.status(200).json({ deleted: true });
    }

    const state = req.body?.state;
    const expectedVersion = Number(req.body?.expectedVersion);
    if (!validState(state)) return res.status(400).json({ error: 'Invalid application state' });
    if (!Number.isInteger(expectedVersion) || expectedVersion < 0) return res.status(400).json({ error: 'Invalid state version' });

    const stateJson = JSON.stringify(state);
    const rows = await sql`
      INSERT INTO user_app_states (user_id, state, version, updated_at)
      VALUES (${userId}, ${stateJson}::jsonb, 1, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET state = EXCLUDED.state,
          version = user_app_states.version + 1,
          updated_at = NOW()
      WHERE user_app_states.version = ${expectedVersion}
      RETURNING version, updated_at
    `;

    if (!rows.length) {
      const current = await sql`SELECT version, updated_at FROM user_app_states WHERE user_id = ${userId} LIMIT 1`;
      return res.status(409).json({
        error: 'State conflict',
        version: current[0]?.version || 0,
        updatedAt: current[0]?.updated_at || null,
      });
    }

    return res.status(200).json({ saved: true, version: rows[0].version, updatedAt: rows[0].updated_at });
  } catch (error) {
    console.error('user-state error', error?.message || error);
    return res.status(500).json({ error: 'Cloud state request failed' });
  }
};

