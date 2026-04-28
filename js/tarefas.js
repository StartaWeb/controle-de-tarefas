/* ===================================================
   Tarefas — Gestão de tarefas
   =================================================== */

const Tarefas = {
    render() {
        let tarefas = Data.getTarefas();
        const setores = Data.getSetores();
        const pessoas = Data.getPessoas();
        const page = document.getElementById('page-tarefas');
        
        const isColaborador = App.userProfile?.perfil === 'colaborador';
        if (isColaborador && App.currentUser) {
            const myPessoa = pessoas.find(p => p.uid === App.currentUser.uid);
            tarefas = myPessoa ? tarefas.filter(t => t.responsavel === myPessoa.id) : [];
        }

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <div class="section-title-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    </div>
                    Tarefas
                </h2>
                ${!isColaborador ? `
                <button class="btn btn-primary" onclick="Tarefas.openForm()" id="btn-add-tarefa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Nova Tarefa</span>
                </button>
                ` : ''}
            </div>

            <!-- Filtros -->
            <div class="filter-bar">
                <input type="text" class="form-input" placeholder="Buscar tarefa..." id="filter-tarefa-search" oninput="Tarefas.applyFilters()">
                <select class="form-select" id="filter-tarefa-setor" onchange="Tarefas.applyFilters()">
                    <option value="">Todos os Setores</option>
                    ${setores.map(s => `<option value="${s.id}">${Utils.escapeHtml(s.nome)}</option>`).join('')}
                </select>
                <select class="form-select" id="filter-tarefa-pessoa" onchange="Tarefas.applyFilters()">
                    <option value="">Todos Responsáveis</option>
                    ${pessoas.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.nome)}</option>`).join('')}
                </select>
                <select class="form-select" id="filter-tarefa-status" onchange="Tarefas.applyFilters()">
                    <option value="">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="atrasada">Atrasada</option>
                </select>
                <select class="form-select" id="filter-tarefa-prioridade" onchange="Tarefas.applyFilters()">
                    <option value="">Todas Prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                </select>
                <span class="filter-count" id="tarefa-count">${tarefas.length} tarefa(s)</span>
            </div>

            <!-- Lista de Tarefas -->
            <div class="task-list" id="tarefa-list">
                ${this.renderTaskList(tarefas)}
            </div>
        `;
    },

    renderTaskList(tarefas) {
        if (tarefas.length === 0) {
            return `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <p class="empty-state-title">Nenhuma tarefa encontrada</p>
                    <p class="empty-state-text">Crie sua primeira tarefa para começar a gerenciar.</p>
                    <button class="btn btn-primary" onclick="Tarefas.openForm()">Criar Tarefa</button>
                </div>
            `;
        }

        // Ordenar: atrasadas primeiro, depois por prazo
        const today = Utils.today();
        const sorted = [...tarefas].sort((a, b) => {
            // Concluídas por último
            if (a.status === 'concluida' && b.status !== 'concluida') return 1;
            if (b.status === 'concluida' && a.status !== 'concluida') return -1;

            // Atrasadas primeiro
            const aDays = Utils.daysDiff(today, a.prazo);
            const bDays = Utils.daysDiff(today, b.prazo);

            if (aDays < 0 && bDays >= 0) return -1;
            if (bDays < 0 && aDays >= 0) return 1;

            // Depois por prazo mais próximo
            return aDays - bDays;
        });

        return sorted.map(t => this.renderTaskItem(t)).join('');
    },

    renderTaskItem(task) {
        const pessoa = Data.getPessoaById(task.responsavel);
        const setor = Data.getSetorById(task.setor);
        const visualStatus = Utils.getTaskVisualStatus(task);
        const isCompleted = task.status === 'concluida';

        let statusBadgeClass = '';
        let statusLabel = '';

        switch (visualStatus) {
            case 'atrasada':
                statusBadgeClass = 'badge-atrasada';
                statusLabel = 'Atrasada';
                break;
            case 'proxima':
                statusBadgeClass = 'badge-em_andamento';
                statusLabel = task.status === 'em_andamento' ? 'Em Andamento' : 'Prazo Próximo';
                break;
            case 'concluida':
                statusBadgeClass = 'badge-concluida';
                statusLabel = 'Concluída';
                break;
            default:
                statusBadgeClass = task.status === 'em_andamento' ? 'badge-em_andamento' : 'badge-pendente';
                statusLabel = task.status === 'em_andamento' ? 'Em Andamento' : 'Pendente';
        }

        const isColaborador = App.userProfile?.perfil === 'colaborador';
        
        return `
            <div class="task-item" data-id="${task.id}">
                <div class="task-item-priority ${task.prioridade}" title="Prioridade ${Utils.priorityLabel(task.prioridade)}"></div>

                <div class="task-item-content">
                    <div class="task-item-title ${isCompleted ? 'completed' : ''}">${Utils.escapeHtml(task.titulo)}</div>
                    <div class="task-item-meta">
                        ${setor ? `<span class="task-item-meta-item"><span class="sector-color-dot" style="background:${setor.cor}; width:6px; height:6px;"></span> ${Utils.escapeHtml(setor.nome)}</span>` : ''}
                        ${pessoa ? `<span class="task-item-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${Utils.escapeHtml(pessoa.nome)}</span>` : ''}
                        <span class="task-item-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${Utils.formatDate(task.prazo)}</span>
                        ${!isCompleted ? `<span class="task-item-meta-item" style="color: ${visualStatus === 'atrasada' ? 'var(--color-danger)' : visualStatus === 'proxima' ? 'var(--color-warning)' : 'var(--text-muted)'}">${Utils.deadlineText(task.prazo)}</span>` : ''}
                    </div>
                </div>

                <span class="badge ${statusBadgeClass}">
                    <span class="badge-dot"></span>
                    ${statusLabel}
                </span>

                <span class="badge badge-${task.prioridade}" style="margin-left:-4px">
                    ${Utils.priorityLabel(task.prioridade)}
                </span>

                <div class="task-item-actions">
                    ${!isCompleted ? `
                        <button class="btn-icon" onclick="event.stopPropagation(); Tarefas.toggleStatus('${task.id}')" title="${task.status === 'pendente' ? 'Iniciar' : 'Concluir'}">
                            ${task.status === 'pendente'
                                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                            }
                        </button>
                    ` : `
                        <button class="btn-icon" onclick="event.stopPropagation(); Tarefas.reopen('${task.id}')" title="Reabrir">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                        </button>
                    `}
                    ${!isColaborador ? `
                    <button class="btn-icon" onclick="event.stopPropagation(); Tarefas.openForm('${task.id}')" title="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); Tarefas.delete('${task.id}')" title="Excluir">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    applyFilters() {
        const search = (document.getElementById('filter-tarefa-search')?.value || '').toLowerCase();
        const setorFilter = document.getElementById('filter-tarefa-setor')?.value || '';
        const pessoaFilter = document.getElementById('filter-tarefa-pessoa')?.value || '';
        const statusFilter = document.getElementById('filter-tarefa-status')?.value || '';
        const prioridadeFilter = document.getElementById('filter-tarefa-prioridade')?.value || '';

        let tarefas = Data.getTarefas();
        const today = Utils.today();
        
        const isColaborador = App.userProfile?.perfil === 'colaborador';
        if (isColaborador && App.currentUser) {
            const myPessoa = Data.getPessoas().find(p => p.uid === App.currentUser.uid);
            tarefas = myPessoa ? tarefas.filter(t => t.responsavel === myPessoa.id) : [];
        }

        if (search) {
            tarefas = tarefas.filter(t => {
                const pessoa = Data.getPessoaById(t.responsavel);
                return t.titulo.toLowerCase().includes(search) ||
                    (t.descricao || '').toLowerCase().includes(search) ||
                    (pessoa && pessoa.nome.toLowerCase().includes(search));
            });
        }

        if (setorFilter) tarefas = tarefas.filter(t => t.setor === setorFilter);
        if (pessoaFilter) tarefas = tarefas.filter(t => t.responsavel === pessoaFilter);
        if (prioridadeFilter) tarefas = tarefas.filter(t => t.prioridade === prioridadeFilter);

        if (statusFilter) {
            if (statusFilter === 'atrasada') {
                tarefas = tarefas.filter(t => t.status !== 'concluida' && Utils.daysDiff(today, t.prazo) < 0);
            } else {
                tarefas = tarefas.filter(t => t.status === statusFilter);
            }
        }

        document.getElementById('tarefa-list').innerHTML = this.renderTaskList(tarefas);
        document.getElementById('tarefa-count').textContent = `${tarefas.length} tarefa(s)`;
    },

    openForm(editId = null) {
        const setores = Data.getSetores();
        const pessoas = Data.getPessoas();
        const tarefa = editId ? Data.getTarefaById(editId) : null;
        const isEdit = !!tarefa;

        const body = `
            <form id="tarefa-form">
                <div class="form-group">
                    <label class="form-label" for="tarefa-titulo">Título *</label>
                    <input type="text" class="form-input" id="tarefa-titulo" placeholder="Ex: Revisar folha de pagamento" required value="${tarefa ? Utils.escapeHtml(tarefa.titulo) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="tarefa-descricao">Descrição</label>
                    <textarea class="form-textarea" id="tarefa-descricao" placeholder="Detalhes da tarefa...">${tarefa ? Utils.escapeHtml(tarefa.descricao || '') : ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="tarefa-setor">Setor *</label>
                        <select class="form-select" id="tarefa-setor" required onchange="Tarefas.onSetorChange()">
                            <option value="">Selecione...</option>
                            ${setores.map(s => `<option value="${s.id}" ${tarefa && tarefa.setor === s.id ? 'selected' : ''}>${Utils.escapeHtml(s.nome)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="tarefa-responsavel">Responsável *</label>
                        <select class="form-select" id="tarefa-responsavel" required>
                            <option value="">Selecione o setor primeiro</option>
                            ${tarefa ? pessoas.filter(p => p.setor === tarefa.setor).map(p => `<option value="${p.id}" ${tarefa.responsavel === p.id ? 'selected' : ''}>${Utils.escapeHtml(p.nome)}</option>`).join('') : ''}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="tarefa-prazo">Prazo *</label>
                        <input type="date" class="form-input" id="tarefa-prazo" required value="${tarefa ? tarefa.prazo : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="tarefa-prioridade">Prioridade *</label>
                        <select class="form-select" id="tarefa-prioridade" required>
                            <option value="baixa" ${tarefa && tarefa.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
                            <option value="media" ${tarefa && tarefa.prioridade === 'media' ? 'selected' : ''} ${!tarefa ? 'selected' : ''}>Média</option>
                            <option value="alta" ${tarefa && tarefa.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>
                </div>
                ${isEdit ? `
                <div class="form-group">
                    <label class="form-label" for="tarefa-status">Status</label>
                    <select class="form-select" id="tarefa-status">
                        <option value="pendente" ${tarefa.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="em_andamento" ${tarefa.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                        <option value="concluida" ${tarefa.status === 'concluida' ? 'selected' : ''}>Concluída</option>
                    </select>
                </div>
                ` : ''}
            </form>
        `;

        const footer = `
            <button class="btn btn-ghost" onclick="Utils.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="Tarefas.save('${editId || ''}')">${isEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
        `;

        Utils.openModal(isEdit ? 'Editar Tarefa' : 'Nova Tarefa', body, footer);

        // Se editando, popular responsável
        if (tarefa) {
            this.onSetorChange();
            setTimeout(() => {
                const sel = document.getElementById('tarefa-responsavel');
                if (sel) sel.value = tarefa.responsavel;
            }, 50);
        }

        setTimeout(() => document.getElementById('tarefa-titulo')?.focus(), 100);
    },

    onSetorChange() {
        const setorId = document.getElementById('tarefa-setor').value;
        const responsavelSelect = document.getElementById('tarefa-responsavel');

        if (!setorId) {
            responsavelSelect.innerHTML = '<option value="">Selecione o setor primeiro</option>';
            return;
        }

        const pessoas = Data.getPessoasBySetor(setorId);
        responsavelSelect.innerHTML = '<option value="">Selecione...</option>' +
            pessoas.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.nome)}</option>`).join('');

        if (pessoas.length === 0) {
            responsavelSelect.innerHTML = '<option value="">Nenhum colaborador neste setor</option>';
        }
    },

    save(editId) {
        const titulo = document.getElementById('tarefa-titulo').value.trim();
        const descricao = document.getElementById('tarefa-descricao').value.trim();
        const setor = document.getElementById('tarefa-setor').value;
        const responsavel = document.getElementById('tarefa-responsavel').value;
        const prazo = document.getElementById('tarefa-prazo').value;
        const prioridade = document.getElementById('tarefa-prioridade').value;
        const statusEl = document.getElementById('tarefa-status');
        const status = statusEl ? statusEl.value : 'pendente';

        if (!titulo) { Utils.showToast('Informe o título da tarefa.', 'error'); return; }
        if (!setor) { Utils.showToast('Selecione um setor.', 'error'); return; }
        if (!responsavel) { Utils.showToast('Selecione um responsável.', 'error'); return; }
        if (!prazo) { Utils.showToast('Informe o prazo.', 'error'); return; }

        const dados = { titulo, descricao, setor, responsavel, prazo, prioridade, status };

        if (editId) {
            Data.updateTarefa(editId, dados);
            Utils.showToast('Tarefa atualizada com sucesso!', 'success');
        } else {
            Data.addTarefa(dados);
            Utils.showToast('Tarefa criada com sucesso!', 'success');
        }

        Utils.closeModal();
        this.render();
        Dashboard.render(); // Atualizar dashboard
    },

    toggleStatus(id) {
        const tarefa = Data.getTarefaById(id);
        if (!tarefa) return;

        let newStatus = '';
        if (tarefa.status === 'pendente') {
            newStatus = 'em_andamento';
            Utils.showToast('Tarefa iniciada!', 'info');
        } else {
            newStatus = 'concluida';
            Utils.showToast('Tarefa concluída! 🎉', 'success');
        }

        Data.updateTarefa(id, { status: newStatus });
        this.render();
        Dashboard.render();
    },

    reopen(id) {
        Data.updateTarefa(id, { status: 'pendente' });
        Utils.showToast('Tarefa reaberta.', 'info');
        this.render();
        Dashboard.render();
    },

    async delete(id) {
        const tarefa = Data.getTarefaById(id);
        if (!tarefa) return;

        const ok = await Utils.confirm('Excluir Tarefa', `Deseja excluir a tarefa "${tarefa.titulo}"?`);
        if (!ok) return;

        Data.deleteTarefa(id);
        Utils.showToast('Tarefa excluída.', 'success');
        this.render();
        Dashboard.render();
    }
};
