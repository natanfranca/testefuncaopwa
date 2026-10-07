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

// Aceita tanto a senha de paciente quanto a de admin para facilidade
const VALID_PASSWORDS = ["cuidado123", "admin123"];

const DEFAULT_SETTINGS = {
  name: "Ana Lúcia",
  phone: "",
  email: "",
  city: "São Paulo, SP"
};

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

function nextDay(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

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

function login() {
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

/* ---------- Overview ---------- */
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

  // Agenda preview
  const boxA = document.getElementById("overview-agenda");
  if (boxA) {
    const sorted = agenda.slice().sort((a, b) => ((a.date || "") + (a.time || "")).localeCompare((b.date || "") + (b.time || ""))).slice(0, 5);
    if (!sorted.length) {
      boxA.innerHTML = '<p class="empty">Nada na agenda.</p>';
    } else {
      boxA.innerHTML = sorted.map((a) => {
        const when = [a.date, a.time].filter(Boolean).join(" · ");
        return `<div class="msg-item">
          <div class="msg-meta"><span>${escapeHtml(when)}</span></div>
          <h4>${escapeHtml(a.caregiver || "Cuidador")} — ${escapeHtml(a.type || "Cuidado")}</h4>
          <p>${escapeHtml(a.notes || "")}</p>
        </div>`;
      }).join("");
    }
  }

  // Favorites preview
  const boxF = document.getElementById("overview-favorites");
  if (boxF) {
    const recentFav = favorites.slice(0, 5);
    if (!recentFav.length) {
      boxF.innerHTML = '<p class="empty">Nenhum favorito ainda.</p>';
    } else {
      boxF.innerHTML = recentFav.map((f) => `
        <div class="msg-item">
          <div class="msg-meta">
            <span>${escapeHtml(f.specialty || "")}</span>
            <span>${escapeHtml(f.city || "")}</span>
          </div>
          <h4>${escapeHtml(f.name || "Cuidador")}</h4>
          <p>${escapeHtml(f.notes || "")}</p>
        </div>`).join("");
    }
  }

  // History preview
  const boxH = document.getElementById("overview-history");
  if (boxH) {
    const recentHist = history.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);
    if (!recentHist.length) {
      boxH.innerHTML = '<p class="empty">Nenhum atendimento registrado.</p>';
    } else {
      boxH.innerHTML = recentHist.map((h) => `
        <div class="msg-item">
          <div class="msg-meta">
            <span>${formatDate(h.date)}</span>
            <span>${escapeHtml(h.duration || "")}</span>
          </div>
          <h4>${escapeHtml(h.caregiver || "Cuidador")} — ${escapeHtml(h.type || "Atendimento")}</h4>
          <p>${escapeHtml(h.notes || "")}</p>
        </div>`).join("");
    }
  }
}

/* ---------- Agenda ---------- */
let editingAgendaId = null;

function renderAgenda() {
  const list = read(STORAGE.agenda, []);
  const box = document.getElementById("agenda-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum agendamento. Clique em “+ Novo agendamento”.</p>';
    return;
  }
  const sorted = list.slice().sort((a, b) => ((a.date || "") + (a.time || "")).localeCompare((b.date || "") + (b.time || "")));
  box.innerHTML = sorted.map((a) => {
    const when = [a.date, a.time].filter(Boolean).join(" · ");
    return `<div class="msg-item" data-id="${a.id}">
      <div class="msg-meta"><span>${escapeHtml(when)}</span></div>
      <h4>${escapeHtml(a.caregiver || "Cuidador")} — ${escapeHtml(a.type || "Cuidado")}</h4>
      <p>${escapeHtml(a.notes || "")}${a.phone ? " · " + escapeHtml(a.phone) : ""}</p>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`;
  }).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      if (btn.dataset.action === "delete") {
        write(STORAGE.agenda, list.filter((x) => x.id !== id));
        renderAgenda();
        renderOverview();
      } else if (btn.dataset.action === "edit") {
        const item = list.find((x) => x.id === id);
        if (!item) return;
        editingAgendaId = id;
        document.getElementById("ag-date").value = item.date || "";
        document.getElementById("ag-time").value = item.time || "";
        document.getElementById("ag-caregiver").value = item.caregiver || "";
        document.getElementById("ag-type").value = item.type || "";
        document.getElementById("ag-phone").value = item.phone || "";
        document.getElementById("ag-notes").value = item.notes || "";
        document.getElementById("agenda-form-title").textContent = "Editar agendamento";
        document.getElementById("agenda-form-wrap").classList.remove("hidden");
      }
    });
  });
}

function openAgendaForm() {
  editingAgendaId = null;
  document.getElementById("ag-date").value = "";
  document.getElementById("ag-time").value = "";
  document.getElementById("ag-caregiver").value = "";
  document.getElementById("ag-type").value = "";
  document.getElementById("ag-phone").value = "";
  document.getElementById("ag-notes").value = "";
  document.getElementById("agenda-form-title").textContent = "Novo agendamento";
  document.getElementById("agenda-form-wrap").classList.remove("hidden");
}

