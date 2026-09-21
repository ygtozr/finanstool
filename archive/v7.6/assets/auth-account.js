(function () {
  const LAST_MODE_KEY = 'ozerFinansAuthMode';
  const ACTIVE_USER_KEY = 'ozerFinansActiveCloudUser';
  const GUEST_BACKUP_KEY = 'ozerFinansGuestBackup';
  const INTERNAL_PREFIX = 'ozerFinans';
  const gate = document.getElementById('authGate');
  const gateStatus = document.getElementById('authGateStatus');
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  const bootstrapForm = document.getElementById('authBootstrapForm');
  const localButton = document.getElementById('authLocalContinue');
  const backButton = document.getElementById('authBack');
  const setupButton = document.getElementById('authSetup');
  const accountTitle = document.getElementById('accountTitle');
  const accountDescription = document.getElementById('accountDescription');
  const accountAction = document.getElementById('accountAction');
  const accountSignOut = document.getElementById('accountSignOut');
  const cloudSyncStatus = document.getElementById('cloudSyncStatus');
  const adminUsersCard = document.getElementById('adminUsersCard');
  const adminUsersList = document.getElementById('adminUsersList');
  const createInviteButton = document.getElementById('createInvite');
  const inviteEmail = document.getElementById('inviteEmail');
  const inviteResult = document.getElementById('inviteResult');
  const inviteLink = document.getElementById('inviteLink');
  const copyInvite = document.getElementById('copyInvite');

  const state = {
    mode: 'pending', user: null, version: 0, applying: false, activating: null,
    syncTimer: null, syncInFlight: null, config: null,
  };

  function setGateStatus(message, isError) {
    gateStatus.textContent = message || '';
    gateStatus.classList.toggle('error', Boolean(isError));
  }

  function setSyncStatus(message, tone) {
    cloudSyncStatus.textContent = message || '';
    cloudSyncStatus.dataset.tone = tone || '';
  }

  async function api(path, options) {
    const response = await fetch(path, { cache: 'no-store', credentials: 'same-origin', ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || 'İşlem tamamlanamadı.');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  function jsonPost(path, body) {
    return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }

  function currentBackup() {
    if (typeof window.createBackup !== 'function') throw new Error('Uygulama verisi hazırlanamadı.');
    return window.createBackup();
  }

  function applyState(backup) {
    if (typeof window.normalizeBackup !== 'function' || typeof window.applyBackup !== 'function') throw new Error('Bulut verisi uygulanamadı.');
    state.applying = true;
    try { window.applyBackup(window.normalizeBackup(backup), 'replace'); }
    finally { setTimeout(() => { state.applying = false; }, 0); }
  }

  function guestSnapshot() {
    try { return JSON.parse(localStorage.getItem(GUEST_BACKUP_KEY) || 'null'); } catch { return null; }
  }

  function saveGuestSnapshot() {
    try { localStorage.setItem(GUEST_BACKUP_KEY, JSON.stringify(currentBackup())); } catch {}
  }

  function restoreGuestSnapshot() {
    const backup = guestSnapshot();
    if (backup) applyState(backup);
  }

  function blankAccountBackup() {
    const backup = JSON.parse(JSON.stringify(currentBackup()));
    const first = backup.data.portfolios?.[0] || { id: 'portfolio-main', name: 'Portföyüm', displayCurrency: 'USD' };
    backup.data.favorites = [];
    backup.data.portfolios = [{ ...first, positions: [], cashBalances: [] }];
    backup.data.activePortfolioId = first.id;
    backup.data.alarms = [];
    backup.exportedAt = new Date().toISOString();
    backup.appVersion = '7.1';
    return backup;
  }

  function showGate(view = 'login') {
    document.body.classList.add('auth-locked');
    gate.hidden = false;
    document.getElementById('appMain').setAttribute('inert', '');
    document.querySelector('.mobile-bottom-nav')?.setAttribute('inert', '');
    loginForm.hidden = view !== 'login';
    registerForm.hidden = view !== 'register';
    bootstrapForm.hidden = view !== 'bootstrap';
    backButton.hidden = view === 'login';
    setupButton.hidden = view !== 'login' || !state.config?.bootstrapAvailable;
    setGateStatus(view === 'register' ? 'Davet edilen e-posta ile hesabınızı oluşturun.' : view === 'bootstrap' ? 'Yalnız ilk yönetici hesabı için tek kullanımlık kurulum.' : 'E-posta ve şifrenizle giriş yapın.');
  }

  function showApp(mode) {
    state.mode = mode;
    document.body.classList.remove('auth-locked');
    gate.hidden = true;
    document.getElementById('appMain').removeAttribute('inert');
    document.querySelector('.mobile-bottom-nav')?.removeAttribute('inert');
    renderAccountCard();
  }

  async function cloudRequest(method, body) {
    return api('/api/account?action=state', {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async function syncNow({ force = false } = {}) {
    if (state.mode !== 'cloud' || !state.user || state.applying) return;
    if (state.syncInFlight && !force) return state.syncInFlight;
    clearTimeout(state.syncTimer);
    setSyncStatus('Buluta kaydediliyor…', 'pending');
    state.syncInFlight = (async () => {
      try {
        const result = await cloudRequest('PUT', { state: currentBackup(), expectedVersion: state.version });
        state.version = result.version;
        const savedAt = new Date(result.updatedAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSyncStatus(`Şifrelenerek kaydedildi • ${savedAt}`, 'success');
      } catch (error) {
        setSyncStatus(error.status === 409 ? 'Başka cihazda daha yeni veri var. Sayfayı yenileyin.' : 'Bulut kaydı tamamlanamadı; yerel kopya korundu.', 'error');
        throw error;
      } finally { state.syncInFlight = null; }
    })();
    return state.syncInFlight;
  }

  function scheduleSync() {
    if (state.mode !== 'cloud' || state.applying) return;
    clearTimeout(state.syncTimer);
    setSyncStatus('Değişiklik bekliyor…', 'pending');
    state.syncTimer = setTimeout(() => syncNow().catch(() => {}), 1400);
  }

  async function activateCloud(user) {
    if (!user?.id) return;
    if (state.activating) return state.activating;
    state.activating = (async () => {
      setGateStatus('Şifrelenmiş verileriniz hazırlanıyor…');
      const previousMode = localStorage.getItem(LAST_MODE_KEY);
      const previousUser = localStorage.getItem(ACTIVE_USER_KEY);
      if (previousMode !== 'cloud' || previousUser !== user.id) saveGuestSnapshot();
      state.user = user;
      const remote = await cloudRequest('GET');
      state.version = remote.version || 0;
      if (remote.exists && remote.state) applyState(remote.state);
      else {
        const importLocal = window.confirm('Bu cihazdaki mevcut favori, portföy ve ayarlar bu hesaba aktarılsın mı?');
        if (!importLocal) applyState(blankAccountBackup());
        const saved = await cloudRequest('PUT', { state: currentBackup(), expectedVersion: 0 });
        state.version = saved.version;
      }
      localStorage.setItem(LAST_MODE_KEY, 'cloud');
      localStorage.setItem(ACTIVE_USER_KEY, user.id);
      setSyncStatus('Upstash üzerinde şifreli eşitleme etkin.', 'success');
      showApp('cloud');
    })().catch(error => {
      setGateStatus(error.message || 'Hesap açılamadı. Yerel kullanımla devam edebilirsiniz.', true);
      showGate('login');
    }).finally(() => { state.activating = null; });
    return state.activating;
  }

  async function chooseLocal() {
    if (localStorage.getItem(LAST_MODE_KEY) === 'cloud') restoreGuestSnapshot();
    localStorage.setItem(LAST_MODE_KEY, 'local');
    localStorage.removeItem(ACTIVE_USER_KEY);
    state.user = null;
    state.version = 0;
    showApp('local');
  }

  async function loadAdminUsers() {
    if (state.user?.role !== 'admin') return;
    try {
      const payload = await api('/api/account?action=users');
      adminUsersList.innerHTML = '';
      payload.users.forEach(user => {
        const row = document.createElement('div');
        row.className = 'user-admin-row';
        const email = document.createElement('span');
        email.textContent = user.email;
        const role = document.createElement('span');
        role.textContent = user.role === 'admin' ? 'Yönetici' : 'Kullanıcı';
        row.append(email, role);
        adminUsersList.append(row);
      });
    } catch { adminUsersList.textContent = 'Kullanıcı listesi alınamadı.'; }
  }

  function renderAccountCard() {
    const cloud = state.mode === 'cloud' && state.user;
    if (cloud) {
      accountTitle.textContent = 'Bulut Hesabı';
      accountDescription.textContent = `${state.user.email} • Veriler bu hesaba bağlıdır.`;
      accountAction.hidden = true;
      accountSignOut.hidden = false;
      adminUsersCard.hidden = state.user.role !== 'admin';
      if (state.user.role === 'admin') loadAdminUsers();
    } else {
      accountTitle.textContent = 'Yerel Kullanım';
      accountDescription.textContent = 'Veriler yalnız bu cihazda saklanır. Hesap eşitlemesi kapalıdır.';
      accountAction.hidden = false;
      accountSignOut.hidden = true;
      adminUsersCard.hidden = true;
      setSyncStatus('Yerel mod • buluta veri gönderilmez.', 'local');
    }
  }

  async function signOut() {
    accountSignOut.disabled = true;
    try {
      await syncNow({ force: true }).catch(() => {});
      await api('/api/account?action=session', { method: 'DELETE' });
      restoreGuestSnapshot();
      localStorage.setItem(LAST_MODE_KEY, 'local');
      localStorage.removeItem(ACTIVE_USER_KEY);
      state.mode = 'pending'; state.user = null; state.version = 0;
      showGate('login');
      setGateStatus('Oturum kapatıldı.');
    } finally { accountSignOut.disabled = false; }
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setGateStatus('Giriş yapılıyor…');
    try {
      const payload = await jsonPost('/api/account?action=login', { email: document.getElementById('authEmail').value, password: document.getElementById('authPassword').value });
      await activateCloud(payload.user);
    } catch (error) { setGateStatus(error.message, true); }
    finally { submit.disabled = false; }
  });

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('registerPassword').value;
    if (password !== document.getElementById('registerPasswordConfirm').value) return setGateStatus('Şifreler aynı değil.', true);
    const submit = registerForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const code = new URLSearchParams(location.search).get('invite') || '';
      const payload = await jsonPost('/api/account?action=register', { inviteCode: code, email: document.getElementById('registerEmail').value, password });
      history.replaceState(null, '', location.pathname);
      await activateCloud(payload.user);
    } catch (error) { setGateStatus(error.message, true); }
    finally { submit.disabled = false; }
  });

  bootstrapForm.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('bootstrapPassword').value;
    if (password !== document.getElementById('bootstrapPasswordConfirm').value) return setGateStatus('Şifreler aynı değil.', true);
    const submit = bootstrapForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const payload = await jsonPost('/api/account?action=bootstrap', { setupCode: document.getElementById('bootstrapCode').value, email: document.getElementById('bootstrapEmail').value, password });
      await activateCloud(payload.user);
    } catch (error) { setGateStatus(error.message, true); }
    finally { submit.disabled = false; }
  });

  createInviteButton.addEventListener('click', async () => {
    createInviteButton.disabled = true;
    inviteResult.hidden = true;
    try {
      const payload = await jsonPost('/api/account?action=invite', { email: inviteEmail.value });
      inviteLink.href = payload.inviteUrl;
      inviteLink.textContent = payload.inviteUrl;
      inviteResult.hidden = false;
    } catch (error) { window.alert(error.message); }
    finally { createInviteButton.disabled = false; }
  });

  copyInvite.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(inviteLink.href); copyInvite.textContent = 'Kopyalandı'; }
    catch { window.prompt('Davet bağlantısını kopyalayın:', inviteLink.href); }
    setTimeout(() => { copyInvite.textContent = 'Bağlantıyı Kopyala'; }, 1500);
  });

  localButton.addEventListener('click', chooseLocal);
  backButton.addEventListener('click', () => showGate('login'));
  setupButton.addEventListener('click', () => showGate('bootstrap'));
  accountAction.addEventListener('click', () => showGate('login'));
  accountSignOut.addEventListener('click', signOut);
  window.addEventListener('ozer:local-data-change', event => {
    if (!String(event.detail?.key || '').startsWith(INTERNAL_PREFIX)) scheduleSync();
  });
  window.addEventListener('online', () => { if (state.mode === 'cloud') scheduleSync(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.mode === 'cloud') syncNow().catch(() => {}); });

  (async function boot() {
    document.body.classList.add('auth-locked');
    try {
      state.config = await api('/api/account?action=config');
      if (!state.config.configured) throw new Error('Üyelik veritabanı henüz yapılandırılmamış.');
      const session = await api('/api/account?action=session');
      if (session.authenticated) return activateCloud(session.user);
      const inviteCode = new URLSearchParams(location.search).get('invite');
      showGate(inviteCode ? 'register' : 'login');
    } catch (error) {
      showGate('login');
      setGateStatus(`${error.message} Yerel kullanım kullanılabilir.`, true);
    }
  })();
})();
