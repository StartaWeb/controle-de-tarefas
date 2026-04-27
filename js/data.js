/* ===================================================
   Data — Gerenciamento de dados com Firebase Firestore
   Cache em memória para operações síncronas,
   sincronização assíncrona com a nuvem.
   =================================================== */

const Data = {
    // Nomes dos documentos no Firestore
    KEYS: {
        SETORES: 'setores',
        PESSOAS: 'pessoas',
        TAREFAS: 'tarefas'
    },

    // Chaves legadas do LocalStorage (para migração)
    LS_KEYS: {
        SETORES: 'startweb_setores',
        PESSOAS: 'startweb_pessoas',
        TAREFAS: 'startweb_tarefas'
    },

    // Cache em memória — permite que todos os métodos permaneçam síncronos
    _cache: {
        setores: null,
        pessoas: null,
        tarefas: null
    },

    // Indica se o Firebase está acessível
    _firebaseAvailable: false,

    // Setores padrão
    DEFAULT_SETORES: [
        { id: 'setor_rh', nome: 'RH', cor: '#f472b6', icone: '👥' },
        { id: 'setor_financeiro', nome: 'Financeiro', cor: '#34d399', icone: '💰' },
        { id: 'setor_administrativo', nome: 'Administrativo', cor: '#60a5fa', icone: '🏢' },
        { id: 'setor_operacional', nome: 'Operacional', cor: '#fbbf24', icone: '⚙️' },
        { id: 'setor_comercial', nome: 'Comercial', cor: '#a78bfa', icone: '📊' }
    ],

    /**
     * Inicializa os dados: carrega do Firestore.
     * Se o Firestore estiver vazio, migra dados do LocalStorage.
     * Deve ser chamado com await antes de renderizar qualquer página.
     */
    /**
     * PASSO 1 — Inicialização instantânea a partir do LocalStorage.
     * Síncrona, zero delay. O app fica pronto imediatamente.
     */
    initSync() {
        this._cache.setores = this._readLocalStorage(this.LS_KEYS.SETORES) || this.DEFAULT_SETORES;
        this._cache.pessoas  = this._readLocalStorage(this.LS_KEYS.PESSOAS)  || [];
        this._cache.tarefas  = this._readLocalStorage(this.LS_KEYS.TAREFAS)  || [];
        console.log('[Data] Cache iniciado a partir do LocalStorage.');
    },

    /**
     * PASSO 2 — Sincronização assíncrona com o Firebase (rodando em background).
     * Se o Firebase responder, atualiza o cache e retorna true.
     * Se não responder (timeout/erro), mantém dados locais e retorna false.
     */
    async syncFromFirebase() {
        const [cloudSetores, cloudPessoas, cloudTarefas] = await Promise.all([
            DB.load(this.KEYS.SETORES),
            DB.load(this.KEYS.PESSOAS),
            DB.load(this.KEYS.TAREFAS)
        ]);

        const firebaseOk = cloudSetores !== null || cloudPessoas !== null || cloudTarefas !== null;
        this._firebaseAvailable = firebaseOk;

        if (!firebaseOk) {
            console.warn('[Firebase] Indisponível — mantendo dados locais.');
            return false;
        }

        // Atualizar cache com dados da nuvem
        let updated = false;
        if (cloudSetores !== null) { this._cache.setores = cloudSetores; updated = true; }
        if (cloudPessoas  !== null) { this._cache.pessoas  = cloudPessoas;  updated = true; }
        if (cloudTarefas  !== null) { this._cache.tarefas  = cloudTarefas;  updated = true; }

        // Se era a primeira vez (sem dados locais), salvar defaults no Firestore
        if (cloudSetores === null) await DB.save(this.KEYS.SETORES, this._cache.setores);
        if (cloudPessoas  === null) await DB.save(this.KEYS.PESSOAS,  this._cache.pessoas);
        if (cloudTarefas  === null) await DB.save(this.KEYS.TAREFAS,  this._cache.tarefas);

        console.log('✅ Firebase sincronizado!');
        return updated;
    },

    /**
     * Inicialização completa (compatibilidade retroativa).
     * Chama initSync + syncFromFirebase em sequência.
     */
    async init() {
        this.initSync();
        return this.syncFromFirebase();
    },

    /**
     * Lê e parseia um item do LocalStorage com segurança.
     */
    _readLocalStorage(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    /**
     * Sincroniza uma coleção com o Firestore em background (fire-and-forget).
     * Só sincroniza se o Firebase estiver disponível.
     */
    _sync(key, items) {
        if (!this._firebaseAvailable) return; // offline, não tenta
        DB.save(key, items).catch(err =>
            console.error(`[Firebase] Falha ao sincronizar "${key}":`, err)
        );
    },

    // ===== SETORES =====

    getSetores() {
        return this._cache.setores || this.DEFAULT_SETORES;
    },

    saveSetores(setores) {
        this._cache.setores = setores;
        this._sync(this.KEYS.SETORES, setores);
    },

    getSetorById(id) {
        return this.getSetores().find(s => s.id === id);
    },

    addSetor(setor) {
        const setores = this.getSetores();
        setor.id = Utils.generateId();
        setores.push(setor);
        this.saveSetores(setores);
        return setor;
    },

    updateSetor(id, updates) {
        const setores = this.getSetores();
        const idx = setores.findIndex(s => s.id === id);
        if (idx !== -1) {
            setores[idx] = { ...setores[idx], ...updates };
            this.saveSetores(setores);
            return setores[idx];
        }
        return null;
    },

    deleteSetor(id) {
        const setores = this.getSetores().filter(s => s.id !== id);
        this.saveSetores(setores);
        // Remover referência nas pessoas e tarefas
        const pessoas = this.getPessoas().map(p => p.setor === id ? { ...p, setor: '' } : p);
        this.savePessoas(pessoas);
        const tarefas = this.getTarefas().map(t => t.setor === id ? { ...t, setor: '' } : t);
        this.saveTarefas(tarefas);
    },

    // ===== PESSOAS =====

    getPessoas() {
        return this._cache.pessoas || [];
    },

    savePessoas(pessoas) {
        this._cache.pessoas = pessoas;
        this._sync(this.KEYS.PESSOAS, pessoas);
    },

    getPessoaById(id) {
        return this.getPessoas().find(p => p.id === id);
    },

    addPessoa(pessoa) {
        const pessoas = this.getPessoas();
        pessoa.id = Utils.generateId();
        pessoa.criadoEm = new Date().toISOString();
        pessoas.push(pessoa);
        this.savePessoas(pessoas);
        return pessoa;
    },

    updatePessoa(id, updates) {
        const pessoas = this.getPessoas();
        const idx = pessoas.findIndex(p => p.id === id);
        if (idx !== -1) {
            pessoas[idx] = { ...pessoas[idx], ...updates };
            this.savePessoas(pessoas);
            return pessoas[idx];
        }
        return null;
    },

    deletePessoa(id) {
        const pessoas = this.getPessoas().filter(p => p.id !== id);
        this.savePessoas(pessoas);
        // Remover referência nas tarefas
        const tarefas = this.getTarefas().map(t => t.responsavel === id ? { ...t, responsavel: '' } : t);
        this.saveTarefas(tarefas);
    },

    getPessoasBySetor(setorId) {
        return this.getPessoas().filter(p => p.setor === setorId);
    },

    // ===== TAREFAS =====

    getTarefas() {
        return this._cache.tarefas || [];
    },

    saveTarefas(tarefas) {
        this._cache.tarefas = tarefas;
        this._sync(this.KEYS.TAREFAS, tarefas);
    },

    getTarefaById(id) {
        return this.getTarefas().find(t => t.id === id);
    },

    addTarefa(tarefa) {
        const tarefas = this.getTarefas();
        tarefa.id = Utils.generateId();
        tarefa.criadoEm = new Date().toISOString();
        tarefa.concluidaEm = null;
        if (!tarefa.status) tarefa.status = 'pendente';
        tarefas.push(tarefa);
        this.saveTarefas(tarefas);
        return tarefa;
    },

    updateTarefa(id, updates) {
        const tarefas = this.getTarefas();
        const idx = tarefas.findIndex(t => t.id === id);
        if (idx !== -1) {
            if (updates.status === 'concluida' && tarefas[idx].status !== 'concluida') {
                updates.concluidaEm = new Date().toISOString();
            }
            if (updates.status && updates.status !== 'concluida') {
                updates.concluidaEm = null;
            }
            tarefas[idx] = { ...tarefas[idx], ...updates };
            this.saveTarefas(tarefas);
            return tarefas[idx];
        }
        return null;
    },

    deleteTarefa(id) {
        const tarefas = this.getTarefas().filter(t => t.id !== id);
        this.saveTarefas(tarefas);
    },

    getTarefasByPessoa(pessoaId) {
        return this.getTarefas().filter(t => t.responsavel === pessoaId);
    },

    getTarefasBySetor(setorId) {
        return this.getTarefas().filter(t => t.setor === setorId);
    },

    // ===== ESTATÍSTICAS =====

    getStats() {
        const tarefas = this.getTarefas();
        const today = Utils.today();
        let total = tarefas.length;
        let concluidas = 0;
        let atrasadas = 0;
        let emDia = 0;
        let pendentes = 0;
        let emAndamento = 0;
        let proximasDoVencimento = 0;

        tarefas.forEach(t => {
            if (t.status === 'concluida') {
                concluidas++;
                return;
            }

            const daysLeft = Utils.daysDiff(today, t.prazo);

            if (daysLeft < 0) {
                atrasadas++;
            } else if (daysLeft <= 3) {
                proximasDoVencimento++;
                if (t.status === 'em_andamento') emAndamento++;
                else pendentes++;
                emDia++;
            } else {
                emDia++;
                if (t.status === 'em_andamento') emAndamento++;
                else pendentes++;
            }
        });

        return {
            total,
            concluidas,
            atrasadas,
            emDia,
            pendentes,
            emAndamento,
            proximasDoVencimento,
            percentConcluida: total > 0 ? Math.round((concluidas / total) * 100) : 0
        };
    },

    getStatsBySetor() {
        const setores = this.getSetores();
        const tarefas = this.getTarefas();
        const today = Utils.today();

        return setores.map(setor => {
            const setorTarefas = tarefas.filter(t => t.setor === setor.id);
            const total = setorTarefas.length;
            const concluidas = setorTarefas.filter(t => t.status === 'concluida').length;
            const atrasadas = setorTarefas.filter(t => {
                if (t.status === 'concluida') return false;
                return Utils.daysDiff(today, t.prazo) < 0;
            }).length;

            return {
                ...setor,
                total,
                concluidas,
                atrasadas,
                emDia: total - concluidas - atrasadas,
                percentConcluida: total > 0 ? Math.round((concluidas / total) * 100) : 0,
                pessoasCount: this.getPessoasBySetor(setor.id).length
            };
        });
    },

    getStatsByPessoa(pessoaId) {
        const tarefas = this.getTarefasByPessoa(pessoaId);
        const today = Utils.today();
        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.status === 'concluida').length;
        const atrasadas = tarefas.filter(t => {
            if (t.status === 'concluida') return false;
            return Utils.daysDiff(today, t.prazo) < 0;
        }).length;

        return {
            total,
            concluidas,
            atrasadas,
            ativas: total - concluidas
        };
    },

    /**
     * Retorna alertas (tarefas atrasadas e próximas do vencimento)
     */
    getAlerts() {
        const tarefas = this.getTarefas();
        const today = Utils.today();
        const alerts = [];

        tarefas.forEach(t => {
            if (t.status === 'concluida') return;

            const daysLeft = Utils.daysDiff(today, t.prazo);
            const pessoa = this.getPessoaById(t.responsavel);
            const setor = this.getSetorById(t.setor);

            if (daysLeft < 0) {
                alerts.push({
                    type: 'danger',
                    title: t.titulo,
                    subtitle: `${pessoa ? pessoa.nome : 'Sem responsável'} • ${setor ? setor.nome : 'Sem setor'}`,
                    time: `${Math.abs(daysLeft)} dia(s) atrasada`,
                    daysLeft,
                    taskId: t.id
                });
            } else if (daysLeft <= 3) {
                alerts.push({
                    type: 'warning',
                    title: t.titulo,
                    subtitle: `${pessoa ? pessoa.nome : 'Sem responsável'} • ${setor ? setor.nome : 'Sem setor'}`,
                    time: daysLeft === 0 ? 'Vence hoje' : `Vence em ${daysLeft} dia(s)`,
                    daysLeft,
                    taskId: t.id
                });
            }
        });

        // Ordenar: mais urgentes primeiro
        alerts.sort((a, b) => a.daysLeft - b.daysLeft);
        return alerts;
    }
};
