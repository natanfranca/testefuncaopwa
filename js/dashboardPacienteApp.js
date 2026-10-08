/**
 * Dashboard Paciente — Cuidado Puro (dados em localStorage)
 */
const STORAGE = {
  auth: "cp_patient_auth",
  agenda: "cp_patient_agenda",
  favorites: "cp_patient_favorites",
  history: "cp_patient_history",
  messages: "cp_patient_messages",
  reviews: "cp_patient_reviews",
  payments: "cp_patient_payments",
  settings: "cp_patient_settings"
};

const VALID_PASSWORDS = ["cuidado123", "admin123"];

const DEFAULT_SETTINGS = {
  name: "Ana Lúcia",
  phone: "",
  email: "",
  city: "São Paulo, SP"
};

function nextDay(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const DEFAULT_AGENDA = [
  { id: "a1", date: nextDay(1), time: "09:00", caregiver: "Mariana Silva", type: "Acompanhamento matinal", phone: "", notes: "", createdAt: new Date().toISOString() },
  { id: "a2", date: nextDay(3), time: "14:30", caregiver: "João Pedro", type: "Medicação e curativo", phone: "", notes: "", createdAt: new Date().toISOString() }
];

const DEFAULT_FAVORITES = [
  { id: "f1", name: "Mariana Silva", specialty: "Cuidados domiciliares · Idosos", phone: "(11) 98765-4321", city: "São Paulo", notes: "Atenciosa e pontual", createdAt: new Date().toISOString() },
  { id: "f2", name: "João Pedro", specialty: "Pós-operatório · Curativos", phone: "", city: "São Paulo", notes: "Muito profissional", createdAt: new Date().toISOString() }
];

const DEFAULT_HISTORY = [
  { id: "h1", caregiver: "Mariana Silva", date: nextDay(-5), type: "Plantão 12h", duration: "12h · R$ 280", notes: "Excelente atendimento", createdAt: new Date().toISOString() },
  { id: "h2", caregiver: "João Pedro", date: nextDay(-12), type: "Visita domiciliar", duration: "3h · R$ 150", notes: "Curativo bem feito", createdAt: new Date().toISOString() },
  { id: "h3", caregiver: "Mariana Silva", date: nextDay(-20), type: "Acompanhamento", duration: "4h · R$ 180", notes: "", createdAt: new Date().toISOString() }
];

const DEFAULT_REVIEWS = [
  { id: "v1", name: "Mariana Silva", rating: 5, text: "Atendimento atencioso e pontual. Recomendo!", createdAt: new Date().toISOString() },
  { id: "v2", name: "João Pedro", rating: 4.8, text: "Muito profissional e cuidadoso.", createdAt: new Date().toISOString() }
];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function ensureDefaults() {
  if (!localStorage.getItem(STORAGE.agenda)) write(STORAGE.agenda, DEFAULT_AGENDA);
  if (!localStorage.getItem(STORAGE.favorites)) write(STORAGE.favorites, DEFAULT_FAVORITES);
  if (!localStorage.getItem(STORAGE.history)) write(STORAGE.history, DEFAULT_HISTORY);
  if (!localStorage.getItem(STORAGE.messages)) write(STORAGE.messages, [
    { id: "m1", name: "Mariana Silva", phone: "(11) 98765-4321", email: "", message: "Confirmado o horário de amanhã às 9h.", createdAt: new Date().toISOString(), read: false },
    { id: "m2", name: "João Pedro", phone: "", email: "joao@email.com", message: "Obrigado pela preferência. Até a próxima visita!", createdAt: new Date().toISOString(), read: true }
  ]);
  if (!localStorage.getItem(STORAGE.reviews)) write(STORAGE.reviews, DEFAULT_REVIEWS);
  if (!localStorage.getItem(STORAGE.payments)) write(STORAGE.payments, [
    { id: "pay1", caregiver: "Mariana Silva", value: 280, date: new Date().toISOString().slice(0, 10), status: "pago", desc: "Plantão 12h", createdAt: new Date().toISOString() },
    { id: "pay2", caregiver: "João Pedro", value: 150, date: new Date().toISOString().slice(0, 10), status: "pendente", desc: "Visita domiciliar", createdAt: new Date().toISOString() }
  ]);
  if (!localStorage.getItem(STORAGE.settings)) write(STORAGE.settings, DEFAULT_SETTINGS);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function refreshIcons() {
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

/* ---------- Sidebar Responsiva (Abrir e Fechar) ---------- */
function toggleSidebar() {
  const app = document.getElementById("app");
  if (app) app.classList.toggle("sidebar-open");
}

function closeSidebar() {
  const app = document.getElementById("app");
  if (app) app.classList.remove("sidebar-open");
}

/* ---------- Auth ---------- */
function isLoggedIn() {
  return localStorage.getItem(STORAGE.auth) === "1";
}

function showApp(show) {
  const loginScreen = document.getElementById("login-screen");
  const appScreen = document.getElementById("app");
  
  if (loginScreen && appScreen) {
    if (show) {
      loginScreen.style.display = "none";
      appScreen.style.display = "flex";
      loginScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      refreshAll();
    } else {
      loginScreen.style.display = "flex";
      appScreen.style.display = "none";
      loginScreen.classList.remove("hidden");
      appScreen.classList.add("hidden");
    }
  }
}

function login(e) {
  if (e) e.preventDefault();
  
  const passEl = document.getElementById("login-pass");
  const err = document.getElementById("login-error");
  if (!passEl) return;
  
  const pass = passEl.value.trim();
  if (VALID_PASSWORDS.includes(pass)) {
    localStorage.setItem(STORAGE.auth, "1");
    if (err) err.textContent = "";
    showApp(true);
  } else {
    if (err) err.textContent = "Senha incorreta. Tente 'cuidado123' ou 'admin123'.";
  }
}

function logout() {
  localStorage.removeItem(STORAGE.auth);
  showApp(false);
}

/* ---------- Navigation ---------- */
function switchPanel(panel) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === panel);
  });
  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.toggle("active", p.id === "panel-" + panel);
  });
  const active = document.querySelector('.nav-item[data-panel="' + panel + '"]');
  if (active) {
    const titleEl = document.getElementById("panel-title");
    if (titleEl) titleEl.textContent = active.dataset.label || panel;
  }
  refreshIcons();
}