function saveAgenda() {
  const list = read(STORAGE.agenda, []);
  const item = {
    id: editingAgendaId || uid("a"),
    date: document.getElementById("ag-date").value,
    time: document.getElementById("ag-time").value,
    caregiver: document.getElementById("ag-caregiver").value.trim(),
    type: document.getElementById("ag-type").value.trim(),
    phone: document.getElementById("ag-phone").value.trim(),
    notes: document.getElementById("ag-notes").value.trim(),
    createdAt: new Date().toISOString()
  };
  if (editingAgendaId) {
    const idx = list.findIndex((x) => x.id === editingAgendaId);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
  } else {
    list.push(item);
  }
  write(STORAGE.agenda, list);
  document.getElementById("agenda-form-wrap").classList.add("hidden");
  renderAgenda();
  renderOverview();
}

/* ---------- Favorites ---------- */
let editingFavoriteId = null;

function renderFavorites() {
  const list = read(STORAGE.favorites, []);
  const box = document.getElementById("favorites-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum cuidador favorito. Clique em “+ Adicionar favorito”.</p>';
    return;
  }
  box.innerHTML = list.map((f) => `
    <div class="msg-item" data-id="${f.id}">
      <div class="msg-meta">
        <span>${escapeHtml(f.specialty || "")}</span>
        <span>${escapeHtml(f.city || "")}</span>
      </div>
      <h4>${escapeHtml(f.name || "Cuidador")}</h4>
      <p>${escapeHtml(f.notes || "")}${f.phone ? " · " + escapeHtml(f.phone) : ""}</p>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Remover</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      if (btn.dataset.action === "delete") {
        write(STORAGE.favorites, list.filter((x) => x.id !== id));
        renderFavorites();
        renderOverview();
      } else if (btn.dataset.action === "edit") {
        const item = list.find((x) => x.id === id);
        if (!item) return;
        editingFavoriteId = id;
        document.getElementById("fav-name").value = item.name || "";
        document.getElementById("fav-specialty").value = item.specialty || "";
        document.getElementById("fav-phone").value = item.phone || "";
        document.getElementById("fav-city").value = item.city || "";
        document.getElementById("fav-notes").value = item.notes || "";
        document.getElementById("favorite-form-wrap").classList.remove("hidden");
      }
    });
  });
}

function openFavoriteForm() {
  editingFavoriteId = null;
  document.getElementById("fav-name").value = "";
  document.getElementById("fav-specialty").value = "";
  document.getElementById("fav-phone").value = "";
  document.getElementById("fav-city").value = "";
  document.getElementById("fav-notes").value = "";
  document.getElementById("favorite-form-wrap").classList.remove("hidden");
}

function saveFavorite() {
  const list = read(STORAGE.favorites, []);
  const item = {
    id: editingFavoriteId || uid("f"),
    name: document.getElementById("fav-name").value.trim(),
    specialty: document.getElementById("fav-specialty").value.trim(),
    phone: document.getElementById("fav-phone").value.trim(),
    city: document.getElementById("fav-city").value.trim(),
    notes: document.getElementById("fav-notes").value.trim(),
    createdAt: new Date().toISOString()
  };
  if (editingFavoriteId) {
    const idx = list.findIndex((x) => x.id === editingFavoriteId);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
  } else {
    list.push(item);
  }
  write(STORAGE.favorites, list);
  document.getElementById("favorite-form-wrap").classList.add("hidden");
  renderFavorites();
  renderOverview();
}

/* ---------- History ---------- */
let editingHistoryId = null;

function renderHistory() {
  const list = read(STORAGE.history, []);
  const box = document.getElementById("history-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum atendimento no histórico. Clique em “+ Registrar atendimento”.</p>';
    return;
  }
  const sorted = list.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  box.innerHTML = sorted.map((h) => `
    <div class="msg-item" data-id="${h.id}">
      <div class="msg-meta">
        <span>${formatDate(h.date)}</span>
        <span>${escapeHtml(h.duration || "")}</span>
      </div>
      <h4>${escapeHtml(h.caregiver || "Cuidador")} — ${escapeHtml(h.type || "Atendimento")}</h4>
      <p>${escapeHtml(h.notes || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      if (btn.dataset.action === "delete") {
        write(STORAGE.history, list.filter((x) => x.id !== id));
        renderHistory();
        renderOverview();
      } else if (btn.dataset.action === "edit") {
        const item = list.find((x) => x.id === id);
        if (!item) return;
        editingHistoryId = id;
        document.getElementById("hist-caregiver").value = item.caregiver || "";
        document.getElementById("hist-date").value = item.date || "";
        document.getElementById("hist-type").value = item.type || "";
        document.getElementById("hist-duration").value = item.duration || "";
        document.getElementById("hist-notes").value = item.notes || "";
        document.getElementById("history-form-wrap").classList.remove("hidden");
      }
    });
  });
}

