/* ===================================================
   App — Inicialização e roteamento
   =================================================== */

const App = {
    currentPage: 'dashboard',

    async init() {
        // Mostrar tela de carregamento
        this.showLoading('Conectando ao Firebase...');

        // Timeout geral de segurança: 10 segundos no máximo
        let firebaseOk = false;
        const safetyTimeout = new Promise(resolve => setTimeout(resolve, 10000));

        try {
            await Promise.race([Data.init(), safetyTimeout]);
            firebaseOk = Data._cache.tarefas !== null;
        } catch (err) {
            console.error('[App] Falha ao conectar com Firebase:', err);
        }

        if (!firebaseOk) {
            // Garantir que o cache tenha valores padrão
            Data._cache.setores = Data._cache.setores || Data.DEFAULT_SETORES;
            Data._cache.pessoas  = Data._cache.pessoas  || [];
            Data._cache.tarefas  = Data._cache.tarefas  || [];
        }
        // Esconder loading e mostrar app
        this.hideLoading();

        if (!firebaseOk) {
            setTimeout(() => Utils.showToast('Firebase indisponível — usando dados locais.', 'warning'), 400);
        } else {
            setTimeout(() => Utils.showToast('Firebase conectado! ☀️', 'success'), 400);
        }

        // Renderizar todas as páginas
        this.renderAll();

        // Setup navigation
        this.setupNavigation();

        // Setup modal close
        this.setupModal();

        // Setup clock
        this.startClock();

        // Setup new task button
        document.getElementById('btn-new-task').addEventListener('click', () => {
            Tarefas.openForm();
        });

        // Setup mobile menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Close sidebar on page click (mobile)
        document.getElementById('main-content').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Navigate based on hash
        const hash = window.location.hash.replace('#', '');
        if (hash && ['dashboard', 'tarefas', 'pessoas', 'setores', 'relatorios'].includes(hash)) {
            this.navigateTo(hash);
        }

        // Indicador de status de conexão
        this.setupConnectionStatus();

        console.log('✅ StartWeb iniciado com Firebase!');
    },

    showLoading(msg) {
        const el = document.getElementById('app-loading');
        const txt = document.getElementById('loading-msg');
        if (txt && msg) txt.textContent = msg;
        if (el) el.classList.add('active');
    },

    hideLoading() {
        const el = document.getElementById('app-loading');
        if (el) {
            el.classList.add('fade-out');
            setTimeout(() => el.remove(), 600);
        }
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

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update topbar title
        const titles = {
            dashboard: 'Dashboard',
            tarefas: 'Tarefas',
            pessoas: 'Colaboradores',
            setores: 'Setores',
            relatorios: 'Relatórios'
        };
        document.getElementById('topbar-title').textContent = titles[pageName] || pageName;

        // Re-render the page for fresh data
        switch (pageName) {
            case 'dashboard': Dashboard.render(); break;
            case 'tarefas': Tarefas.render(); break;
            case 'pessoas': Pessoas.render(); break;
            case 'setores': Setores.render(); break;
            case 'relatorios': Relatorios.render(); break;
        }

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
    },

    setupModal() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => Utils.closeModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Utils.closeModal();
        });

        // ESC to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Utils.closeModal();
                document.getElementById('confirm-overlay').classList.remove('active');
            }
        });
    },

    setupConnectionStatus() {
        const indicator = document.getElementById('connection-status');
        if (!indicator) return;

        const update = () => {
            if (navigator.onLine) {
                indicator.classList.remove('offline');
                indicator.classList.add('online');
                indicator.title = 'Conectado ao Firebase';
            } else {
                indicator.classList.remove('online');
                indicator.classList.add('offline');
                indicator.title = 'Sem conexão — dados salvos localmente';
                Utils.showToast('Sem conexão. Alterações salvas localmente.', 'warning');
            }
        };

        update();
        window.addEventListener('online', () => { update(); Utils.showToast('Conexão restabelecida! Sincronizando...', 'success'); });
        window.addEventListener('offline', update);
    },

    startClock() {
        const update = () => {
            const now = new Date();
            const clockEl = document.getElementById('sidebar-clock');
            const dateEl = document.getElementById('sidebar-date');

            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }
        };

        update();
        setInterval(update, 1000);
    }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