/* ---------- Renderers ---------- */
function refreshAll() {
  renderOverview();
  renderAgenda();
  renderFavorites();
  renderHistory();
  renderMessages();
  renderReviews();
  renderPayments();
  refreshIcons();
}

function renderOverview() {
  const agenda = read(STORAGE.agenda, []);
  const favorites = read(STORAGE.favorites, []);
  const history = read(STORAGE.history, []);
  const reviews = read(STORAGE.reviews, []);

  const stAgenda = document.getElementById("stat-agenda");
  const stFav = document.getElementById("stat-favorites");
  const stHist = document.getElementById("stat-history");
  const stRating = document.getElementById("stat-rating");

  if (stAgenda) stAgenda.textContent = agenda.length;
  if (stFav) stFav.textContent = favorites.length;
  if (stHist) stHist.textContent = history.length;

  if (stRating) {
    if (reviews.length) {
      const avg = reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
      stRating.textContent = avg.toFixed(1).replace(".", ",");
    } else {
      stRating.textContent = "—";
    }
  }

  const boxA = document.getElementById("overview-agenda");
  if (boxA) {
    const sorted = agenda.slice().sort((a, b) => ((a.date || "") + (a.time || "")).localeCompare((b.date || "") + (b.time || ""))).slice(0, 5);
    boxA.innerHTML = !sorted.length ? '<p class="empty">Nada na agenda.</p>' : sorted.map((a) => `
      <div class="msg-item">
        <div class="msg-meta"><span>${escapeHtml([a.date, a.time].filter(Boolean).join(" · "))}</span></div>
        <h4>${escapeHtml(a.caregiver || "Cuidador")} — ${escapeHtml(a.type || "Cuidado")}</h4>
        <p>${escapeHtml(a.notes || "")}</p>
      </div>`).join("");
  }

  const boxF = document.getElementById("overview-favorites");
  if (boxF) {
    const topFav = favorites.slice(0, 5);
    boxF.innerHTML = !topFav.length ? '<p class="empty">Nenhum favorito.</p>' : topFav.map((f) => `
      <div class="msg-item">
        <div class="msg-meta"><span>${escapeHtml(f.specialty || "")}</span></div>
        <h4>${escapeHtml(f.name || "Cuidador")}</h4>
        <p>${escapeHtml(f.notes || "")}</p>
      </div>`).join("");
  }

  const boxH = document.getElementById("overview-history");
  if (boxH) {
    const topHist = history.slice(0, 5);
    boxH.innerHTML = !topHist.length ? '<p class="empty">Nenhum histórico.</p>' : topHist.map((h) => `
      <div class="msg-item">
        <div class="msg-meta"><span>${escapeHtml(h.date || "")}${h.duration ? " · " + escapeHtml(h.duration) : ""}</span></div>
        <h4>${escapeHtml(h.caregiver || "Cuidador")} — ${escapeHtml(h.type || "")}</h4>
        <p>${escapeHtml(h.notes || "")}</p>
      </div>`).join("");
  }
}

