/* ===================================================
   Data — LocalStorage (cache imediato) + Firebase Firestore (sync em background)
   =================================================== */

const Data = {
    KEYS: {
        SETORES: 'setores',
        PESSOAS: 'pessoas',
        TAREFAS: 'tarefas'
    },

    LS_KEYS: {
        SETORES: 'startweb_setores',
        PESSOAS: 'startweb_pessoas',
        TAREFAS: 'startweb_tarefas'
    },

    _firebaseAvailable: false,

    DEFAULT_SETORES: [
        { id: 'setor_rh', nome: 'RH', cor: '#f472b6', icone: '👥' },
        { id: 'setor_financeiro', nome: 'Financeiro', cor: '#34d399', icone: '💰' },
        { id: 'setor_administrativo', nome: 'Administrativo', cor: '#60a5fa', icone: '🏢' },
        { id: 'setor_operacional', nome: 'Operacional', cor: '#fbbf24', icone: '⚙️' },
        { id: 'setor_comercial', nome: 'Comercial', cor: '#a78bfa', icone: '📊' }
    ],

    // ─── Inicialização síncrona (LocalStorage) ────────────────────────────
    init() {
        if (!localStorage.getItem(this.LS_KEYS.SETORES)) {
            this._saveLS(this.LS_KEYS.SETORES, this.DEFAULT_SETORES);
        }
        if (!localStorage.getItem(this.LS_KEYS.PESSOAS)) {
            this._saveLS(this.LS_KEYS.PESSOAS, []);
        }
        if (!localStorage.getItem(this.LS_KEYS.TAREFAS)) {
            this._saveLS(this.LS_KEYS.TAREFAS, []);
        }
    },

    // ─── Sync Firebase em background ─────────────────────────────────────
    async syncFirebase() {
        try {
            const [cloudSetores, cloudPessoas, cloudTarefas] = await Promise.all([
                DB.load(this.KEYS.SETORES),
                DB.load(this.KEYS.PESSOAS),
                DB.load(this.KEYS.TAREFAS)
            ]);

            const firebaseOk = cloudSetores !== null || cloudPessoas !== null || cloudTarefas !== null;
            this._firebaseAvailable = firebaseOk;

            if (!firebaseOk) {
                console.warn('[Firebase] Indisponível — usando LocalStorage.');
                return false;
            }

            let updated = false;

            // Dados na nuvem têm prioridade. Se vazio, migrar do localStorage.
            if (cloudSetores !== null && cloudSetores.length > 0) {
                this._saveLS(this.LS_KEYS.SETORES, cloudSetores);
                updated = true;
            } else if (cloudSetores !== null && cloudSetores.length === 0) {
                // Nuvem vazia → migrar dados locais para o Firestore
                await DB.save(this.KEYS.SETORES, this.getSetores());
            }

            if (cloudPessoas !== null && cloudPessoas.length > 0) {
                this._saveLS(this.LS_KEYS.PESSOAS, cloudPessoas);
                updated = true;
            } else if (cloudPessoas !== null && cloudPessoas.length === 0) {
                await DB.save(this.KEYS.PESSOAS, this.getPessoas());
            }

            if (cloudTarefas !== null && cloudTarefas.length > 0) {
                this._saveLS(this.LS_KEYS.TAREFAS, cloudTarefas);
                updated = true;
            } else if (cloudTarefas !== null && cloudTarefas.length === 0) {
                await DB.save(this.KEYS.TAREFAS, this.getTarefas());
            }

            console.log('✅ Firebase sincronizado!');
            return updated;
        } catch (err) {
            console.error('[Firebase] Erro no sync:', err);
            return false;
        }
    },

    // ─── Helpers internos ────────────────────────────────────────────────
    _readLS(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch {
            return fallback;
        }
    },

    _saveLS(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    _syncCloud(key, lsKey, items) {
        this._saveLS(lsKey, items);
        if (this._firebaseAvailable) {
            DB.save(key, items).catch(err =>
                console.error(`[Firebase] Falha ao salvar "${key}":`, err)
            );
        }
    },

    // ===== SETORES =====
    getSetores() {
        return this._readLS(this.LS_KEYS.SETORES, this.DEFAULT_SETORES);
    },
    saveSetores(setores) {
        this._syncCloud(this.KEYS.SETORES, this.LS_KEYS.SETORES, setores);
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
        this.saveSetores(this.getSetores().filter(s => s.id !== id));
        this.savePessoas(this.getPessoas().map(p => p.setor === id ? { ...p, setor: '' } : p));
        this.saveTarefas(this.getTarefas().map(t => t.setor === id ? { ...t, setor: '' } : t));
    },

    // ===== PESSOAS =====
    getPessoas() {
        return this._readLS(this.LS_KEYS.PESSOAS, []);
    },
    savePessoas(pessoas) {
        this._syncCloud(this.KEYS.PESSOAS, this.LS_KEYS.PESSOAS, pessoas);
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
        this.savePessoas(this.getPessoas().filter(p => p.id !== id));
        this.saveTarefas(this.getTarefas().map(t => t.responsavel === id ? { ...t, responsavel: '' } : t));
    },
    getPessoasBySetor(setorId) {
        return this.getPessoas().filter(p => p.setor === setorId);
    },

    // ===== TAREFAS =====
    getTarefas() {
        return this._readLS(this.LS_KEYS.TAREFAS, []);
    },
    saveTarefas(tarefas) {
        this._syncCloud(this.KEYS.TAREFAS, this.LS_KEYS.TAREFAS, tarefas);
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
        this.saveTarefas(this.getTarefas().filter(t => t.id !== id));
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
        let total = tarefas.length, concluidas = 0, atrasadas = 0, emDia = 0;
        let pendentes = 0, emAndamento = 0, proximasDoVencimento = 0;

        tarefas.forEach(t => {
            if (t.status === 'concluida') { concluidas++; return; }
            const d = Utils.daysDiff(today, t.prazo);
            if (d < 0) { atrasadas++; }
            else if (d <= 3) {
                proximasDoVencimento++; emDia++;
                if (t.status === 'em_andamento') emAndamento++; else pendentes++;
            } else {
                emDia++;
                if (t.status === 'em_andamento') emAndamento++; else pendentes++;
            }
        });

        return { total, concluidas, atrasadas, emDia, pendentes, emAndamento,
            proximasDoVencimento, percentConcluida: total > 0 ? Math.round((concluidas / total) * 100) : 0 };
    },

    getStatsBySetor() {
        const setores = this.getSetores();
        const tarefas = this.getTarefas();
        const today = Utils.today();
        return setores.map(setor => {
            const st = tarefas.filter(t => t.setor === setor.id);
            const total = st.length;
            const concluidas = st.filter(t => t.status === 'concluida').length;
            const atrasadas = st.filter(t => t.status !== 'concluida' && Utils.daysDiff(today, t.prazo) < 0).length;
            return { ...setor, total, concluidas, atrasadas,
                emDia: total - concluidas - atrasadas,
                percentConcluida: total > 0 ? Math.round((concluidas / total) * 100) : 0,
                pessoasCount: this.getPessoasBySetor(setor.id).length };
        });
    },

    getStatsByPessoa(pessoaId) {
        const tarefas = this.getTarefasByPessoa(pessoaId);
        const today = Utils.today();
        const total = tarefas.length;
        const concluidas = tarefas.filter(t => t.status === 'concluida').length;
        const atrasadas = tarefas.filter(t => t.status !== 'concluida' && Utils.daysDiff(today, t.prazo) < 0).length;
        return { total, concluidas, atrasadas, ativas: total - concluidas };
    },

    getAlerts() {
        const tarefas = this.getTarefas();
        const today = Utils.today();
        const alerts = [];
        tarefas.forEach(t => {
            if (t.status === 'concluida') return;
            const daysLeft = Utils.daysDiff(today, t.prazo);
            const pessoa = this.getPessoaById(t.responsavel);
            const setor = this.getSetorById(t.setor);
            const sub = `${pessoa ? pessoa.nome : 'Sem responsável'} • ${setor ? setor.nome : 'Sem setor'}`;
            if (daysLeft < 0) {
                alerts.push({ type: 'danger', title: t.titulo, subtitle: sub,
                    time: `${Math.abs(daysLeft)} dia(s) atrasada`, daysLeft, taskId: t.id });
            } else if (daysLeft <= 3) {
                alerts.push({ type: 'warning', title: t.titulo, subtitle: sub,
                    time: daysLeft === 0 ? 'Vence hoje' : `Vence em ${daysLeft} dia(s)`, daysLeft, taskId: t.id });
            }
        });
        alerts.sort((a, b) => a.daysLeft - b.daysLeft);
        return alerts;
    }
};
