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
  document.getElementById("login-screen").classList.toggle("hidden", show);
  document.getElementById("app").classList.toggle("hidden", !show);
  if (show) refreshAll();
}

function login() {
  const pass = document.getElementById("login-pass").value;
  const err = document.getElementById("login-error");
  if (pass === DEFAULT_PASSWORD) {
    localStorage.setItem(STORAGE.auth, "1");
    err.textContent = "";
    showApp(true);
  } else {
    err.textContent = "Senha incorreta.";
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

  document.getElementById("stat-agenda").textContent = agenda.length;
  document.getElementById("stat-requests").textContent = requests.filter((r) => r.status === "pendente").length;
  document.getElementById("stat-patients").textContent = patients.length;

  if (reviews.length) {
    const avg = reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
    document.getElementById("stat-rating").textContent = avg.toFixed(1).replace(".", ",");
  } else {
    document.getElementById("stat-rating").textContent = "—";
  }

  // Agenda preview
  const boxA = document.getElementById("overview-agenda");
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

  // Requests preview
  const boxR = document.getElementById("overview-requests");
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

  // Messages preview
  const boxM = document.getElementById("overview-messages");
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

/* ---------- Agenda ---------- */
let editingAgendaId = null;

function renderAgenda() {
  const list = read(STORAGE.agenda, []);
  const box = document.getElementById("agenda-list");
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
  document.getElementById("agenda-form-title").textContent = "Novo agendamento";
  ["ag-date", "ag-time", "ag-patient", "ag-type", "ag-phone", "ag-notes"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("agenda-form-wrap").classList.remove("hidden");
}

function saveAgenda() {
  const list = read(STORAGE.agenda, []);
  const data = {
    date: document.getElementById("ag-date").value,
    time: document.getElementById("ag-time").value,
    patient: document.getElementById("ag-patient").value.trim(),
    type: document.getElementById("ag-type").value.trim(),
    phone: document.getElementById("ag-phone").value.trim(),
    notes: document.getElementById("ag-notes").value.trim()
  };
  if (editingAgendaId) {
    const idx = list.findIndex((x) => x.id === editingAgendaId);
    if (idx >= 0) list[idx] = { ...list[idx], ...data };
  } else {
    list.unshift({ id: uid("a"), ...data, createdAt: new Date().toISOString() });
  }
  write(STORAGE.agenda, list);
  document.getElementById("agenda-form-wrap").classList.add("hidden");
  renderAgenda();
  renderOverview();
}

/* ---------- Requests ---------- */
function renderRequests() {
  const list = read(STORAGE.requests, []);
  const box = document.getElementById("requests-list");
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma solicitação.</p>';
    return;
  }
  box.innerHTML = list.map((r) => `
    <div class="msg-item ${r.status === "pendente" ? "pending" : ""}" data-id="${r.id}">
      <div class="msg-meta">
        <span>${escapeHtml(r.name || "")}${r.phone ? " · " + escapeHtml(r.phone) : ""}</span>
        <span>${escapeHtml(r.status || "pendente")} · ${formatDate(r.createdAt)}</span>
      </div>
      <p>${escapeHtml(r.text || "")}</p>
      <div class="msg-actions">
        ${r.status === "pendente" ? `<button type="button" class="btn-primary" data-action="accept">Aceitar</button>
        <button type="button" class="btn-secondary" data-action="reject">Recusar</button>` : ""}
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      let next = list.slice();
      if (btn.dataset.action === "delete") {
        next = next.filter((x) => x.id !== id);
      } else if (btn.dataset.action === "accept") {
        next = next.map((x) => (x.id === id ? { ...x, status: "aceita" } : x));
      } else if (btn.dataset.action === "reject") {
        next = next.map((x) => (x.id === id ? { ...x, status: "recusada" } : x));
      }
      write(STORAGE.requests, next);
      renderRequests();
      renderOverview();
    });
  });
}

function openRequestForm() {
  document.getElementById("req-name").value = "";
  document.getElementById("req-phone").value = "";
  document.getElementById("req-text").value = "";
  document.getElementById("request-form-wrap").classList.remove("hidden");
}

function saveRequest() {
  const list = read(STORAGE.requests, []);
  list.unshift({
    id: uid("r"),
    name: document.getElementById("req-name").value.trim(),
    phone: document.getElementById("req-phone").value.trim(),
    text: document.getElementById("req-text").value.trim(),
    status: "pendente",
    createdAt: new Date().toISOString()
  });
  write(STORAGE.requests, list);
  document.getElementById("request-form-wrap").classList.add("hidden");
  renderRequests();
  renderOverview();
}

/* ---------- Patients ---------- */
function renderPatients() {
  const list = read(STORAGE.patients, []);
  const box = document.getElementById("patients-list");
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum paciente cadastrado.</p>';
    return;
  }
  box.innerHTML = list.map((p) => `
    <div class="msg-item" data-id="${p.id}">
      <div class="msg-meta">
        <span>${p.age ? escapeHtml(String(p.age)) + " anos" : ""}${p.city ? " · " + escapeHtml(p.city) : ""}</span>
        <span>${escapeHtml(p.phone || "")}</span>
      </div>
      <h4>${escapeHtml(p.name || "Paciente")}</h4>
      <p>${escapeHtml(p.notes || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.patients, list.filter((x) => x.id !== id));
      renderPatients();
      renderOverview();
    });
  });
}

