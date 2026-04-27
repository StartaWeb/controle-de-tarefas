/* ===================================================
   App — Inicialização e roteamento
   =================================================== */

const App = {
    currentPage: 'dashboard',

    init() {
        // ─── PASSO 1: Inicialização instantânea ──────────────────────────
        // Carrega dados do LocalStorage — zero delay, sem spinner.
        Data.initSync();

        // Renderizar e configurar o app imediatamente
        this.renderAll();
        this.setupNavigation();
        this.setupModal();
        this.startClock();

        document.getElementById('btn-new-task').addEventListener('click', () => {
            Tarefas.openForm();
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('main-content').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        const hash = window.location.hash.replace('#', '');
        if (hash && ['dashboard', 'tarefas', 'pessoas', 'setores', 'relatorios'].includes(hash)) {
            this.navigateTo(hash);
        }

        console.log('✅ StartWeb iniciado (dados locais).');

        // ─── PASSO 2: Sincronização Firebase em background ───────────────
        // Não bloqueia o app. Se Firebase responder, re-renderiza.
        this._syncFirebase();
    },

    // Sincroniza com Firebase em background sem bloquear a UI
    async _syncFirebase() {
        this._setFirebaseStatus('syncing');

        try {
            const updated = await Data.syncFromFirebase();

            if (updated) {
                // Re-renderiza com dados atualizados da nuvem
                this.renderAll();
                this._setFirebaseStatus('online');
                Utils.showToast('Firebase sincronizado! ☁️', 'success');
            } else if (Data._firebaseAvailable) {
                this._setFirebaseStatus('online');
            } else {
                this._setFirebaseStatus('offline');
                Utils.showToast('Sem acesso ao Firebase — usando dados locais.', 'warning');
            }
        } catch (err) {
            console.error('[App] Erro ao sincronizar Firebase:', err);
            this._setFirebaseStatus('offline');
        }
    },

    _setFirebaseStatus(status) {
        const dot = document.getElementById('connection-status');
        if (!dot) return;
        dot.className = 'connection-dot';
        if (status === 'online')   dot.classList.add('online');
        if (status === 'offline')  dot.classList.add('offline');
        if (status === 'syncing')  dot.classList.add('syncing');
        dot.title = {
            online:  'Firebase conectado',
            offline: 'Firebase indisponível — dados locais',
            syncing: 'Sincronizando com Firebase...'
        }[status] || '';
    },

    renderAll() {
        Dashboard.render();
        Tarefas.render();
        Pessoas.render();
        Setores.render();
        Relatorios.render();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) this.navigateTo(page);
            });
        });
    },

    navigateTo(pageName) {
        this.currentPage = pageName;
        window.location.hash = pageName;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) targetPage.classList.add('active');

        const titles = {
            dashboard: 'Dashboard',
            tarefas: 'Tarefas',
            pessoas: 'Colaboradores',
            setores: 'Setores',
            relatorios: 'Relatórios'
        };
        document.getElementById('topbar-title').textContent = titles[pageName] || pageName;

        switch (pageName) {
            case 'dashboard':  Dashboard.render();  break;
            case 'tarefas':    Tarefas.render();    break;
            case 'pessoas':    Pessoas.render();    break;
            case 'setores':    Setores.render();    break;
            case 'relatorios': Relatorios.render(); break;
        }

        document.getElementById('sidebar').classList.remove('open');
    },

    setupModal() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => Utils.closeModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Utils.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Utils.closeModal();
                document.getElementById('confirm-overlay').classList.remove('active');
            }
        });
    },

    startClock() {
        const update = () => {
            const now = new Date();
            const clockEl = document.getElementById('sidebar-clock');
            const dateEl  = document.getElementById('sidebar-date');

            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('pt-BR', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });
            }
        };
        update();
        setInterval(update, 1000);
    }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