function renderAgenda() {
  const list = read(STORAGE.agenda, []);
  const box = document.getElementById("agenda-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum agendamento registrado.</p>';
    return;
  }
  box.innerHTML = list.map((a) => `
    <div class="msg-item" data-id="${a.id}">
      <div class="msg-meta"><span>${escapeHtml([a.date, a.time].filter(Boolean).join(" · "))}</span></div>
      <h4>${escapeHtml(a.caregiver || "Cuidador")} — ${escapeHtml(a.type || "Cuidado")}</h4>
      <p>${escapeHtml(a.notes || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.agenda, list.filter((x) => x.id !== id));
      renderAgenda();
      renderOverview();
    });
  });
}

function renderFavorites() {
  const list = read(STORAGE.favorites, []);
  const box = document.getElementById("favorites-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum favorito adicionado.</p>';
    return;
  }
  box.innerHTML = list.map((f) => `
    <div class="msg-item" data-id="${f.id}">
      <div class="msg-meta"><span>${escapeHtml(f.specialty || "")}${f.city ? " · " + escapeHtml(f.city) : ""}</span></div>
      <h4>${escapeHtml(f.name || "Cuidador")}</h4>
      <p>${escapeHtml(f.notes || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.favorites, list.filter((x) => x.id !== id));
      renderFavorites();
      renderOverview();
    });
  });
}

function renderHistory() {
  const list = read(STORAGE.history, []);
  const box = document.getElementById("history-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum histórico registrado.</p>';
    return;
  }
  box.innerHTML = list.map((h) => `
    <div class="msg-item" data-id="${h.id}">
      <div class="msg-meta"><span>${escapeHtml(h.date || "")}${h.duration ? " · " + escapeHtml(h.duration) : ""}</span></div>
      <h4>${escapeHtml(h.caregiver || "Cuidador")} — ${escapeHtml(h.type || "")}</h4>
      <p>${escapeHtml(h.notes || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.history, list.filter((x) => x.id !== id));
      renderHistory();
      renderOverview();
    });
  });
}

function renderMessages() {
  const list = read(STORAGE.messages, []);
  const box = document.getElementById("messages-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma mensagem.</p>';
    return;
  }
  box.innerHTML = list.map((m) => `
    <div class="msg-item ${m.read ? "" : "unread"}">
      <div class="msg-meta">
        <span>${escapeHtml(m.name || "Cuidador")}${m.phone ? " · " + escapeHtml(m.phone) : ""}</span>
        <span>${formatDate(m.createdAt)}</span>
      </div>
      <p>${escapeHtml(m.message || "")}</p>
    </div>`).join("");
}

function renderReviews() {
  const list = read(STORAGE.reviews, []);
  const box = document.getElementById("reviews-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma avaliação realizada.</p>';
    return;
  }
  box.innerHTML = list.map((r) => `
    <div class="msg-item">
      <div class="msg-meta">
        <span>Nota: ${escapeHtml(String(r.rating || ""))} ★</span>
        <span>${formatDate(r.createdAt)}</span>
      </div>
      <h4>${escapeHtml(r.name || "Cuidador")}</h4>
      <p>${escapeHtml(r.text || "")}</p>
    </div>`).join("");
}

function renderPayments() {
  const list = read(STORAGE.payments, []);
  const box = document.getElementById("payments-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum registro de pagamento.</p>';
    return;
  }
  box.innerHTML = list.map((p) => `
    <div class="msg-item ${p.status}">
      <div class="msg-meta">
        <span>${escapeHtml(p.date || "")} · Status: ${escapeHtml(p.status || "")}</span>
        <span>R$ ${Number(p.value || 0).toFixed(2)}</span>
      </div>
      <h4>${escapeHtml(p.caregiver || "Cuidador")}</h4>
      <p>${escapeHtml(p.desc || "")}</p>
    </div>`).join("");
}

/* ---------- Inicialização dos Eventos ---------- */
document.addEventListener("DOMContentLoaded", () => {
  ensureDefaults();

  // Eventos de Autenticação
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const passInput = document.getElementById("login-pass");
  if (passInput) {
    passInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") login(e);
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Eventos para Menu Lateral Responsivo
  const toggleBtn = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // Navegação no Sidebar (Troca de ecrã e recolhe o menu no mobile)
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.panel) {
        switchPanel(btn.dataset.panel);
        closeSidebar();
      }
    });
  });

  // Formulário Agenda
  const addAg = document.getElementById("add-agenda");
  if (addAg) addAg.addEventListener("click", () => {
    const wrap = document.getElementById("agenda-form-wrap");
    if (wrap) wrap.classList.remove("hidden");
  });
  const cancelAg = document.getElementById("cancel-agenda");
  if (cancelAg) cancelAg.addEventListener("click", () => {
    const wrap = document.getElementById("agenda-form-wrap");
    if (wrap) wrap.classList.add("hidden");
  });

  // Checar Login
  if (isLoggedIn()) showApp(true);
  else showApp(false);

  refreshIcons();
});
