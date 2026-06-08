# KERBERUS — F1 Intelligence Platform

Plataforma de gestão de corredores e análise de resultados de corridas.

## 📁 Estrutura do Projeto (Consolidada)

```
api-do-gui/
├── src/                          # Código backend
│   ├── app.js                    # Configuração express e rotas principais
│   ├── db.js                     # Conexão com banco de dados
│   └── routes/
│       ├── users.js              # Rotas de autenticação (POST, GET)
│       └── corredores.js         # Rotas de corredores (CRUD, ranking, estatísticas)
│
├── public/                       # Arquivos frontend (HTML, CSS, JS)
│   ├── login.html                # Página de autenticação
│   ├── cadastro.html             # Página de criação de conta
│   ├── dashboard.html            # Dashboard principal
│   ├── corredores.html           # Gestão de corredores
│   ├── ranking.html              # Ranking de pilotos
│   ├── estatísticas.html         # Estatísticas detalhadas
│   ├── sidebar.js                # Componente de navegação (injetado em todas as páginas)
│   └── style.css                 # Estilos globais (tema dark F1)
│
├── sql/
│   └── DDL.sql                   # Schema do banco de dados (MySQL)
│
├── server.js                     # Ponto de entrada da aplicação
├── package.json                  # Dependências do projeto
├── .env                          # Variáveis de ambiente
└── README.md                     # Este arquivo

```

## 🚀 Como Executar

### 1. Instalação de Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Execute o script SQL para criar o schema:
```bash
mysql -u root -p < sql/DDL.sql
```

### 3. Configurar Variáveis de Ambiente
O arquivo `.env` já está configurado com valores padrão:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=corrida_db
DB_PORT=3307
JWT_SECRET=idev4_secret_key
```

### 4. Iniciar o Servidor
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 📡 API Endpoints

### Users (Autenticação)
- `GET /api/users` — Listar todos os usuários
- `POST /api/users` — Criar novo usuário
- `POST /api/users/login` — Autenticar usuário

### Corredores (Gestão)
- `GET /api/corredores/cadastrados` — Listar corredores cadastrados
- `POST /api/corredores` — Criar novo corredor
- `PUT /api/corredores/:id` — Atualizar corredor
- `DELETE /api/corredores/:id` — Deletar corredor

### Corredores (Estatísticas)
- `GET /api/corredores/melhor-volta` — Melhor tempo registrado
- `GET /api/corredores/tempo-total` — Tempo total por corredor
- `GET /api/corredores/voltas` — Total de voltas por corredor
- `GET /api/corredores/ranking` — Ranking geral dos corredores

## 🗄️ Banco de Dados

### Tabelas
- **users** — Administradores do sistema
- **corredores** — Dados dos pilotos
- **corridas** — Registro de tempos e voltas

## 🎨 Design

Interface moderna com tema **Dark Formula 1**:
- Cores: Vermelho (#E8001D), Branco, Preto
- Tipografia: Barlow Condensed (títulos), Barlow (corpo)
- Responsivo e mobile-first

## 📝 Informações Consolidadas

✅ **Apenas código backend presente** — Frontend está integrado na pasta `public/`
✅ **Estrutura coesa** — Todas as dependências e arquivos organizados
✅ **Pronto para produção** — Configuração de ambiente completa
✅ **Bem documentado** — Comentários nas rotas e padrão claro

---

**Desenvolvido para análise de dados de F1**
