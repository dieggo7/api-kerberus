# api-kerberus — Backend KERBERUS

API REST do sistema **KERBERUS**, responsável por autenticação de usuários, gerenciamento de pilotos e processamento dos resultados de corridas.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| **Node.js** | — | Ambiente de execução JavaScript |
| **Express** | ^5.2.1 | Framework HTTP para criação das rotas REST |
| **MySQL2** | ^3.20.0 | Driver de conexão com o banco de dados MySQL |
| **bcrypt** | ^6.0.0 | Hash seguro de senhas (salt rounds: 10) |
| **jsonwebtoken** | ^9.0.3 | Geração e validação de tokens JWT |
| **dotenv** | ^17.3.1 | Carregamento de variáveis de ambiente via `.env` |
| **cors** | ^2.8.5 | Habilitação de requisições cross-origin |
| **nodemon** | ^3.1.14 | Reinicialização automática do servidor em desenvolvimento |

> Banco de dados: **MySQL** — schema `corrida_db`, gerado via script DDL no MySQL Workbench.

---

## Estrutura do Sistema

```
api-do-gui/
├── server.js            # Ponto de entrada — inicializa o servidor na porta configurada
├── app.js               # Configuração do Express: middlewares, rotas e arquivos estáticos
├── db.js                # Conexão com o MySQL via mysql2
├── dot.env              # Variáveis de ambiente (não versionado)
├── env.exemplo          # Modelo do arquivo .env para novos desenvolvedores
├── package.json         # Dependências e scripts do projeto
│
├── routes/
│   ├── users.js         # Rotas de usuários: cadastro e login
│   └── corredores.js    # Rotas de corredores: CRUD + consultas de corridas
│
├── sql/
│   └── DDL.sql          # Script de criação do banco de dados e tabelas
│
└── public/              # Frontend estático servido pelo próprio Express
    ├── login.html
    ├── cadastro.html
    ├── dashboard.html
    ├── corredores.html
    ├── ranking.html
    ├── estatisticas.html
    ├── sidebar.js
    └── style.css
```

### Banco de Dados — `corrida_db`

```
┌──────────────┐          ┌──────────────────┐          ┌───────────────────┐
│    users     │          │   corredores     │          │     corridas      │
├──────────────┤          ├──────────────────┤          ├───────────────────┤
│ id (PK)      │          │ id (PK)          │◄─────────│ corredores_id(FK) │
│ nome         │          │ nome             │          │ id (PK)           │
│ email        │          │ turma            │          │ tempo DECIMAL     │
│ senha (hash) │          │ senha (hash)     │          │ voltas INT        │
└──────────────┘          └──────────────────┘          └───────────────────┘
```

### Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com base em `env.exemplo`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=corrida_db
DB_PORT=3307
```

---

## Funcionalidades Implementadas

### Inicialização e Configuração (`server.js` / `app.js`)

- Servidor HTTP via Express escutando na porta definida em `PORT` (padrão: `3000`)
- Parsing de JSON e URL-encoded nos bodies das requisições
- CORS habilitado para qualquer origem (`*`)
- Arquivos estáticos do frontend servidos diretamente pelo Express a partir de `../front-api`
- Rota raiz `GET /` redireciona para `login.html`

---

### Rotas de Usuários — `/api/users`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/users` | Lista todos os usuários cadastrados |
| `POST` | `/api/users` | Cadastra novo usuário com senha hasheada |
| `POST` | `/api/users/login` | Autentica usuário e retorna token JWT |

**Detalhes de implementação:**

- **Cadastro (`POST /api/users`):** valida campos obrigatórios (`nome`, `email`, `senha`), aplica `bcrypt.hash` com 10 salt rounds antes de persistir no banco. Retorna o `id` do registro criado com status `201`.

- **Login (`POST /api/users/login`):** busca o usuário pelo `email`, compara a senha com `bcrypt.compare`, e em caso de sucesso gera um **token JWT** com validade de **24 horas**, assinado com `JWT_SECRET` (variável de ambiente). O token carrega `id`, `email` e `nome` no payload. Retorna o token e os dados básicos do usuário.

---

### Rotas de Corredores — `/api/corredores`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/corredores` | Lista todos os corredores |
| `GET` | `/api/corredores/cadastrados` | Lista corredores (alias para compatibilidade com o frontend) |
| `POST` | `/api/corredores` | Cadastra novo corredor com senha hasheada |
| `PUT` | `/api/corredores/:id` | Atualiza dados de um corredor |
| `DELETE` | `/api/corredores/:id` | Remove um corredor pelo ID |
| `GET` | `/api/corredores/melhor-volta` | Retorna o corredor com o menor tempo registrado |
| `GET` | `/api/corredores/tempo-total` | Ranking por soma de tempos (menor primeiro) |
| `GET` | `/api/corredores/voltas` | Total de voltas acumuladas por corredor |
| `GET` | `/api/corredores/ranking` | Ranking geral: nome, turma e soma de tempos |

**Detalhes de implementação:**

- **Cadastro e Edição:** a senha do corredor também é hasheada com `bcrypt` (10 rounds) antes de ser salva. A edição (`PUT`) atualiza nome, turma e senha; retorna `404` se o ID não existir.

- **Remoção:** retorna `404` com mensagem de erro caso o corredor não seja encontrado via `affectedRows === 0`.

- **Melhor volta (`GET /melhor-volta`):** faz `JOIN` entre `corredores` e `corridas`, ordenando por `tempo ASC` com `LIMIT 1` — retorna o nome do corredor e o tempo da volta mais rápida de toda a competição.

- **Tempo total (`GET /tempo-total`):** agrupa todas as corridas por corredor (`GROUP BY`) e soma os tempos com `SUM(corridas.tempo)`, ordenando do menor para o maior tempo acumulado.

- **Voltas (`GET /voltas`):** mesmo padrão do tempo total, mas agrega `SUM(corridas.voltas)` por corredor.

- **Ranking (`GET /ranking`):** combina nome, turma e soma de tempos — é o endpoint principal consumido pelas páginas de Ranking e Dashboard do frontend.

---

### Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco de dados
# Execute o script sql/DDL.sql no seu cliente MySQL

# 3. Configurar variáveis de ambiente
cp env.exemplo .env
# Edite o .env com suas credenciais

# 4. Iniciar o servidor (com hot-reload)
npm start
```

O servidor estará disponível em `http://localhost:3000`.
