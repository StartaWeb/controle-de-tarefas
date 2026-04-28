/* ===================================================
   App — Inicialização e roteamento
   =================================================== */

const App = {
    currentPage: 'dashboard',
    currentUser: null,
    userProfile: null,

    async init() {
        // Aguarda autenticação
        this.currentUser = await authReady;
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Busca o perfil do usuário
        try {
            const doc = await db.collection('usuarios').doc(this.currentUser.uid).get();
            if (doc.exists) {
                this.userProfile = doc.data();
                if (this.userProfile.perfil !== 'admin') {
                    alert('DEBUG: Documento encontrado, mas o perfil está como: ' + this.userProfile.perfil);
                }
            } else {
                alert('DEBUG: O Firebase procurou o documento com o UID [' + this.currentUser.uid + '] mas não encontrou nada na coleção usuarios!');
                this.userProfile = { perfil: 'colaborador' }; // Fallback
            }
        } catch (e) {
            console.error('Erro ao buscar perfil:', e);
            alert('Aviso: Erro de Permissão no Banco de Dados!\n\nSeu banco está bloqueando a leitura do perfil. Atualize as Regras do Firestore.\nDetalhe: ' + e.message);
            this.userProfile = { perfil: 'colaborador' };
        }

        // Aplica permissões na UI
        this.applyPermissions();

        // Passo 1: Iniciar dados do LocalStorage (instantâneo)
        Data.init();

        // Renderizar e configurar tudo imediatamente
        this.renderAll();
        this.setupNavigation();
        this.setupModal();
        this.startClock();

        document.getElementById('btn-new-task').addEventListener('click', () => Tarefas.openForm());
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        document.getElementById('main-content').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });
        
        // Logout
        document.getElementById('nav-logout').addEventListener('click', async (e) => {
            e.preventDefault();
            await auth.signOut();
            window.location.href = 'login.html';
        });

        const hash = window.location.hash.replace('#', '');
        if (this.userProfile.perfil === 'colaborador') {
            this.navigateTo('tarefas');
        } else if (hash && ['dashboard', 'tarefas', 'pessoas', 'setores', 'relatorios'].includes(hash)) {
            this.navigateTo(hash);
        } else {
            this.navigateTo('dashboard');
        }

        console.log(`✅ StartWeb logado como ${this.userProfile.perfil} (LocalStorage).`);

        // Passo 2: Sincronizar Firebase em background (sem bloquear a UI)
        this._syncFirebase();
    },

    applyPermissions() {
        if (this.userProfile.perfil === 'colaborador') {
            document.getElementById('nav-dashboard').style.display = 'none';
            document.getElementById('nav-pessoas').style.display = 'none';
            document.getElementById('nav-setores').style.display = 'none';
            document.getElementById('nav-relatorios').style.display = 'none';
        }
    },

    async _syncFirebase() {
        this._setFirebaseStatus('syncing');
        try {
            const updated = await Data.syncFirebase();
            if (Data._firebaseAvailable) {
                this._setFirebaseStatus('online');
                if (updated) {
                    this.renderAll(); // atualizar UI com dados da nuvem
                    Utils.showToast('Dados sincronizados com Firebase! ☁️', 'success');
                }
            } else {
                this._setFirebaseStatus('offline');
            }
        } catch (err) {
            console.error('[App] Erro Firebase:', err);
            this._setFirebaseStatus('offline');
        }
    },

    _setFirebaseStatus(status) {
        const dot = document.getElementById('connection-status');
        if (!dot) return;
        dot.className = 'connection-dot';
        if (status === 'online')  dot.classList.add('online');
        if (status === 'offline') dot.classList.add('offline');
        if (status === 'syncing') dot.classList.add('syncing');
        dot.title = { online: 'Firebase conectado ✅', offline: 'Firebase indisponível — dados locais', syncing: 'Sincronizando...' }[status] || '';
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
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) targetPage.classList.add('active');

        const titles = { dashboard: 'Dashboard', tarefas: 'Tarefas', pessoas: 'Colaboradores', setores: 'Setores', relatorios: 'Relatórios' };
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
        overlay.addEventListener('click', (e) => { if (e.target === overlay) Utils.closeModal(); });
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
            if (clockEl) clockEl.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (dateEl)  dateEl.textContent  = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        };
        update();
        setInterval(update, 1000);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
