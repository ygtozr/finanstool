function frontendApiFromPublishableKey(key) {
  try {
    const encoded = String(key || '').replace(/^pk_(?:test|live)_/, '');
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const host = Buffer.from(padded, 'base64').toString('utf8').replace(/\$$/, '');
    if (!/^[a-z0-9.-]+$/i.test(host) || !host.includes('.')) return '';
    return host;
  } catch {
    return '';
  }
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const frontendApi = frontendApiFromPublishableKey(publishableKey);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    configured: Boolean(publishableKey && frontendApi),
    publishableKey,
    frontendApi,
  });
};

