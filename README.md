# KERBERUS — Formula 1 Intelligence · Frontend

Interface web do sistema **KERBERUS**, plataforma de gerenciamento e acompanhamento de resultados de corridas no estilo Formula 1.

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura de todas as páginas |
| **CSS3** | Estilização global via `style.css` com variáveis CSS customizadas |
| **JavaScript (Vanilla ES6+)** | Lógica de interação, chamadas à API e renderização dinâmica |
| **Fetch API** | Comunicação assíncrona com o backend REST |
| **localStorage** | Persistência de sessão do usuário (token JWT e dados do usuário) |

> Projeto **100% client-side**, sem frameworks ou dependências externas. Não há `package.json`, bundler ou processo de build — os arquivos são servidos diretamente pelo backend.

---

## Estrutura do Sistema

```
front-api/
├── login.html           # Tela de autenticação
├── cadastro.html        # Tela de criação de conta
├── dashboard.html       # Visão geral do campeonato
├── corredores.html      # Gerenciamento de pilotos
├── ranking.html         # Classificação geral
├── estatisticas.html    # Estatísticas e visualizações
├── sidebar.js           # Componente de navegação lateral (compartilhado)
└── style.css            # Estilos globais (design system)
```

### Fluxo de Navegação

```
login.html ──→ dashboard.html
    │               │
cadastro.html   corredores.html
                ranking.html
                estatisticas.html
```

### Componente Compartilhado — `sidebar.js`

O arquivo `sidebar.js` é injetado em todas as páginas com layout principal. Ele é responsável por:

- Renderizar a sidebar de navegação com o item ativo destacado (`renderSidebar(activePage)`)
- Exibir o nome e avatar do usuário logado na topbar
- Gerenciar o modal de **troca de usuário** sem necessidade de logout (`setupChangeUserModal()`)

### Endpoints de API Consumidos

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/users/login` | Autenticação do usuário |
| `POST` | `/api/users` | Cadastro de novo usuário |
| `GET` | `/api/corredores` | Lista todos os corredores |
| `POST` | `/api/corredores` | Cadastra novo corredor |
| `PUT` | `/api/corredores/:id` | Atualiza dados de um corredor |
| `DELETE` | `/api/corredores/:id` | Remove um corredor |
| `GET` | `/api/corredores/ranking` | Ranking geral por tempo acumulado |
| `GET` | `/api/corredores/melhor-volta` | Retorna a melhor volta registrada |
| `GET` | `/api/corredores/cadastrados` | Lista corredores (usada em Estatísticas) |
| `GET` | `/api/estatisticas` | Resumo geral (corridas, melhor tempo) |
| `GET` | `/api/estatisticas/ranking` | Ranking com pontos/vitórias por corredor |

---

## Funcionalidades Implementadas

### Autenticação (`login.html` / `cadastro.html`)

- Login com e-mail e senha via `POST /api/users/login`
- Armazenamento do token JWT e dados do usuário no `localStorage`
- Cadastro de novo usuário com validação de senha e confirmação
- Redirecionamento automático para o dashboard após login

### Dashboard (`dashboard.html`)

- Cards de resumo: total de corredores, corridas realizadas, turmas participantes e melhor volta
- Tabela com o **Top 5** do ranking geral
- Carregamento assíncrono dos dados ao abrir a página

### Gerenciamento de Corredores (`corredores.html`)

- Listagem completa de pilotos cadastrados
- **Busca em tempo real** por nome ou turma (filtro client-side)
- **CRUD completo** via modal:
  - Criar novo corredor (nome, turma, senha)
  - Editar corredor existente
  - Remover corredor com confirmação
- Modal fecha ao clicar fora ou no botão de cancelar

### Ranking (`ranking.html`)

- Classificação geral de todos os corredores por **menor tempo total acumulado**
- Destaque visual para os 3 primeiros colocados
- Carregamento via `GET /api/corredores/ranking`

### Estatísticas (`estatisticas.html`)

- **4 cards de resumo**: total de corredores, corridas realizadas, turmas ativas e melhor tempo registrado
- **Pódio visual** com os 3 primeiros colocados (layout estilo F1: 2º–1º–3º)
- **Ranking completo** em tabela com posições destacadas
- **Gráfico de barras** horizontal com vitórias/pontos por corredor (top 8, com animação CSS)
- **Grid de turmas** mostrando a quantidade de pilotos por turma
- Banner de erro exibido quando algum endpoint falha (com fallback gracioso)
- Botão de **atualizar** dados manualmente na topbar

### Navegação e UX (global)

- Sidebar responsiva injetada via JavaScript com item ativo destacado
- **Modal de troca de usuário** acessível pelo clique no avatar no topo — permite logar com outra conta sem sair da página
- Estados vazios (`empty-state`) amigáveis em todas as tabelas
- Skeleton/shimmer de carregamento na página de Estatísticas
- Design system coerente com variáveis CSS (`--red`, `--black`, `--white`, `--muted`, `--border`)