function openPatientForm() {
  ["pat-name", "pat-age", "pat-phone", "pat-city", "pat-notes"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("patient-form-wrap").classList.remove("hidden");
}

function savePatient() {
  const list = read(STORAGE.patients, []);
  list.unshift({
    id: uid("p"),
    name: document.getElementById("pat-name").value.trim(),
    age: Number(document.getElementById("pat-age").value) || "",
    phone: document.getElementById("pat-phone").value.trim(),
    city: document.getElementById("pat-city").value.trim(),
    notes: document.getElementById("pat-notes").value.trim(),
    createdAt: new Date().toISOString()
  });
  write(STORAGE.patients, list);
  document.getElementById("patient-form-wrap").classList.add("hidden");
  renderPatients();
  renderOverview();
}

/* ---------- Messages ---------- */
function renderMessages() {
  const messages = read(STORAGE.messages, []);
  const box = document.getElementById("messages-list");
  if (!messages.length) {
    box.innerHTML = '<p class="empty">Nenhuma mensagem recebida.</p>';
    return;
  }
  box.innerHTML = messages.map((m) => `
    <div class="msg-item ${m.read ? "" : "unread"}" data-id="${m.id}">
      <div class="msg-meta">
        <span>${escapeHtml(m.name || "")}${m.phone ? " · " + escapeHtml(m.phone) : ""} · ${escapeHtml(m.email || "")}</span>
        <span>${formatDate(m.createdAt)} ${m.read ? "" : "· Nova"}</span>
      </div>
      <p>${escapeHtml(m.message || "")}</p>
      <div class="msg-actions">
        ${m.read ? "" : `<button type="button" class="btn-secondary" data-action="read">Marcar como lida</button>`}
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      let next = messages.slice();
      if (btn.dataset.action === "delete") next = next.filter((x) => x.id !== id);
      if (btn.dataset.action === "read") next = next.map((x) => (x.id === id ? { ...x, read: true } : x));
      write(STORAGE.messages, next);
      renderMessages();
      renderOverview();
    });
  });
}

/* ---------- Reviews ---------- */
function renderReviews() {
  const list = read(STORAGE.reviews, []);
  const box = document.getElementById("reviews-list");
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhuma avaliação.</p>';
    return;
  }
  box.innerHTML = list.map((r) => `
    <div class="msg-item" data-id="${r.id}">
      <div class="msg-meta">
        <span>${escapeHtml(r.name || "")}</span>
        <span>★ ${escapeHtml(String(r.rating ?? "—"))} · ${formatDate(r.createdAt)}</span>
      </div>
      <p>${escapeHtml(r.text || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.reviews, list.filter((x) => x.id !== id));
      renderReviews();
      renderOverview();
    });
  });
}

function openReviewForm() {
  document.getElementById("rev-name").value = "";
  document.getElementById("rev-rating").value = "";
  document.getElementById("rev-text").value = "";
  document.getElementById("review-form-wrap").classList.remove("hidden");
}

function saveReview() {
  const list = read(STORAGE.reviews, []);
  list.unshift({
    id: uid("v"),
    name: document.getElementById("rev-name").value.trim(),
    rating: Number(document.getElementById("rev-rating").value) || 0,
    text: document.getElementById("rev-text").value.trim(),
    createdAt: new Date().toISOString()
  });
  write(STORAGE.reviews, list);
  document.getElementById("review-form-wrap").classList.add("hidden");
  renderReviews();
  renderOverview();
}

/* ---------- Payments ---------- */
function renderPayments() {
  const list = read(STORAGE.payments, []);
  const box = document.getElementById("payments-list");
  if (!list.length) {
    box.innerHTML = '<p class="empty">Nenhum pagamento registrado.</p>';
    return;
  }
  box.innerHTML = list.map((p) => {
    const cls = p.status === "pago" ? "paid" : p.status === "atrasado" ? "late" : "pending";
    return `<div class="msg-item ${cls}" data-id="${p.id}">
      <div class="msg-meta">
        <span>${escapeHtml(p.patient || "")} · ${escapeHtml(p.date || "")}</span>
        <span>${escapeHtml(p.status || "")}</span>
      </div>
      <h4>R$ ${Number(p.value || 0).toFixed(2).replace(".", ",")}</h4>
      <p>${escapeHtml(p.desc || "")}</p>
      <div class="msg-actions">
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </div>
    </div>`;
  }).join("");

  box.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".msg-item").dataset.id;
      write(STORAGE.payments, list.filter((x) => x.id !== id));
      renderPayments();
    });
  });
}

