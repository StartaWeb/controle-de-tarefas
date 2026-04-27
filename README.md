# 📋 StartWeb — Sistema de Gerenciamento de Tarefas

Sistema web para controle de tarefas por setor, com sincronização em nuvem via Firebase Firestore.

---

## 🌐 Acesso ao Sistema

| Recurso | Link |
|---|---|
| **Aplicação (produção)** | https://startaweb.github.io/controle-de-tarefas/ |
| **Repositório GitHub** | https://github.com/StartaWeb/controle-de-tarefas |

> 🔒 Os links do Console Firebase e credenciais são mantidos em documento interno separado.

---

## 🗄️ Banco de Dados

### Provedor
**Firebase Firestore** (Google Cloud) — Plano Blaze (pay-as-you-go com tier gratuito)

### Projeto Firebase
- **Project ID:** `startweb-tarefas` (ver credenciais internas)
- **Região:** `us-central1`

> ⚠️ **Segurança:** A API Key está no código público. Para proteger o banco:
> 1. Restrinja a API Key ao domínio `https://startaweb.github.io/*` no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
> 2. Renove as regras do Firestore a cada 30 dias

### Estrutura das Coleções

```
startweb_data/              ← Coleção principal
├── setores                 ← Documento: lista de setores
│   └── items: [ { id, nome, cor, icone } ]
├── pessoas                 ← Documento: lista de colaboradores
│   └── items: [ { id, nome, cargo, setor, criadoEm } ]
└── tarefas                 ← Documento: lista de tarefas
    └── items: [ { id, titulo, descricao, setor, responsavel, prazo, prioridade, status, criadoEm } ]
```

### Regras de Segurança (Firestore Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /startweb_data/{document} {
      allow read, write: if true;  // Modo de teste — válido por 30 dias
    }
  }
}
```
> ⚠️ Renovar as regras após 30 dias no [Console Firebase → Regras](https://console.firebase.google.com/project/startweb-tarefas/firestore/rules)

---

## 🚀 Deploy

O deploy é automático via **GitHub Pages**:

1. Faça as alterações no código
2. Execute no terminal:
   ```bash
   git add .
   git commit -m "descrição da alteração"
   git push origin main
   ```
3. Aguarde ~2 minutos
4. Acesse: https://startaweb.github.io/controle-de-tarefas/

---

## 📁 Estrutura de Arquivos

```
controle-de-tarefas/
├── index.html              ← Página principal (estrutura HTML)
├── css/
│   └── style.css           ← Estilos (tema escuro, componentes)
├── js/
│   ├── firebase-db.js      ← Configuração Firebase + operações Firestore
│   ├── data.js             ← Camada de dados (LocalStorage + Firebase sync)
│   ├── app.js              ← Inicialização e roteamento
│   ├── utils.js            ← Funções utilitárias (toast, modal, datas)
│   ├── dashboard.js        ← Página: Dashboard e estatísticas
│   ├── tarefas.js          ← Página: Gerenciamento de tarefas
│   ├── pessoas.js          ← Página: Gerenciamento de colaboradores
│   ├── setores.js          ← Página: Gerenciamento de setores
│   └── relatorios.js       ← Página: Relatórios e exportação
└── README.md               ← Esta documentação
```

---

## ⚙️ Arquitetura de Dados

```
Abertura do app
      ↓
LocalStorage (instantâneo)  ←── Dados sempre disponíveis offline
      ↓
App renderiza imediatamente
      ↓
Firebase sync em background (8s timeout)
      ├─ Firebase OK → 🟢 Verde — dados sincronizados na nuvem
      └─ Firebase offline → 🔴 Vermelho — continua com dados locais
```

**Escrita de dados:**
- Salva no **LocalStorage** (imediato, síncrono)
- Salva no **Firestore** em background (assíncrono)

**Indicador no sidebar:**
| Cor | Significado |
|---|---|
| 🟡 Amarelo piscando | Sincronizando com Firebase |
| 🟢 Verde pulsando | Firebase conectado |
| 🔴 Vermelho | Firebase indisponível — dados locais |

---

## 🔧 Funcionalidades

| Módulo | Função |
|---|---|
| **Dashboard** | Visão geral: total de tarefas, atrasadas, concluídas, alertas |
| **Tarefas** | Criar, editar, excluir, filtrar por setor/pessoa/status/prioridade |
| **Colaboradores** | Cadastro de pessoas vinculadas a setores |
| **Setores** | Criação de setores com cor e ícone personalizados |
| **Relatórios** | Exportação CSV, impressão, gráficos por setor e pessoa |

---

## 💰 Custo do Firebase

**Plano Blaze** (ativado) — Inclui tier gratuito:

| Operação | Limite gratuito/dia | Uso estimado |
|---|---|---|
| Leituras | 50.000 | ~300/dia |
| Gravações | 20.000 | ~50/dia |
| Armazenamento | 1 GB | < 1 MB |
| **Custo mensal** | **R$ 0,00** | ✅ |

---

## 👨‍💻 Desenvolvedor

**Roberto Ursine**
📞 (11) 98285-6216

**Empresa:** StartWeb
**Repositório:** https://github.com/StartaWeb/controle-de-tarefas
