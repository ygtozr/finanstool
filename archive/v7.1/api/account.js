const routes = {
  config: require('../lib/account-routes/auth-config'),
  login: require('../lib/account-routes/auth-login'),
  session: require('../lib/account-routes/auth-session'),
  bootstrap: require('../lib/account-routes/auth-bootstrap'),
  register: require('../lib/account-routes/auth-register'),
  invite: require('../lib/account-routes/admin-invites'),
  users: require('../lib/account-routes/admin-users'),
  state: require('../lib/account-routes/user-state'),
};

module.exports = async function handler(req, res) {
  const action = String(req.query?.action || '').toLowerCase();
  const route = routes[action];
  if (!route) return res.status(404).json({ error: 'Hesap işlemi bulunamadı.' });
  return route(req, res);
};
