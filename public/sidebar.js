// sidebar.js — injeta a sidebar em todas as páginas com layout principal
// Uso: <div id="sidebar-root"></div> + <script src="sidebar.js"></script>

function renderSidebar(activePage) {
  const links = [
    { href: 'dashboard.html',   icon: '◈', label: 'Dashboard',    id: 'dashboard'   },
    { href: 'corredores.html',  icon: '◉', label: 'Corredores',   id: 'corredores'  },
    { href: 'ranking.html',     icon: '◆', label: 'Ranking',       id: 'ranking'     },
    { href: 'estatísticas.html',icon: '◇', label: 'Estatísticas', id: 'estatisticas'},
  ];

  const nav = links.map(l => `
    <a href="${l.href}" class="nav-item ${activePage === l.id ? 'active' : ''}">
      <span class="nav-icon">${l.icon}</span>${l.label}
    </a>
  `).join('');

  const html = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">KER<span>BE</span>RUS</div>
        <div class="logo-sub">F1 Intelligence</div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-label">Menu</div>
        ${nav}
      </nav>
      <div class="sidebar-footer">
        <a href="login.html">⎋ &nbsp;Sair</a>
      </div>
    </aside>
  `;

  const root = document.getElementById('sidebar-root');
  if (root) root.innerHTML = html;
}