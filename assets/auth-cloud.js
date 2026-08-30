(function () {
  const LAST_MODE_KEY = 'ozerFinansAuthMode';
  const ACTIVE_USER_KEY = 'ozerFinansActiveCloudUser';
  const GUEST_BACKUP_KEY = 'ozerFinansGuestBackup';
  const INTERNAL_PREFIX = 'ozerFinans';
  const gate = document.getElementById('authGate');
  const gateHome = document.getElementById('authGateHome');
  const gateStatus = document.getElementById('authGateStatus');
  const signInHost = document.getElementById('clerkSignIn');
  const signInButton = document.getElementById('authSignIn');
  const localButton = document.getElementById('authLocalContinue');
  const authBack = document.getElementById('authBack');
  const accountTitle = document.getElementById('accountTitle');
  const accountDescription = document.getElementById('accountDescription');
  const accountAction = document.getElementById('accountAction');
  const accountManage = document.getElementById('accountManage');
  const accountSignOut = document.getElementById('accountSignOut');
  const cloudSyncStatus = document.getElementById('cloudSyncStatus');

  const state = {
    clerk: null,
    mode: 'pending',
    userId: '',
    version: 0,
    applying: false,
    activating: null,
    syncTimer: null,
    syncInFlight: null,
    config: null,
  };

  function setGateStatus(message, isError) {
    gateStatus.textContent = message || '';
    gateStatus.classList.toggle('error', Boolean(isError));
  }

  function setSyncStatus(message, tone) {
    cloudSyncStatus.textContent = message || '';
    cloudSyncStatus.dataset.tone = tone || '';
  }

  function loadScript(src, attributes) {
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(item => item.src === src);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      Object.entries(attributes || {}).forEach(([key, value]) => script.setAttribute(key, value));
      script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', () => reject(new Error('Kimlik servisi yüklenemedi.')), { once: true });
      document.head.appendChild(script);
    });
  }

  function currentBackup() {
    if (typeof window.createBackup !== 'function') throw new Error('Uygulama verisi hazırlanamadı.');
    return window.createBackup();
  }

  function applyState(backup) {
    if (typeof window.normalizeBackup !== 'function' || typeof window.applyBackup !== 'function') throw new Error('Bulut verisi uygulanamadı.');
    state.applying = true;
    try {
      window.applyBackup(window.normalizeBackup(backup), 'replace');
    } finally {
      setTimeout(() => { state.applying = false; }, 0);
    }
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
    backup.appVersion = '7.1-preview';
    return backup;
  }

  async function token() {
    const session = state.clerk?.session;
    if (!session) throw new Error('Oturum bulunamadı.');
    const value = await session.getToken();
    if (!value) throw new Error('Oturum anahtarı alınamadı.');
    return value;
  }

  async function cloudRequest(method, body) {
    const response = await fetch('/api/user-state', {
      method,
      headers: {
        Authorization: `Bearer ${await token()}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || 'Bulut isteği tamamlanamadı.');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  function showApp(mode) {
    state.mode = mode;
    document.body.classList.remove('auth-locked');
    gate.hidden = true;
    document.getElementById('appMain').removeAttribute('inert');
    document.querySelector('.mobile-bottom-nav')?.removeAttribute('inert');
    renderAccountCard();
  }

  function showGate({ signIn = false } = {}) {
    document.body.classList.add('auth-locked');
    gate.hidden = false;
    document.getElementById('appMain').setAttribute('inert', '');
    document.querySelector('.mobile-bottom-nav')?.setAttribute('inert', '');
    gateHome.hidden = signIn;
    signInHost.hidden = !signIn;
    authBack.hidden = !signIn;
    if (signIn && state.clerk) {
      signInHost.innerHTML = '';
      state.clerk.mountSignIn(signInHost, {
        appearance: {
          variables: { colorPrimary: '#18a987', borderRadius: '0.75rem' },
        },
      });
    }
  }

  function renderAccountCard() {
    const cloud = state.mode === 'cloud' && state.clerk?.user;
    if (cloud) {
      const email = state.clerk.user.primaryEmailAddress?.emailAddress || 'Bulut hesabı';
      accountTitle.textContent = 'Bulut Hesabı';
      accountDescription.textContent = `${email} • Veriler bu hesaba bağlıdır.`;
      accountAction.hidden = true;
      accountManage.hidden = false;
      accountSignOut.hidden = false;
      if (!cloudSyncStatus.textContent) setSyncStatus('Bulut senkronizasyonu etkin.', 'success');
    } else {
      accountTitle.textContent = 'Yerel Kullanım';
      accountDescription.textContent = 'Veriler yalnız bu cihazda saklanır. Bulut eşitlemesi kapalıdır.';
      accountAction.hidden = false;
      accountManage.hidden = true;
      accountSignOut.hidden = true;
      setSyncStatus('Yerel mod • buluta veri gönderilmez.', 'local');
    }
  }

  async function syncNow({ force = false } = {}) {
    if (state.mode !== 'cloud' || !state.userId || state.applying) return;
    if (state.syncInFlight && !force) return state.syncInFlight;
    clearTimeout(state.syncTimer);
    setSyncStatus('Buluta kaydediliyor…', 'pending');
    state.syncInFlight = (async () => {
      try {
        const result = await cloudRequest('PUT', { state: currentBackup(), expectedVersion: state.version });
        state.version = result.version;
        const savedAt = new Date(result.updatedAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSyncStatus(`Buluta kaydedildi • ${savedAt}`, 'success');
      } catch (error) {
        if (error.status === 409) {
          setSyncStatus('Başka cihazda daha yeni veri var. Sayfayı yenileyerek eşitleyin.', 'error');
        } else {
          setSyncStatus(navigator.onLine ? 'Bulut kaydı tamamlanamadı; yerel kopya korundu.' : 'Çevrimdışı • değişiklikler cihazda korunuyor.', 'error');
        }
        throw error;
      } finally {
        state.syncInFlight = null;
      }
    })();
    return state.syncInFlight;
  }

  function scheduleSync() {
    if (state.mode !== 'cloud' || state.applying) return;
    clearTimeout(state.syncTimer);
    setSyncStatus('Değişiklik bekliyor…', 'pending');
    state.syncTimer = setTimeout(() => syncNow().catch(() => {}), 1400);
  }

  async function activateCloud() {
    const userId = state.clerk?.user?.id;
    if (!userId) return;
    if (state.activating) return state.activating;
    state.activating = (async () => {
      setGateStatus('Bulut verileriniz hazırlanıyor…');
      const previousMode = localStorage.getItem(LAST_MODE_KEY);
      const previousUser = localStorage.getItem(ACTIVE_USER_KEY);
      if (previousMode !== 'cloud' || previousUser !== userId) saveGuestSnapshot();

      state.userId = userId;
      const remote = await cloudRequest('GET');
      state.version = remote.version || 0;

      if (remote.exists && remote.state) {
        applyState(remote.state);
      } else {
        const importLocal = window.confirm('Bu cihazdaki mevcut favori, portföy ve ayarlar bu yeni bulut hesabına aktarılsın mı?');
        if (!importLocal) applyState(blankAccountBackup());
        const saved = await cloudRequest('PUT', { state: currentBackup(), expectedVersion: 0 });
        state.version = saved.version;
      }

      localStorage.setItem(LAST_MODE_KEY, 'cloud');
      localStorage.setItem(ACTIVE_USER_KEY, userId);
      setSyncStatus('Bulut verileri güncel.', 'success');
      showApp('cloud');
    })().catch(error => {
      setGateStatus(error.message || 'Bulut hesabı açılamadı. Yerel kullanımla devam edebilirsiniz.', true);
      showGate();
    }).finally(() => { state.activating = null; });
    return state.activating;
  }

  async function chooseLocal() {
    if (localStorage.getItem(LAST_MODE_KEY) === 'cloud') restoreGuestSnapshot();
    localStorage.setItem(LAST_MODE_KEY, 'local');
    localStorage.removeItem(ACTIVE_USER_KEY);
    state.userId = '';
    state.version = 0;
    showApp('local');
  }

  async function signOut() {
    accountSignOut.disabled = true;
    try {
      await syncNow({ force: true }).catch(() => {});
      await state.clerk?.signOut();
      restoreGuestSnapshot();
      localStorage.setItem(LAST_MODE_KEY, 'local');
      localStorage.removeItem(ACTIVE_USER_KEY);
      state.mode = 'pending';
      state.userId = '';
      state.version = 0;
      setGateStatus('Oturum kapatıldı.');
      showGate();
    } finally {
      accountSignOut.disabled = false;
    }
  }

  async function boot() {
    showGate();
    setGateStatus('Güvenli oturum kontrol ediliyor…');
    try {
      const configResponse = await fetch('/api/auth-config', { cache: 'no-store' });
      state.config = await configResponse.json();
      if (!state.config.configured) throw new Error('Clerk bağlantısı henüz yapılandırılmamış.');
      const base = `https://${state.config.frontendApi}`;
      await loadScript(`${base}/npm/@clerk/ui@1/dist/ui.browser.js`);
      await loadScript(`${base}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, { 'data-clerk-publishable-key': state.config.publishableKey });
      state.clerk = window.Clerk;
      await state.clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
      state.clerk.addListener(resources => {
        if (resources?.user && resources?.session) activateCloud();
      });
      if (state.clerk.isSignedIn) {
        await activateCloud();
      } else {
        setGateStatus('Hesabınızla giriş yapın veya yalnız bu cihazda devam edin.');
        showGate();
      }
    } catch (error) {
      setGateStatus(`${error.message || 'Üyelik servisine bağlanılamadı.'} Yerel kullanım kullanılabilir.`, true);
      localButton.disabled = false;
    }
  }

  signInButton.addEventListener('click', () => showGate({ signIn: true }));
  localButton.addEventListener('click', chooseLocal);
  authBack.addEventListener('click', () => showGate());
  accountAction.addEventListener('click', () => showGate({ signIn: true }));
  accountManage.addEventListener('click', () => state.clerk?.openUserProfile());
  accountSignOut.addEventListener('click', signOut);
  window.addEventListener('ozer:local-data-change', event => {
    const key = String(event.detail?.key || '');
    if (key.startsWith(INTERNAL_PREFIX)) return;
    scheduleSync();
  });
  window.addEventListener('online', () => { if (state.mode === 'cloud') scheduleSync(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'cloud') syncNow().catch(() => {});
  });

  boot();
})();
