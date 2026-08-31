const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SESSION_COOKIE = 'ozer_finans_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;

function redisConfig() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || '');
  if (!url || !token) throw new Error('Upstash is not configured');
  return { url, token };
}

async function redis(command) {
  const { url, token } = redisConfig();
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error || 'Upstash request failed');
  return payload.result;
}

function encryptionKey() {
  const secret = String(process.env.DATA_ENCRYPTION_KEY || '');
  if (secret.length < 32) throw new Error('Encryption key is not configured');
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
}

function decryptJson(value) {
  const [version, iv, tag, encrypted] = String(value || '').split('.');
  if (version !== 'v1' || !iv || !tag || !encrypted) throw new Error('Encrypted record is invalid');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  const plain = Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]);
  return JSON.parse(plain.toString('utf8'));
}

function normalizeEmail(value) {
  return String(value || '').trim().toLocaleLowerCase('en-US');
}

function validEmail(value) {
  const email = normalizeEmail(value);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function emailHash(email) {
  return crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) throw new Error('Password must be 10-128 characters');
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 128 * 1024 * 1024 });
  return `scrypt$32768$8$3$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}

async function verifyPassword(password, encoded) {
  try {
    const [algorithm, n, r, p, salt, expected] = String(encoded || '').split('$');
    if (algorithm !== 'scrypt') return false;
    const derived = await scrypt(password, Buffer.from(salt, 'base64url'), 64, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 128 * 1024 * 1024,
    });
    const expectedBuffer = Buffer.from(expected, 'base64url');
    return expectedBuffer.length === derived.length && crypto.timingSafeEqual(expectedBuffer, Buffer.from(derived));
  } catch {
    return false;
  }
}

async function getUserById(id) {
  const record = await redis(['GET', `user:${id}`]);
  return record ? decryptJson(record) : null;
}

async function getUserByEmail(email) {
  const id = await redis(['GET', `user-email:${emailHash(email)}`]);
  return id ? getUserById(id) : null;
}

async function saveUser(user) {
  await redis(['SET', `user:${user.id}`, encryptJson(user)]);
  await redis(['SET', `user-email:${emailHash(user.email)}`, user.id]);
  await redis(['SADD', 'users', user.id]);
}

function cookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((result, part) => {
    const index = part.indexOf('=');
    if (index > 0) result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return result;
  }, {});
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

async function createSession(user, res) {
  const token = crypto.randomBytes(32).toString('base64url');
  const session = { userId: user.id, sessionVersion: user.sessionVersion || 1, createdAt: new Date().toISOString() };
  await redis(['SET', `session:${tokenHash(token)}`, encryptJson(session), 'EX', SESSION_SECONDS]);
  setSessionCookie(res, token);
  return session;
}

async function currentSession(req) {
  const token = cookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const encoded = await redis(['GET', `session:${tokenHash(token)}`]);
  if (!encoded) return null;
  const session = decryptJson(encoded);
  const user = await getUserById(session.userId);
  if (!user || user.status !== 'active' || Number(user.sessionVersion || 1) !== Number(session.sessionVersion || 1)) return null;
  return { token, session, user };
}

async function requireUser(req, res, role) {
  const current = await currentSession(req);
  if (!current) {
    res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });
    return null;
  }
  if (role && current.user.role !== role) {
    res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    return null;
  }
  return current;
}

async function deleteSession(req, res) {
  const token = cookies(req)[SESSION_COOKIE];
  if (token) await redis(['DEL', `session:${tokenHash(token)}`]);
  clearSessionCookie(res);
}

function sameOrigin(req) {
  const origin = String(req.headers.origin || '');
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, status: user.status, createdAt: user.createdAt };
}

module.exports = {
  redis, encryptJson, decryptJson, normalizeEmail, validEmail, emailHash, tokenHash,
  hashPassword, verifyPassword, getUserById, getUserByEmail, saveUser, createSession,
  currentSession, requireUser, deleteSession, sameOrigin, noStore, publicUser,
};