function openPaymentForm() {
  document.getElementById("pay-patient").value = "";
  document.getElementById("pay-value").value = "";
  document.getElementById("pay-date").value = "";
  document.getElementById("pay-status").value = "pago";
  document.getElementById("pay-desc").value = "";
  document.getElementById("payment-form-wrap").classList.remove("hidden");
}

function savePayment() {
  const list = read(STORAGE.payments, []);
  list.unshift({
    id: uid("pay"),
    patient: document.getElementById("pay-patient").value.trim(),
    value: Number(document.getElementById("pay-value").value) || 0,
    date: document.getElementById("pay-date").value,
    status: document.getElementById("pay-status").value,
    desc: document.getElementById("pay-desc").value.trim(),
    createdAt: new Date().toISOString()
  });
  write(STORAGE.payments, list);
  document.getElementById("payment-form-wrap").classList.add("hidden");
  renderPayments();
}

/* ---------- Settings ---------- */
function fillSettings() {
  const s = read(STORAGE.settings, DEFAULT_SETTINGS);
  document.getElementById("s-name").value = s.name || "";
  document.getElementById("s-phone").value = s.phone || "";
  document.getElementById("s-email").value = s.email || "";
  document.getElementById("s-focus").value = s.focus || "";
}

function saveSettings() {
  write(STORAGE.settings, {
    name: document.getElementById("s-name").value.trim(),
    phone: document.getElementById("s-phone").value.trim(),
    email: document.getElementById("s-email").value.trim(),
    focus: document.getElementById("s-focus").value.trim()
  });
  document.getElementById("settings-saved").textContent = "Salvo com sucesso.";
  setTimeout(() => { document.getElementById("settings-saved").textContent = ""; }, 2500);
}

/* ---------- Export / Import ---------- */
function exportData() {
  const data = {
    agenda: read(STORAGE.agenda, []),
    requests: read(STORAGE.requests, []),
    patients: read(STORAGE.patients, []),
    messages: read(STORAGE.messages, []),
    reviews: read(STORAGE.reviews, []),
    payments: read(STORAGE.payments, []),
    settings: read(STORAGE.settings, DEFAULT_SETTINGS)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cuidado-puro-dados.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.agenda) write(STORAGE.agenda, data.agenda);
      if (data.requests) write(STORAGE.requests, data.requests);
      if (data.patients) write(STORAGE.patients, data.patients);
      if (data.messages) write(STORAGE.messages, data.messages);
      if (data.reviews) write(STORAGE.reviews, data.reviews);
      if (data.payments) write(STORAGE.payments, data.payments);
      if (data.settings) write(STORAGE.settings, data.settings);
      document.getElementById("import-msg").textContent = "Dados importados.";
      refreshAll();
    } catch {
      document.getElementById("import-msg").textContent = "Arquivo inválido.";
    }
  };
  reader.readAsText(file);
}

function refreshIcons() {
  if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function refreshAll() {
  renderOverview();
  renderAgenda();
  renderRequests();
  renderPatients();
  renderMessages();
  renderReviews();
  renderPayments();
  fillSettings();
  refreshIcons();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  ensureDefaults();

  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("login-pass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
  document.getElementById("logout-btn").addEventListener("click", logout);

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
  });

  document.getElementById("add-agenda").addEventListener("click", openAgendaForm);
  document.getElementById("save-agenda").addEventListener("click", saveAgenda);
  document.getElementById("cancel-agenda").addEventListener("click", () => {
    document.getElementById("agenda-form-wrap").classList.add("hidden");
  });

  document.getElementById("add-request").addEventListener("click", openRequestForm);
  document.getElementById("save-request").addEventListener("click", saveRequest);
  document.getElementById("cancel-request").addEventListener("click", () => {
    document.getElementById("request-form-wrap").classList.add("hidden");
  });

  document.getElementById("add-patient").addEventListener("click", openPatientForm);
  document.getElementById("save-patient").addEventListener("click", savePatient);
  document.getElementById("cancel-patient").addEventListener("click", () => {
    document.getElementById("patient-form-wrap").classList.add("hidden");
  });

  document.getElementById("clear-messages").addEventListener("click", () => {
    if (confirm("Excluir todas as mensagens?")) {
      write(STORAGE.messages, []);
      renderMessages();
      renderOverview();
    }
  });

  document.getElementById("add-review").addEventListener("click", openReviewForm);
  document.getElementById("save-review").addEventListener("click", saveReview);
  document.getElementById("cancel-review").addEventListener("click", () => {
    document.getElementById("review-form-wrap").classList.add("hidden");
  });

  document.getElementById("add-payment").addEventListener("click", openPaymentForm);
  document.getElementById("save-payment").addEventListener("click", savePayment);
  document.getElementById("cancel-payment").addEventListener("click", () => {
    document.getElementById("payment-form-wrap").classList.add("hidden");
  });

  document.getElementById("save-settings").addEventListener("click", saveSettings);
  document.getElementById("export-data").addEventListener("click", exportData);
  document.getElementById("import-data").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importData(f);
  });

  if (isLoggedIn()) showApp(true);
  else showApp(false);
  refreshIcons();
});