function openHistoryForm() {
  editingHistoryId = null;
  document.getElementById("hist-caregiver").value = "";
  document.getElementById("hist-date").value = "";
  document.getElementById("hist-type").value = "";
  document.getElementById("hist-duration").value = "";
  document.getElementById("hist-notes").value = "";
  document.getElementById("history-form-wrap").classList.remove("hidden");
}

function saveHistory() {
  const list = read(STORAGE.history, []);
  const item = {
    id: editingHistoryId || uid("h"),
    caregiver: document.getElementById("hist-caregiver").value.trim(),
    date: document.getElementById("hist-date").value,
    type: document.getElementById("hist-type").value.trim(),
    duration: document.getElementById("hist-duration").value.trim(),
    notes: document.getElementById("hist-notes").value.trim(),
    createdAt: new Date().toISOString()
  };
  if (editingHistoryId) {
    const idx = list.findIndex((x) => x.id === editingHistoryId);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
  } else {
    list.push(item);
  }
  write(STORAGE.history, list);
  document.getElementById("history-form-wrap").classList.add("hidden");
  renderHistory();
  renderOverview();
}

/* ---------- Messages ---------- */
function renderMessages() {
  const list = read(STORAGE.messages, []);
  const box = document.getElementById("messages-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma mensagem.</p>';
    return;
  }
  box.innerHTML = list.map((m) => `
    <div class="msg-item ${m.read ? "" : "unread"}" data-id="${m.id}">
      <div class="msg-meta">
        <span>${escapeHtml(m.name || "Sem nome")}${m.phone ? " · " + escapeHtml(m.phone) : ""}</span>
        <span>${formatDate(m.createdAt)}</span>
      </div>
      <p>${escapeHtml(m.message || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="toggle-read">${m.read ? "Marcar não lida" : "Marcar lida"}</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      const current = read(STORAGE.messages, []);
      if (btn.dataset.action === "delete") {
        write(STORAGE.messages, current.filter((x) => x.id !== id));
      } else if (btn.dataset.action === "toggle-read") {
        const idx = current.findIndex((x) => x.id === id);
        if (idx >= 0) current[idx].read = !current[idx].read;
        write(STORAGE.messages, current);
      }
      renderMessages();
      renderOverview();
    });
  });
}

/* ---------- Reviews ---------- */
let editingReviewId = null;

function renderReviews() {
  const list = read(STORAGE.reviews, []);
  const box = document.getElementById("reviews-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma avaliação. Clique em “+ Nova avaliação”.</p>';
    return;
  }
  box.innerHTML = list.map((r) => `
    <div class="msg-item" data-id="${r.id}">
      <div class="msg-meta">
        <span>${escapeHtml(r.name || "")}</span>
        <span>★ ${Number(r.rating || 0).toFixed(1).replace(".", ",")}</span>
      </div>
      <p>${escapeHtml(r.text || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      if (btn.dataset.action === "delete") {
        write(STORAGE.reviews, list.filter((x) => x.id !== id));
        renderReviews();
        renderOverview();
      } else if (btn.dataset.action === "edit") {
        const item = list.find((x) => x.id === id);
        if (!item) return;
        editingReviewId = id;
        document.getElementById("rev-name").value = item.name || "";
        document.getElementById("rev-rating").value = item.rating || "";
        document.getElementById("rev-text").value = item.text || "";
        document.getElementById("review-form-wrap").classList.remove("hidden");
      }
    });
  });
}

function openReviewForm() {
  editingReviewId = null;
  document.getElementById("rev-name").value = "";
  document.getElementById("rev-rating").value = "";
  document.getElementById("rev-text").value = "";
  document.getElementById("review-form-wrap").classList.remove("hidden");
}

function saveReview() {
  const list = read(STORAGE.reviews, []);
  const item = {
    id: editingReviewId || uid("v"),
    name: document.getElementById("rev-name").value.trim(),
    rating: parseFloat(document.getElementById("rev-rating").value) || 0,
    text: document.getElementById("rev-text").value.trim(),
    createdAt: new Date().toISOString()
  };
  if (editingReviewId) {
    const idx = list.findIndex((x) => x.id === editingReviewId);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
  } else {
    list.push(item);
  }
  write(STORAGE.reviews, list);
  document.getElementById("review-form-wrap").classList.add("hidden");
  renderReviews();
  renderOverview();
}

/* ---------- Payments ---------- */
let editingPaymentId = null;

function renderPayments() {
  const list = read(STORAGE.payments, []);
  const box = document.getElementById("payments-list");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum pagamento registrado.</p>';
    return;
  }
  box.innerHTML = list.map((p) => {
    const cls = p.status === "pago" ? "paid" : p.status === "atrasado" ? "late" : "pending";
    return `<div class="msg-item ${cls}" data-id="${p.id}">
      <div class="msg-meta">
        <span>${escapeHtml(p.caregiver || "")} · ${formatDate(p.date)}</span>
        <span>${escapeHtml(p.status || "pendente")}</span>
      </div>
      <h4>R$ ${Number(p.value || 0).toFixed(2).replace(".", ",")} — ${escapeHtml(p.desc || "")}</h4>
      <div class="msg-actions">
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`;
  }).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      if (
