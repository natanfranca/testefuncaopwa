/**
 * Dashboard Cuidado Puro — Conectado com servidor em localhost
 */

// Endereço do teu servidor local (ajuste a porta conforme o teu back-end, ex: 3000, 5000, 8000)
const API_URL = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("cp_token");
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

/* ---------- Autenticação (Login/Logout) ---------- */
function isLoggedIn() {
  return !!getToken();
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

async function login(e) {
  if (e) e.preventDefault();
  
  const passEl = document.getElementById("login-pass");
  const err = document.getElementById("login-error");
  if (!passEl) return;
  
  const pass = passEl.value.trim();

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("cp_token", data.token);
      if (err) err.textContent = "";
      showApp(true);
    } else {
      if (err) err.textContent = data.message || "Senha incorreta.";
    }
  } catch (error) {
    if (err) err.textContent = "Erro ao conectar com o servidor localhost.";
  }
}

function logout() {
  localStorage.removeItem("cp_token");
  showApp(false);
}

/* ---------- Navegação ---------- */
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

/* ---------- Visão Geral (Overview) ---------- */
async function renderOverview() {
  try {
    const res = await fetch(`${API_URL}/overview`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const data = await res.json();

    document.getElementById("stat-agenda").textContent = data.agendaCount || 0;
    document.getElementById("stat-requests").textContent = data.requestsCount || 0;
    document.getElementById("stat-patients").textContent = data.patientsCount || 0;
    document.getElementById("stat-rating").textContent = data.ratingAvg || "—";
  } catch (err) {
    console.error("Erro ao carregar indicadores:", err);
  }
}

/* ---------- Agenda ---------- */
let editingAgendaId = null;

async function renderAgenda() {
  const box = document.getElementById("agenda-list");
  if (!box) return;

  try {
    const res = await fetch(`${API_URL}/agenda`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const list = await res.json();

    if (!list.length) {
      box.innerHTML = '<p class="empty">Nenhum agendamento na agenda.</p>';
      return;
    }

    box.innerHTML = list.map((a) => `
      <div class="msg-item" data-id="${a.id}">
        <div class="msg-meta"><span>${escapeHtml(a.date)} · ${escapeHtml(a.time)}</span></div>
        <h4>${escapeHtml(a.patient)} — ${escapeHtml(a.type)}</h4>
        <p>${escapeHtml(a.notes || "")} ${a.phone ? "· " + escapeHtml(a.phone) : ""}</p>
        <div class="msg-actions">
          <button type="button" class="btn-secondary" onclick="editAgenda('${a.id}')">Editar</button>
          <button type="button" class="btn-danger" onclick="deleteAgenda('${a.id}')">Excluir</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    box.innerHTML = '<p class="empty">Erro ao carregar agenda de localhost.</p>';
  }
}

function openAgendaForm() {
  editingAgendaId = null;
  document.getElementById("agenda-form-title").textContent = "Novo agendamento";
  ["ag-date", "ag-time", "ag-patient", "ag-type", "ag-phone", "ag-notes"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("agenda-form-wrap").classList.remove("hidden");
}

async function saveAgenda() {
  const payload = {
    date: document.getElementById("ag-date").value,
    time: document.getElementById("ag-time").value,
    patient: document.getElementById("ag-patient").value.trim(),
    type: document.getElementById("ag-type").value.trim(),
    phone: document.getElementById("ag-phone").value.trim(),
    notes: document.getElementById("ag-notes").value.trim()
  };

  const url = editingAgendaId ? `${API_URL}/agenda/${editingAgendaId}` : `${API_URL}/agenda`;
  const method = editingAgendaId ? "PUT" : "POST";

  await fetch(url, {
    method: method,
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  document.getElementById("agenda-form-wrap").classList.add("hidden");
  renderAgenda();
  renderOverview();
}

async function deleteAgenda(id) {
  if (!confirm("Deseja realmente excluir este agendamento?")) return;
  await fetch(`${API_URL}/agenda/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  renderAgenda();
  renderOverview();
}

/* ---------- Pacientes ---------- */
async function renderPatients() {
  const box = document.getElementById("patients-list");
  if (!box) return;

  try {
    const res = await fetch(`${API_URL}/patients`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const list = await res.json();

    if (!list.length) {
      box.innerHTML = '<p class="empty">Nenhum paciente cadastrado.</p>';
      return;
    }

    box.innerHTML = list.map((p) => `
      <div class="msg-item" data-id="${p.id}">
        <div class="msg-meta">
          <span>${p.age ? p.age + " anos" : ""}${p.city ? " · " + escapeHtml(p.city) : ""}</span>
          <span>${escapeHtml(p.phone || "")}</span>
        </div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.notes || "")}</p>
        <div class="msg-actions">
          <button type="button" class="btn-danger" onclick="deletePatient('${p.id}')">Excluir</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    box.innerHTML = '<p class="empty">Erro ao carregar pacientes.</p>';
  }
}

function openPatientForm() {
  ["pat-name", "pat-age", "pat-phone", "pat-city", "pat-notes"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("patient-form-wrap").classList.remove("hidden");
}

async function savePatient() {
  const payload = {
    name: document.getElementById("pat-name").value.trim(),
    age: Number(document.getElementById("pat-age").value) || null,
    phone: document.getElementById("pat-phone").value.trim(),
    city: document.getElementById("pat-city").value.trim(),
    notes: document.getElementById("pat-notes").value.trim()
  };

  await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  document.getElementById("patient-form-wrap").classList.add("hidden");
  renderPatients();
  renderOverview();
}

async function deletePatient(id) {
  if (!confirm("Excluir paciente?")) return;
  await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  renderPatients();
  renderOverview();
}

/* ---------- Ícones & Inicialização ---------- */
function refreshIcons() {
  if (window.lucide && typeof lucide.createIcons === "function") lucide.createIcons();
}

function refreshAll() {
  renderOverview();
  renderAgenda();
  renderPatients();
  refreshIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  // Login
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

  // Navegação do Menu
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
  });

  // Eventos de Formulários
  const addAg = document.getElementById("add-agenda");
  if (addAg) addAg.addEventListener("click", openAgendaForm);
  const saveAg = document.getElementById("save-agenda");
  if (saveAg) saveAg.addEventListener("click", saveAgenda);
  const cancelAg = document.getElementById("cancel-agenda");
  if (cancelAg) cancelAg.addEventListener("click", () => {
    document.getElementById("agenda-form-wrap").classList.add("hidden");
  });

  const addPat = document.getElementById("add-patient");
  if (addPat) addPat.addEventListener("click", openPatientForm);
  const savePat = document.getElementById("save-patient");
  if (savePat) savePat.addEventListener("click", savePatient);
  const cancelPat = document.getElementById("cancel-patient");
  if (cancelPat) cancelPat.addEventListener("click", () => {
    document.getElementById("patient-form-wrap").classList.add("hidden");
  });

  // Checa autenticação inicial
  if (isLoggedIn()) showApp(true);
  else showApp(false);

  refreshIcons();
});
