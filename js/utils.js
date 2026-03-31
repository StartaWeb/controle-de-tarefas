/* ===================================================
   Utils — Funções utilitárias
   =================================================== */

const Utils = {
    /**
     * Gera um ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Formata data para exibição (dd/mm/aaaa)
     */
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pt-BR');
    },

    /**
     * Formata data e hora
     */
    formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Retorna a data de hoje no formato YYYY-MM-DD
     */
    today() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Calcula diferença em dias entre duas datas
     */
    daysDiff(date1, date2) {
        const d1 = new Date(date1 + 'T00:00:00');
        const d2 = new Date(date2 + 'T00:00:00');
        const diffTime = d2 - d1;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Retorna o status visual de uma tarefa baseado no prazo
     */
    getTaskVisualStatus(task) {
        if (task.status === 'concluida') return 'concluida';
        const today = this.today();
        const daysLeft = this.daysDiff(today, task.prazo);
        if (daysLeft < 0) return 'atrasada';
        if (daysLeft <= 3) return 'proxima';
        return 'emdia';
    },

    /**
     * Retorna label legível do status
     */
    statusLabel(status) {
        const labels = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'concluida': 'Concluída',
            'atrasada': 'Atrasada'
        };
        return labels[status] || status;
    },

    /**
     * Retorna label legível da prioridade
     */
    priorityLabel(priority) {
        const labels = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };
        return labels[priority] || priority;
    },

    /**
     * Retorna texto descritivo do prazo
     */
    deadlineText(prazo) {
        if (!prazo) return '';
        const days = this.daysDiff(this.today(), prazo);
        if (days < 0) return `Atrasada há ${Math.abs(days)} dia(s)`;
        if (days === 0) return 'Vence hoje';
        if (days === 1) return 'Vence amanhã';
        if (days <= 7) return `Vence em ${days} dias`;
        return `Vence em ${this.formatDate(prazo)}`;
    },

    /**
     * Retorna iniciais de um nome
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    /**
     * Escapa HTML para evitar XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Debounce
     */
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    /**
     * Exibe um toast de notificação
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-text">${this.escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    /**
     * Exibe diálogo de confirmação
     */
    confirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirm-overlay');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');

            titleEl.textContent = title;
            messageEl.textContent = message;
            overlay.classList.add('active');

            const cleanup = () => {
                overlay.classList.remove('active');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlay);
            };

            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            const onOverlay = (e) => { if (e.target === overlay) { cleanup(); resolve(false); } };

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
        });
    },

    /**
     * Abre o modal com conteúdo
     */
    openModal(title, bodyHtml, footerHtml = '') {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');

        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;
        footerEl.innerHTML = footerHtml;
        overlay.classList.add('active');
    },

    /**
     * Fecha o modal
     */
    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    /**
     * Export CSV
     */
    exportCSV(headers, rows, filename) {
        const BOM = '\uFEFF'; // UTF-8 BOM for Excel
        let csv = BOM;
        csv += headers.join(';') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => {
                const val = String(cell ?? '').replace(/"/g, '""');
                return `"${val}"`;
            }).join(';') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename + '.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    },

    /**
     * Print a specific section
     */
    printReport(contentHtml, title) {
        const win = window.open('', '_blank');
        win.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 32px; color: #111; min-height: 100vh; display: flex; flex-direction: column; }
                    h1 { font-size: 1.5rem; margin-bottom: 8px; }
                    h2 { font-size: 1.1rem; margin: 24px 0 12px; color: #444; }
                    .report-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6366f1; }
                    .report-date { font-size: 0.85rem; color: #666; }
                    .report-content { flex: 1; }
                    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem; }
                    th { background: #f0f0ff; padding: 10px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
                    td { padding: 10px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background: #fafafa; }
                    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                    .badge-atrasada { background: #fee; color: #c00; }
                    .badge-emdia { background: #efe; color: #060; }
                    .badge-concluida { background: #f0f0ff; color: #6366f1; }
                    .badge-pendente { background: #eef; color: #33f; }
                    .stat-box { display: inline-block; padding: 12px 20px; margin: 4px; background: #f5f5ff; border-radius: 8px; text-align: center; }
                    .stat-box .value { font-size: 1.8rem; font-weight: 700; color: #6366f1; }
                    .stat-box .label { font-size: 0.7rem; color: #666; text-transform: uppercase; }
                    .report-footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #6366f1; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #666; }
                    .report-footer-brand { font-weight: 700; color: #6366f1; font-size: 1rem; }
                    .report-footer-dev { text-align: right; }
                    .report-footer-dev strong { color: #333; }
                    @media print {
                        body { padding: 16px; }
                        .report-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 32px; background: white; }
                    }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>StartWeb — ${title}</h1>
                    <div class="report-date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
                </div>
                <div class="report-content">
                    ${contentHtml}
                </div>
                <div class="report-footer">
                    <div>
                        <span class="report-footer-brand">StartWeb</span>
                        <span> — Sistema de Gerenciamento de Tarefas</span>
                    </div>
                    <div class="report-footer-dev">
                        <div>Desenvolvido por <strong>Roberto Ursine</strong></div>
                        <div>📞 (11) 98285-6216</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => win.print(), 500);
    }
};
