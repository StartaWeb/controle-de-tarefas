/* ===================================================
   Relatórios — Exportação de dados
   =================================================== */

const Relatorios = {
    render() {
        const page = document.getElementById('page-relatorios');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">
                    <div class="section-title-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    Relatórios
                </h2>
            </div>

            <div class="report-cards">
                <!-- Relatório Geral -->
                <div class="report-card" onclick="Relatorios.geralPDF()" id="report-geral-pdf">
                    <div class="report-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div class="report-card-title">Relatório Geral</div>
                    <div class="report-card-desc">Visão completa de todas as tarefas, status de cada uma, responsável e prazos. Ideal para impressão.</div>
                </div>

                <!-- Relatório por Setor -->
                <div class="report-card" onclick="Relatorios.setorPDF()" id="report-setor-pdf">
                    <div class="report-card-icon" style="background: linear-gradient(135deg, #34d399, #22c55e);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
                    </div>
                    <div class="report-card-title">Relatório por Setor</div>
                    <div class="report-card-desc">Tarefas agrupadas por setor com estatísticas de conclusão e atrasos de cada departamento.</div>
                </div>

                <!-- Relatório por Pessoa -->
                <div class="report-card" onclick="Relatorios.pessoaPDF()" id="report-pessoa-pdf">
                    <div class="report-card-icon" style="background: linear-gradient(135deg, #f472b6, #ec4899);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <div class="report-card-title">Relatório por Pessoa</div>
                    <div class="report-card-desc">Produtividade individual de cada colaborador, com tarefas ativas, concluídas e atrasadas.</div>
                </div>

                <!-- Relatório de Atrasadas -->
                <div class="report-card" onclick="Relatorios.atrasadasPDF()" id="report-atrasadas-pdf">
                    <div class="report-card-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="report-card-title">Tarefas Atrasadas</div>
                    <div class="report-card-desc">Lista de todas as tarefas que ultrapassaram o prazo, com detalhes do atraso e responsável.</div>
                </div>

                <!-- Exportar CSV Geral -->
                <div class="report-card" onclick="Relatorios.exportCSVGeral()" id="report-csv-geral">
                    <div class="report-card-icon" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <div class="report-card-title">Exportar CSV (Excel)</div>
                    <div class="report-card-desc">Baixe todas as tarefas em formato CSV para abrir no Excel ou Google Sheets.</div>
                </div>

                <!-- Exportar CSV Pessoas -->
                <div class="report-card" onclick="Relatorios.exportCSVPessoas()" id="report-csv-pessoas">
                    <div class="report-card-icon" style="background: linear-gradient(135deg, #60a5fa, #3b82f6);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <div class="report-card-title">Exportar Pessoas CSV</div>
                    <div class="report-card-desc">Baixe a lista de colaboradores com informações de setor e estatísticas de tarefas.</div>
                </div>
            </div>
        `;
    },

    // ====== PDF Reports (via print) ======

    geralPDF() {
        const tarefas = Data.getTarefas();
        const stats = Data.getStats();
        const today = Utils.today();

        let html = `
            <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
                <div class="stat-box"><div class="value">${stats.total}</div><div class="label">Total</div></div>
                <div class="stat-box"><div class="value" style="color:#22c55e">${stats.emDia}</div><div class="label">Em Dia</div></div>
                <div class="stat-box"><div class="value" style="color:#ef4444">${stats.atrasadas}</div><div class="label">Atrasadas</div></div>
                <div class="stat-box"><div class="value" style="color:#8b5cf6">${stats.concluidas}</div><div class="label">Concluídas</div></div>
            </div>

            <h2>Todas as Tarefas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tarefa</th>
                        <th>Setor</th>
                        <th>Responsável</th>
                        <th>Prazo</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        tarefas.forEach(t => {
            const pessoa = Data.getPessoaById(t.responsavel);
            const setor = Data.getSetorById(t.setor);
            const visual = Utils.getTaskVisualStatus(t);
            let statusText = Utils.statusLabel(t.status);
            if (visual === 'atrasada') statusText = 'Atrasada';

            html += `<tr>
                <td>${Utils.escapeHtml(t.titulo)}</td>
                <td>${setor ? Utils.escapeHtml(setor.nome) : '—'}</td>
                <td>${pessoa ? Utils.escapeHtml(pessoa.nome) : '—'}</td>
                <td>${Utils.formatDate(t.prazo)}</td>
                <td>${Utils.priorityLabel(t.prioridade)}</td>
                <td><span class="badge badge-${visual === 'atrasada' ? 'atrasada' : t.status === 'concluida' ? 'concluida' : 'emdia'}">${statusText}</span></td>
            </tr>`;
        });

        html += '</tbody></table>';

        Utils.printReport(html, 'Relatório Geral de Tarefas');
        Utils.showToast('Relatório geral gerado!', 'success');
    },

    setorPDF() {
        const sectorStats = Data.getStatsBySetor();
        const tarefas = Data.getTarefas();

        let html = '';

        sectorStats.forEach(s => {
            const setorTarefas = tarefas.filter(t => t.setor === s.id);

            html += `
                <h2 style="color: ${s.cor}; border-bottom: 2px solid ${s.cor}; padding-bottom: 6px;">${s.icone || ''} ${Utils.escapeHtml(s.nome)}</h2>
                <div style="display:flex; gap:12px; margin-bottom:12px;">
                    <div class="stat-box"><div class="value">${s.total}</div><div class="label">Total</div></div>
                    <div class="stat-box"><div class="value" style="color:#22c55e">${s.concluidas}</div><div class="label">Concluídas</div></div>
                    <div class="stat-box"><div class="value" style="color:#ef4444">${s.atrasadas}</div><div class="label">Atrasadas</div></div>
                    <div class="stat-box"><div class="value">${s.pessoasCount}</div><div class="label">Pessoas</div></div>
                </div>
            `;

            if (setorTarefas.length > 0) {
                html += `<table><thead><tr><th>Tarefa</th><th>Responsável</th><th>Prazo</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>`;
                setorTarefas.forEach(t => {
                    const pessoa = Data.getPessoaById(t.responsavel);
                    const visual = Utils.getTaskVisualStatus(t);
                    let statusText = Utils.statusLabel(t.status);
                    if (visual === 'atrasada') statusText = 'Atrasada';

                    html += `<tr>
                        <td>${Utils.escapeHtml(t.titulo)}</td>
                        <td>${pessoa ? Utils.escapeHtml(pessoa.nome) : '—'}</td>
                        <td>${Utils.formatDate(t.prazo)}</td>
                        <td>${Utils.priorityLabel(t.prioridade)}</td>
                        <td>${statusText}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p style="color:#999; font-style:italic;">Nenhuma tarefa neste setor.</p>';
            }

            html += '<div style="margin-bottom:24px;"></div>';
        });

        Utils.printReport(html, 'Relatório por Setor');
        Utils.showToast('Relatório por setor gerado!', 'success');
    },

    pessoaPDF() {
        const pessoas = Data.getPessoas();
        const tarefas = Data.getTarefas();

        let html = '';

        pessoas.forEach(p => {
            const setor = Data.getSetorById(p.setor);
            const stats = Data.getStatsByPessoa(p.id);
            const pessoaTarefas = Data.getTarefasByPessoa(p.id);

            html += `
                <h2>${Utils.escapeHtml(p.nome)} <span style="font-weight:400;color:#666;">— ${Utils.escapeHtml(p.cargo || '')} ${setor ? '· ' + Utils.escapeHtml(setor.nome) : ''}</span></h2>
                <div style="display:flex; gap:12px; margin-bottom:12px;">
                    <div class="stat-box"><div class="value">${stats.total}</div><div class="label">Total</div></div>
                    <div class="stat-box"><div class="value">${stats.ativas}</div><div class="label">Ativas</div></div>
                    <div class="stat-box"><div class="value" style="color:#ef4444">${stats.atrasadas}</div><div class="label">Atrasadas</div></div>
                    <div class="stat-box"><div class="value" style="color:#22c55e">${stats.concluidas}</div><div class="label">Concluídas</div></div>
                </div>
            `;

            if (pessoaTarefas.length > 0) {
                html += `<table><thead><tr><th>Tarefa</th><th>Setor</th><th>Prazo</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>`;
                pessoaTarefas.forEach(t => {
                    const s = Data.getSetorById(t.setor);
                    const visual = Utils.getTaskVisualStatus(t);
                    let statusText = Utils.statusLabel(t.status);
                    if (visual === 'atrasada') statusText = 'Atrasada';

                    html += `<tr>
                        <td>${Utils.escapeHtml(t.titulo)}</td>
                        <td>${s ? Utils.escapeHtml(s.nome) : '—'}</td>
                        <td>${Utils.formatDate(t.prazo)}</td>
                        <td>${Utils.priorityLabel(t.prioridade)}</td>
                        <td>${statusText}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p style="color:#999; font-style:italic;">Nenhuma tarefa atribuída.</p>';
            }

            html += '<div style="margin-bottom:24px;"></div>';
        });

        if (pessoas.length === 0) {
            html = '<p style="color:#999; font-style:italic;">Nenhum colaborador cadastrado.</p>';
        }

        Utils.printReport(html, 'Relatório por Pessoa');
        Utils.showToast('Relatório por pessoa gerado!', 'success');
    },

    atrasadasPDF() {
        const tarefas = Data.getTarefas();
        const today = Utils.today();
        const atrasadas = tarefas.filter(t => t.status !== 'concluida' && Utils.daysDiff(today, t.prazo) < 0);

        let html = `
            <div class="stat-box" style="margin-bottom:20px;">
                <div class="value" style="color:#ef4444">${atrasadas.length}</div>
                <div class="label">Tarefas Atrasadas</div>
            </div>
        `;

        if (atrasadas.length > 0) {
            html += `<table><thead><tr><th>Tarefa</th><th>Setor</th><th>Responsável</th><th>Prazo</th><th>Dias de Atraso</th><th>Prioridade</th></tr></thead><tbody>`;
            atrasadas.sort((a, b) => Utils.daysDiff(today, a.prazo) - Utils.daysDiff(today, b.prazo));

            atrasadas.forEach(t => {
                const pessoa = Data.getPessoaById(t.responsavel);
                const setor = Data.getSetorById(t.setor);
                const diasAtraso = Math.abs(Utils.daysDiff(today, t.prazo));

                html += `<tr>
                    <td>${Utils.escapeHtml(t.titulo)}</td>
                    <td>${setor ? Utils.escapeHtml(setor.nome) : '—'}</td>
                    <td>${pessoa ? Utils.escapeHtml(pessoa.nome) : '—'}</td>
                    <td>${Utils.formatDate(t.prazo)}</td>
                    <td style="color:#ef4444; font-weight:600;">${diasAtraso} dia(s)</td>
                    <td>${Utils.priorityLabel(t.prioridade)}</td>
                </tr>`;
            });
            html += '</tbody></table>';
        } else {
            html += '<p style="color:#22c55e; font-weight:600; text-align:center; padding:40px;">✅ Nenhuma tarefa atrasada! Parabéns!</p>';
        }

        Utils.printReport(html, 'Tarefas Atrasadas');
        Utils.showToast('Relatório de atrasadas gerado!', 'success');
    },

    // ====== CSV Exports ======

    exportCSVGeral() {
        const tarefas = Data.getTarefas();
        const today = Utils.today();

        const headers = ['Título', 'Descrição', 'Setor', 'Responsável', 'Prazo', 'Prioridade', 'Status', 'Criada Em', 'Concluída Em'];
        const rows = tarefas.map(t => {
            const pessoa = Data.getPessoaById(t.responsavel);
            const setor = Data.getSetorById(t.setor);
            const visual = Utils.getTaskVisualStatus(t);
            let status = Utils.statusLabel(t.status);
            if (visual === 'atrasada') status = 'Atrasada';

            return [
                t.titulo,
                t.descricao || '',
                setor ? setor.nome : '',
                pessoa ? pessoa.nome : '',
                Utils.formatDate(t.prazo),
                Utils.priorityLabel(t.prioridade),
                status,
                Utils.formatDateTime(t.criadoEm),
                t.concluidaEm ? Utils.formatDateTime(t.concluidaEm) : ''
            ];
        });

        Utils.exportCSV(headers, rows, 'startweb_tarefas_' + today);
        Utils.showToast('CSV de tarefas exportado!', 'success');
    },

    exportCSVPessoas() {
        const pessoas = Data.getPessoas();
        const today = Utils.today();

        const headers = ['Nome', 'Cargo', 'Setor', 'Tarefas Ativas', 'Tarefas Atrasadas', 'Tarefas Concluídas', 'Total'];
        const rows = pessoas.map(p => {
            const setor = Data.getSetorById(p.setor);
            const stats = Data.getStatsByPessoa(p.id);

            return [
                p.nome,
                p.cargo || '',
                setor ? setor.nome : '',
                stats.ativas,
                stats.atrasadas,
                stats.concluidas,
                stats.total
            ];
        });

        Utils.exportCSV(headers, rows, 'startweb_pessoas_' + today);
        Utils.showToast('CSV de pessoas exportado!', 'success');
    }
};
