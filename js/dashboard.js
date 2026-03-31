/* ===================================================
   Dashboard — Página principal com estatísticas
   =================================================== */

const Dashboard = {
    render() {
        const stats = Data.getStats();
        const sectorStats = Data.getStatsBySetor();
        const alerts = Data.getAlerts();

        const page = document.getElementById('page-dashboard');
        page.innerHTML = `
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card" id="stat-total">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Total de Tarefas</span>
                        <div class="stat-card-icon total">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                        </div>
                    </div>
                    <div class="stat-card-value">${stats.total}</div>
                    <div class="stat-card-detail">${stats.pendentes} pendentes · ${stats.emAndamento} em andamento</div>
                </div>

                <div class="stat-card" id="stat-emdia">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Em Dia</span>
                        <div class="stat-card-icon emdia">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                    </div>
                    <div class="stat-card-value" style="color: var(--color-success)">${stats.emDia}</div>
                    <div class="stat-card-detail">${stats.proximasDoVencimento} próximas do vencimento</div>
                </div>

                <div class="stat-card" id="stat-atrasadas">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Atrasadas</span>
                        <div class="stat-card-icon atrasada">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                    </div>
                    <div class="stat-card-value" style="color: var(--color-danger)">${stats.atrasadas}</div>
                    <div class="stat-card-detail">Requerem atenção imediata</div>
                </div>

                <div class="stat-card" id="stat-concluidas">
                    <div class="stat-card-header">
                        <span class="stat-card-label">Concluídas</span>
                        <div class="stat-card-icon concluida">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                    </div>
                    <div class="stat-card-value" style="color: var(--accent-secondary)">${stats.concluidas}</div>
                    <div class="stat-card-detail">${stats.percentConcluida}% do total</div>
                </div>
            </div>

            <!-- Content Grid -->
            <div class="grid-2">
                <!-- Progresso por Setor -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Progresso por Setor</h3>
                    </div>
                    <div id="sector-progress">
                        ${this.renderSectorProgress(sectorStats)}
                    </div>
                </div>

                <!-- Alertas -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Alertas e Notificações</h3>
                        <span class="badge badge-atrasada" style="${alerts.length === 0 ? 'display:none' : ''}">${alerts.length}</span>
                    </div>
                    <div class="alert-list" id="alert-list">
                        ${this.renderAlerts(alerts)}
                    </div>
                </div>
            </div>

            <!-- Tarefas Recentes -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Tarefas Recentes</h3>
                    <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('tarefas')">Ver todas →</button>
                </div>
                <div id="recent-tasks">
                    ${this.renderRecentTasks()}
                </div>
            </div>
        `;
    },

    renderSectorProgress(sectorStats) {
        if (sectorStats.length === 0) {
            return '<div class="empty-state" style="padding: 30px"><p class="empty-state-text">Nenhum setor cadastrado</p></div>';
        }

        return sectorStats.map(s => `
            <div class="progress-bar-container">
                <div class="progress-bar-header">
                    <span class="progress-bar-label">
                        <span class="sector-color-dot" style="background: ${s.cor}; width: 8px; height: 8px;"></span>
                        ${Utils.escapeHtml(s.nome)}
                    </span>
                    <span class="progress-bar-value">${s.concluidas}/${s.total} concluídas${s.atrasadas > 0 ? ` · <span style="color: var(--color-danger)">${s.atrasadas} atrasada(s)</span>` : ''}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${s.percentConcluida}%; background: ${s.cor};"></div>
                </div>
            </div>
        `).join('');
    },

    renderAlerts(alerts) {
        if (alerts.length === 0) {
            return `
                <div class="empty-state" style="padding: 30px">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p class="empty-state-title">Tudo em dia! 🎉</p>
                    <p class="empty-state-text">Não há tarefas atrasadas ou próximas do vencimento.</p>
                </div>
            `;
        }

        return alerts.map(a => `
            <div class="alert-item ${a.type}" onclick="App.navigateTo('tarefas')" style="cursor:pointer">
                <div class="alert-item-text">
                    <div class="alert-item-title">${Utils.escapeHtml(a.title)}</div>
                    <div class="alert-item-subtitle">${Utils.escapeHtml(a.subtitle)}</div>
                </div>
                <span class="alert-item-time">${a.time}</span>
            </div>
        `).join('');
    },

    renderRecentTasks() {
        const tarefas = Data.getTarefas()
            .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
            .slice(0, 5);

        if (tarefas.length === 0) {
            return `
                <div class="empty-state" style="padding: 30px">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <p class="empty-state-title">Nenhuma tarefa criada</p>
                    <p class="empty-state-text">Clique em "Nova Tarefa" para começar.</p>
                </div>
            `;
        }

        return '<div class="task-list">' + tarefas.map(t => Tarefas.renderTaskItem(t)).join('') + '</div>';
    }
};
