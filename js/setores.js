/* ===================================================
   Setores — Gestão de setores
   =================================================== */

const Setores = {
    COLORS: [
        '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa',
        '#fb923c', '#22d3ee', '#f87171', '#4ade80', '#c084fc',
        '#e879f9', '#38bdf8', '#facc15', '#fb7185', '#2dd4bf'
    ],

    ICONS: ['👥', '💰', '🏢', '⚙️', '📊', '🔧', '📋', '🎯', '📦', '🛡️', '💻', '📞', '🚀', '📐', '🧾'],

    render() {
        const setores = Data.getSetores();
        const page = document.getElementById('page-setores');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <div class="section-title-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
                    </div>
                    Setores
                </h2>
                <button class="btn btn-primary" onclick="Setores.openForm()" id="btn-add-setor">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Novo Setor</span>
                </button>
            </div>

            <div class="sector-grid" id="setor-grid">
                ${this.renderSetorCards(setores)}
            </div>
        `;
    },

    renderSetorCards(setores) {
        if (setores.length === 0) {
            return `
                <div class="empty-state" style="grid-column: 1 / -1">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
                    <p class="empty-state-title">Nenhum setor cadastrado</p>
                    <p class="empty-state-text">Crie setores para organizar suas tarefas e equipes.</p>
                    <button class="btn btn-primary" onclick="Setores.openForm()">Criar Setor</button>
                </div>
            `;
        }

        return setores.map(s => {
            const stats = Data.getStatsBySetor().find(st => st.id === s.id) || { total: 0, concluidas: 0, atrasadas: 0, pessoasCount: 0, percentConcluida: 0 };

            return `
                <div class="sector-card" data-id="${s.id}" style="--sector-color: ${s.cor}">
                    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${s.cor};"></div>
                    <div class="sector-card-actions">
                        <button class="btn-icon" onclick="Setores.openForm('${s.id}')" title="Editar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon" onclick="Setores.delete('${s.id}')" title="Excluir">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                    </div>

                    <div class="sector-card-name">
                        <span class="sector-color-dot" style="background: ${s.cor}"></span>
                        ${s.icone || ''} ${Utils.escapeHtml(s.nome)}
                    </div>

                    <div class="sector-card-stats">
                        <div class="sector-stat">
                            <div class="sector-stat-value" style="color: ${s.cor}">${stats.pessoasCount}</div>
                            <div class="sector-stat-label">Pessoas</div>
                        </div>
                        <div class="sector-stat">
                            <div class="sector-stat-value">${stats.total}</div>
                            <div class="sector-stat-label">Tarefas</div>
                        </div>
                        <div class="sector-stat">
                            <div class="sector-stat-value" style="color: var(--color-success)">${stats.concluidas}</div>
                            <div class="sector-stat-label">Concluídas</div>
                        </div>
                        <div class="sector-stat">
                            <div class="sector-stat-value" style="color: var(--color-danger)">${stats.atrasadas}</div>
                            <div class="sector-stat-label">Atrasadas</div>
                        </div>
                    </div>

                    <div style="margin-top:14px;">
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: ${stats.percentConcluida}%; background: ${s.cor};"></div>
                        </div>
                        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px; text-align:center">${stats.percentConcluida}% concluído</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    openForm(editId = null) {
        const setor = editId ? Data.getSetorById(editId) : null;
        const isEdit = !!setor;

        const body = `
            <form id="setor-form">
                <div class="form-group">
                    <label class="form-label" for="setor-nome">Nome do Setor *</label>
                    <input type="text" class="form-input" id="setor-nome" placeholder="Ex: Marketing" required value="${setor ? Utils.escapeHtml(setor.nome) : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Cor</label>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;" id="setor-colors">
                        ${this.COLORS.map(c => `
                            <div onclick="Setores.selectColor('${c}')" class="color-option ${setor && setor.cor === c ? 'selected' : ''}" data-color="${c}" style="width:32px;height:32px;border-radius:8px;background:${c};cursor:pointer;border:2px solid transparent;transition:all 0.15s;display:flex;align-items:center;justify-content:center;">
                                ${setor && setor.cor === c ? '✓' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" id="setor-cor" value="${setor ? setor.cor : this.COLORS[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">Ícone</label>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;" id="setor-icons">
                        ${this.ICONS.map(ic => `
                            <div onclick="Setores.selectIcon('${ic}')" class="icon-option ${setor && setor.icone === ic ? 'selected' : ''}" data-icon="${ic}" style="width:36px;height:36px;border-radius:8px;background:var(--bg-glass);cursor:pointer;border:2px solid transparent;transition:all 0.15s;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">
                                ${ic}
                            </div>
                        `).join('')}
                    </div>
                    <input type="hidden" id="setor-icone" value="${setor ? setor.icone || '' : this.ICONS[0]}">
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-ghost" onclick="Utils.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="Setores.save('${editId || ''}')">${isEdit ? 'Salvar' : 'Criar Setor'}</button>
        `;

        Utils.openModal(isEdit ? 'Editar Setor' : 'Novo Setor', body, footer);

        // Auto-select first color if new
        if (!setor) {
            this.selectColor(this.COLORS[0]);
            this.selectIcon(this.ICONS[0]);
        }

        setTimeout(() => document.getElementById('setor-nome')?.focus(), 100);
    },

    selectColor(color) {
        document.getElementById('setor-cor').value = color;
        document.querySelectorAll('.color-option').forEach(el => {
            el.style.borderColor = el.dataset.color === color ? 'white' : 'transparent';
            el.innerHTML = el.dataset.color === color ? '✓' : '';
            el.style.color = 'white';
            el.style.fontWeight = '700';
        });
    },

    selectIcon(icon) {
        document.getElementById('setor-icone').value = icon;
        document.querySelectorAll('.icon-option').forEach(el => {
            const isSelected = el.dataset.icon === icon;
            el.style.borderColor = isSelected ? 'var(--accent-primary)' : 'transparent';
            el.style.background = isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass)';
        });
    },

    save(editId) {
        const nome = document.getElementById('setor-nome').value.trim();
        const cor = document.getElementById('setor-cor').value;
        const icone = document.getElementById('setor-icone').value;

        if (!nome) {
            Utils.showToast('Informe o nome do setor.', 'error');
            return;
        }

        if (editId) {
            Data.updateSetor(editId, { nome, cor, icone });
            Utils.showToast('Setor atualizado!', 'success');
        } else {
            Data.addSetor({ nome, cor, icone });
            Utils.showToast('Setor criado com sucesso!', 'success');
        }

        Utils.closeModal();
        this.render();
    },

    async delete(id) {
        const setor = Data.getSetorById(id);
        if (!setor) return;

        const tarefas = Data.getTarefasBySetor(id);
        const pessoas = Data.getPessoasBySetor(id);
        let msg = `Deseja excluir o setor "${setor.nome}"?`;
        if (tarefas.length > 0 || pessoas.length > 0) {
            msg += `\n\n${pessoas.length} pessoa(s) e ${tarefas.length} tarefa(s) perderão a referência a este setor.`;
        }

        const ok = await Utils.confirm('Excluir Setor', msg);
        if (!ok) return;

        Data.deleteSetor(id);
        Utils.showToast('Setor excluído.', 'success');
        this.render();
    }
};
