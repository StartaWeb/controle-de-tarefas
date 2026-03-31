# Startweb — Sistema de Gerenciamento de Tarefas

Sistema web para gerenciamento de tarefas por setor, com controle de prazos, pessoas e produtividade.

## 🚀 Funcionalidades

### Dashboard
- Cards com estatísticas gerais (total, em dia, atrasadas, concluídas)
- Progresso por setor com barras visuais
- Alertas de tarefas atrasadas e próximas do vencimento
- Tarefas recentes

### Gestão de Tarefas
- Criar, editar e excluir tarefas
- Atribuir responsável e setor
- Definir prazos e prioridades (Alta, Média, Baixa)
- Status: Pendente → Em Andamento → Concluída
- Detecção automática de atrasos
- Filtros por setor, responsável, status e prioridade

### Gestão de Pessoas
- Cadastro de colaboradores com nome, cargo e setor
- Visualização de carga de trabalho individual
- Estatísticas por pessoa (ativas, atrasadas, concluídas)

### Gestão de Setores
- Setores padrão: RH, Financeiro, Administrativo, Operacional, Comercial
- Criar setores personalizados com cor e ícone
- Progresso de conclusão por setor

### Relatórios
- **Relatório Geral** — Todas as tarefas com status e prazos (PDF)
- **Relatório por Setor** — Agrupado por departamento (PDF)
- **Relatório por Pessoa** — Produtividade individual (PDF)
- **Tarefas Atrasadas** — Lista detalhada de atrasos (PDF)
- **Exportar CSV** — Tarefas e pessoas para Excel

## 🛠️ Tecnologias

- HTML5 + CSS3 + JavaScript (Vanilla)
- LocalStorage para persistência de dados
- Sem dependências externas
- Compatível com GitHub Pages

## 📁 Estrutura

```
ProjetoSeleste/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── dashboard.js
│   ├── pessoas.js
│   ├── tarefas.js
│   ├── setores.js
│   ├── relatorios.js
│   └── utils.js
└── README.md
```

## 📖 Como Usar

1. Abra o arquivo `index.html` no navegador
2. Cadastre seus setores (já vem com 5 padrão)
3. Adicione colaboradores e atribua a setores
4. Crie tarefas com prazos e responsáveis
5. Acompanhe tudo pelo Dashboard

## 👤 Autor Roberto Ursine

**StartaWeb**  
📞 (11) 99999-9999  
📧 contato@startaweb.com.br

> Projeto criado com **Google Antigravity** 🚀
