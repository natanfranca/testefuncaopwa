/**
 * Dashboard Cuidado Puro — dados em localStorage (demonstração)
 */
const STORAGE = {
  auth: "cp_auth",
  agenda: "cp_agenda",
  requests: "cp_requests",
  patients: "cp_patients",
  messages: "cp_messages",
  reviews: "cp_reviews",
  payments: "cp_payments",
  settings: "cp_settings"
};

const DEFAULT_PASSWORD = "cuidado123";

const DEFAULT_SETTINGS = {
  name: "Mariana Silva",
  phone: "",
  email: "",
  focus: "Cuidados domiciliares"
};

const DEFAULT_AGENDA = [
  { id: "a1", date: nextDay(1), time: "09:00", patient: "Ana Lúcia", type: "Acompanhamento matinal", phone: "", notes: "", createdAt: new Date().toISOString() },
  { id: "a2", date: nextDay(2), time: "14:30", patient: "Carlos Mendes", type: "Medicação e curativo", phone: "", notes: "", createdAt: new Date().toISOString() }
];

const DEFAULT_REQUESTS = [
  { id: "r1", name: "Ana Lúcia", phone: "", text: "Preciso de acompanhamento 3x na semana.", status: "pendente", createdAt: new Date().toISOString() },
  { id: "r2", name: "Carlos", phone: "", text: "Solicito cuidador para finais de semana.", status: "pendente", createdAt: new Date().toISOString() }
];

const DEFAULT_PATIENTS = [
  { id: "p1", name: "Ana Lúcia", age: 78, phone: "", city: "", notes: "Hipertensão controlada", createdAt: new Date().toISOString() },
  { id: "p2", name: "Carlos Mendes", age: 65, phone: "", city: "", notes: "Pós-operatório", createdAt: new Date().toISOString() }
];

const DEFAULT_REVIEWS = [
  { id: "v1", name: "Família Ana Lúcia", rating: 5, text: "Atendimento atencioso e pontual.", createdAt: new Date().toISOString() },
  { id: "v2", name: "Carlos Mendes", rating: 4.8, text: "Muito profissional e cuidadosa.", createdAt: new Date().toISOString() }
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
  if (!localStorage.getItem(STORAGE.requests)) write(STORAGE.requests, DEFAULT_REQUESTS);
  if (!localStorage.getItem(STORAGE.patients)) write(STORAGE.patients, DEFAULT_PATIENTS);
  if (!localStorage.getItem(STORAGE.messages)) write(STORAGE.messages, [
    { id: "m1", name: "Família Oliveira", phone: "(11) 98888-0001", email: "", message: "Podemos remarcar a visita de quinta?", createdAt: new Date().toISOString(), read: false },
    { id: "m2", name: "Carlos Mendes", phone: "", email: "carlos@email.com", message: "Obrigado pelo atendimento de ontem.", createdAt: new Date().toISOString(), read: true }
  ]);
  if (!localStorage.getItem(STORAGE.reviews)) write(STORAGE.reviews, DEFAULT_REVIEWS);
  if (!localStorage.getItem(STORAGE.payments)) write(STORAGE.payments, [
    { id: "pay1", patient: "Ana Lúcia", value: 280, date: new Date().toISOString().slice(0,10), status: "pago", desc: "Plantão 12h", createdAt: new Date().toISOString() },
    { id: "pay2", patient: "Carlos Mendes", value: 150, date: new Date().toISOString().slice(0,10), status: "pendente", desc: "Visita domiciliar", createdAt: new Date().toISOString() }
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
    loginScreen.classList.toggle("hidden", show);
    appScreen.classList.toggle("hidden", !show);
    if (show) {
      loginScreen.style.display = "none";
      appScreen.style.display = "flex";
      refreshAll();
    } else {
      loginScreen.style.display = "flex";
      appScreen.style.display = "none";
    }
  }
}

function login(e) {
  if (e) e.preventDefault();
  
  const passEl = document.getElementById("login-pass");
  const err = document.getElementById("login-error");
  if (!passEl) return;
  
  const pass = passEl.value.trim();
  if (pass === DEFAULT_PASSWORD) {
    localStorage.setItem(STORAGE.auth, "1");
    if (err) err.textContent = "";
    showApp(true);
  } else {
    if (err) err.textContent = "Senha incorreta. Tente 'cuidado123'.";
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
    document.getElementById("panel-title").textContent = active.dataset.label || panel;
  }
  refreshIcons();
}

/* ---------- Overview ---------- */
function renderOverview() {
  const agenda = read(STORAGE.agenda, []);
  const requests = read(STORAGE.requests, []);
  const patients = read(STORAGE.patients, []);
  const messages = read(STORAGE.messages, []);
  const reviews = read(STORAGE.reviews, []);

  const stAgenda = document.getElementById("stat-agenda");
  const stRequests = document.getElementById("stat-requests");
  const stPatients = document.getElementById("stat-patients");
  const stRating = document.getElementById("stat-rating");

  if (stAgenda) stAgenda.textContent = agenda.length;
  if (stRequests) stRequests.textContent = requests.filter((r) => r.status === "pendente").length;
  if (stPatients) stPatients.textContent = patients.length;

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
          <h4>${escapeHtml(a.patient || "Paciente")} — ${escapeHtml(a.type || "Cuidado")}</h4>
          <p>${escapeHtml(a.notes || "")}</p>
        </div>`;
      }).join("");
    }
  }

  // Requests preview
  const boxR = document.getElementById("overview-requests");
  if (boxR) {
    const recentReq = requests.slice(0, 5);
    if (!recentReq.length) {
      boxR.innerHTML = '<p class="empty">Nenhuma solicitação.</p>';
    } else {
      boxR.innerHTML = recentReq.map((r) => `
        <div class="msg-item ${r.status === "pendente" ? "pending" : ""}">
          <div class="msg-meta">
            <span>${escapeHtml(r.name || "")}${r.phone ? " · " + escapeHtml(r.phone) : ""}</span>
            <span>${escapeHtml(r.status || "pendente")}</span>
          </div>
          <p>${escapeHtml(r.text || "")}</p>
        </div>`).join("");
    }
  }

  // Messages preview
  const boxM = document.getElementById("overview-messages");
  if (boxM) {
    const latest = messages.slice(0, 5);
    if (!latest.length) {
      boxM.innerHTML = '<p class="empty">Nenhuma mensagem ainda.</p>';
    } else {
      boxM.innerHTML = latest.map((m) => `
        <div class="msg-item ${m.read ? "" : "unread"}">
          <div class="msg-meta">
            <span>${escapeHtml(m.name || "Sem nome")}${m.phone ? " · " + escapeHtml(m.phone) : ""}</span>
            <span>${formatDate(m.createdAt)}</span>
          </div>
          <p>${escapeHtml((m.message || "").slice(0, 140))}${(m.message || "").length > 140 ? "…" : ""}</p>
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
      <h4>${escapeHtml(a.patient || "Paciente")} — ${escapeHtml(a.type || "Cuidado")}</h4>
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
        document.getElementById("ag-patient").value = item.patient || "";
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
  const titleEl = document.getElementById("agenda-form-title");
  if (titleEl) titleEl.textContent = "Novo agendamento";
  ["ag-date", "ag-time", "ag-patient", "ag-type", "ag-phone", "ag-notes"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const wrap = document.getElementById("agenda-form-wrap");
  if (wrap) wrap.classList.remove("hidden");
}
