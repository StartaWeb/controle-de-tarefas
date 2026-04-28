/* ===================================================
   Pessoas — Gestão de colaboradores
   =================================================== */

const Pessoas = {
    render() {
        const pessoas = Data.getPessoas();
        const setores = Data.getSetores();
        const page = document.getElementById('page-pessoas');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <div class="section-title-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    Colaboradores
                </h2>
                <button class="btn btn-primary" onclick="Pessoas.openForm()" id="btn-add-pessoa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Novo Colaborador</span>
                </button>
            </div>

            <!-- Filtro -->
            <div class="filter-bar">
                <input type="text" class="form-input" placeholder="Buscar por nome ou cargo..." id="filter-pessoa-search" oninput="Pessoas.applyFilters()">
                <select class="form-select" id="filter-pessoa-setor" onchange="Pessoas.applyFilters()">
                    <option value="">Todos os Setores</option>
                    ${setores.map(s => `<option value="${s.id}">${Utils.escapeHtml(s.nome)}</option>`).join('')}
                </select>
                <span class="filter-count" id="pessoa-count">${pessoas.length} colaborador(es)</span>
            </div>

            <!-- Grid de Pessoas -->
            <div class="person-grid" id="pessoa-grid">
                ${this.renderPessoaCards(pessoas)}
            </div>
        `;
    },

    renderPessoaCards(pessoas) {
        if (pessoas.length === 0) {
            return `
                <div class="empty-state" style="grid-column: 1 / -1">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <p class="empty-state-title">Nenhum colaborador cadastrado</p>
                    <p class="empty-state-text">Adicione colaboradores para poder atribuir tarefas.</p>
                    <button class="btn btn-primary" onclick="Pessoas.openForm()">Adicionar Colaborador</button>
                </div>
            `;
        }

        return pessoas.map(p => {
            const setor = Data.getSetorById(p.setor);
            const stats = Data.getStatsByPessoa(p.id);

            return `
                <div class="person-card" data-id="${p.id}">
                    <div class="person-card-actions">
                        <button class="btn-icon" onclick="Pessoas.openForm('${p.id}')" title="Editar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon" onclick="Pessoas.delete('${p.id}')" title="Excluir">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                    </div>

                    <div class="person-card-header">
                        <div class="person-avatar" style="background: ${setor ? `linear-gradient(135deg, ${setor.cor}, ${setor.cor}88)` : 'var(--accent-gradient)'}">
                            ${Utils.getInitials(p.nome)}
                        </div>
                        <div class="person-info">
                            <div class="person-name">${Utils.escapeHtml(p.nome)}</div>
                            <div class="person-cargo">${Utils.escapeHtml(p.cargo || 'Sem cargo')} ${setor ? `· <span style="color: ${setor.cor}">${Utils.escapeHtml(setor.nome)}</span>` : ''}</div>
                        </div>
                    </div>

                    <div class="person-stats">
                        <div class="person-stat">
                            <div class="person-stat-value" style="color: var(--color-info)">${stats.ativas}</div>
                            <div class="person-stat-label">Ativas</div>
                        </div>
                        <div class="person-stat">
                            <div class="person-stat-value" style="color: var(--color-danger)">${stats.atrasadas}</div>
                            <div class="person-stat-label">Atrasadas</div>
                        </div>
                        <div class="person-stat">
                            <div class="person-stat-value" style="color: var(--color-success)">${stats.concluidas}</div>
                            <div class="person-stat-label">Concluídas</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    applyFilters() {
        const search = (document.getElementById('filter-pessoa-search')?.value || '').toLowerCase();
        const setorFilter = document.getElementById('filter-pessoa-setor')?.value || '';

        let pessoas = Data.getPessoas();

        if (search) {
            pessoas = pessoas.filter(p =>
                p.nome.toLowerCase().includes(search) ||
                (p.cargo || '').toLowerCase().includes(search)
            );
        }

        if (setorFilter) {
            pessoas = pessoas.filter(p => p.setor === setorFilter);
        }

        document.getElementById('pessoa-grid').innerHTML = this.renderPessoaCards(pessoas);
        document.getElementById('pessoa-count').textContent = `${pessoas.length} colaborador(es)`;
    },

    openForm(editId = null) {
        const setores = Data.getSetores();
        const pessoa = editId ? Data.getPessoaById(editId) : null;
        const isEdit = !!pessoa;

        const body = `
            <form id="pessoa-form">
                <div class="form-group">
                    <label class="form-label" for="pessoa-nome">Nome Completo *</label>
                    <input type="text" class="form-input" id="pessoa-nome" placeholder="Ex: Maria Silva" required value="${pessoa ? Utils.escapeHtml(pessoa.nome) : ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="pessoa-cargo">Cargo</label>
                        <input type="text" class="form-input" id="pessoa-cargo" placeholder="Ex: Analista" value="${pessoa ? Utils.escapeHtml(pessoa.cargo || '') : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="pessoa-setor">Setor</label>
                        <select class="form-select" id="pessoa-setor">
                            <option value="">Nenhum / Selecione...</option>
                            ${setores.map(s => `<option value="${s.id}" ${pessoa && pessoa.setor === s.id ? 'selected' : ''}>${Utils.escapeHtml(s.nome)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="pessoa-email">E-mail de Acesso *</label>
                        <input type="email" class="form-input" id="pessoa-email" placeholder="usuario@empresa.com" required value="${pessoa ? Utils.escapeHtml(pessoa.email || '') : ''}" ${isEdit ? 'disabled title="O E-mail não pode ser alterado"' : ''}>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="pessoa-perfil">Nível de Acesso *</label>
                        <select class="form-select" id="pessoa-perfil" required>
                            <option value="colaborador" ${pessoa && pessoa.perfil === 'colaborador' ? 'selected' : ''}>Colaborador</option>
                            <option value="admin" ${pessoa && pessoa.perfil === 'admin' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </div>
                </div>
                ${!isEdit ? `
                <div class="form-group">
                    <label class="form-label" for="pessoa-senha">Senha Temporária *</label>
                    <input type="password" class="form-input" id="pessoa-senha" placeholder="Mínimo de 6 caracteres" required minlength="6">
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn btn-ghost" onclick="Utils.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="Pessoas.save('${editId || ''}')">${isEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
        `;

        Utils.openModal(isEdit ? 'Editar Colaborador' : 'Novo Colaborador', body, footer);

        // Focus first field
        setTimeout(() => document.getElementById('pessoa-nome')?.focus(), 100);
    },

    async save(editId) {
        const nome = document.getElementById('pessoa-nome').value.trim();
        const cargo = document.getElementById('pessoa-cargo').value.trim();
        const setor = document.getElementById('pessoa-setor').value;
        const email = document.getElementById('pessoa-email').value.trim();
        const perfil = document.getElementById('pessoa-perfil').value;
        const senha = document.getElementById('pessoa-senha')?.value;

        if (!nome || !email) {
            Utils.showToast('Informe o nome e e-mail.', 'error');
            return;
        }

        const btn = document.querySelector('.modal-footer .btn-primary');
        if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

        try {
            if (editId) {
                // Edit
                Data.updatePessoa(editId, { nome, cargo, setor, perfil });
                const pessoa = Data.getPessoaById(editId);
                if (pessoa && pessoa.uid) {
                    await db.collection('usuarios').doc(pessoa.uid).update({ perfil, nome }).catch(console.error);
                }
                Utils.showToast('Colaborador atualizado com sucesso!', 'success');
            } else {
                if (!senha || senha.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres.');
                }
                
                // Novo usuário no Auth
                const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
                const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, senha);
                const uid = userCred.user.uid;
                await secondaryApp.auth().signOut();
                await secondaryApp.delete();

                // Novo usuário no Firestore
                await db.collection('usuarios').doc(uid).set({
                    email, perfil, nome, criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                });

                Data.addPessoa({ nome, cargo, setor, email, perfil, uid });
                Utils.showToast('Colaborador adicionado com sucesso!', 'success');
            }

            Utils.closeModal();
            this.render();
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                Utils.showToast('Este e-mail já está cadastrado no sistema.', 'error');
            } else {
                Utils.showToast(err.message || 'Erro ao salvar colaborador.', 'error');
            }
            if (btn) { btn.disabled = false; btn.textContent = editId ? 'Salvar Alterações' : 'Adicionar'; }
        }
    },

    async delete(id) {
        const pessoa = Data.getPessoaById(id);
        if (!pessoa) return;

        const tarefas = Data.getTarefasByPessoa(id);
        const msg = tarefas.length > 0
            ? `"${pessoa.nome}" possui ${tarefas.length} tarefa(s) atribuída(s). As tarefas ficarão sem responsável.`
            : `Deseja excluir "${pessoa.nome}"?`;

        const ok = await Utils.confirm('Excluir Colaborador', msg);
        if (!ok) return;

        Data.deletePessoa(id);
        Utils.showToast('Colaborador excluído.', 'success');
        this.render();
    }
};
