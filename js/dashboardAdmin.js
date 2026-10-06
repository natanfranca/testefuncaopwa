/**
 * Dashboard Admin — Cuidado Puro (localStorage + Chart.js)
 */
const STORAGE = {
  auth: "cp_admin_auth",
  users: "cp_admin_users",
  regs: "cp_admin_regs",
  payments: "cp_admin_payments",
  traffic: "cp_admin_traffic",
  settings: "cp_admin_settings"
};

const DEFAULT_PASSWORD = "admin123";

const DEFAULT_SETTINGS = {
  name: "Admin Cuidado Puro",
  email: "admin@cuidadopuro.com",
  planValue: 89.9
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function makeTraffic(days) {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const base = 80 + Math.floor(Math.random() * 120);
    const weekendBoost = [0, 6].includes(new Date(daysAgo(i)).getDay()) ? -20 : 15;
    arr.push({ date: daysAgo(i), visits: Math.max(30, base + weekendBoost + Math.floor(Math.random() * 40)) });
  }
  return arr;
}

const DEFAULT_USERS = [
  { id: "u1", name: "Ana Lúcia", email: "ana@email.com", type: "paciente", status: "ativo", createdAt: daysAgo(45) },
  { id: "u2", name: "Carlos Mendes", email: "carlos@email.com", type: "paciente", status: "ativo", createdAt: daysAgo(40) },
  { id: "u3", name: "Mariana Silva", email: "mariana@cuidadopuro.com", type: "cuidador", status: "ativo", createdAt: daysAgo(60) },
  { id: "u4", name: "João Pedro", email: "joao@email.com", type: "cuidador", status: "ativo", createdAt: daysAgo(30) },
  { id: "u5", name: "Beatriz Costa", email: "beatriz@email.com", type: "paciente", status: "inativo", createdAt: daysAgo(90) },
  { id: "u6", name: "Rafael Lima", email: "rafael@email.com", type: "cuidador", status: "inativo", createdAt: daysAgo(20) },
  { id: "u7", name: "Admin Sistema", email: "admin@cuidadopuro.com", type: "admin", status: "ativo", createdAt: daysAgo(120) },
  { id: "u8", name: "Fernanda Alves", email: "fernanda@email.com", type: "paciente", status: "ativo", createdAt: daysAgo(12) }
];

const DEFAULT_REGS = [
  { id: "reg1", name: "Pedro Santos", type: "paciente", contact: "(11) 98888-1111", status: "pendente", notes: "Solicitou acompanhamento 3x/semana", createdAt: daysAgo(2) },
  { id: "reg2", name: "Lucia Ferreira", type: "cuidador", contact: "lucia@email.com", status: "pendente", notes: "Experiência com idosos", createdAt: daysAgo(1) },
  { id: "reg3", name: "Marcos Oliveira", type: "paciente", contact: "(11) 97777-2222", status: "aprovado", notes: "", createdAt: daysAgo(8) },
  { id: "reg4", name: "Camila Souza", type: "cuidador", contact: "camila@email.com", status: "recusado", notes: "Documentação incompleta", createdAt: daysAgo(15) }
];

const DEFAULT_PAYMENTS = [
  { id: "pay1", user: "Ana Lúcia", plan: "Padrão", value: 89.9, due: daysAgo(5), status: "pago", createdAt: daysAgo(5) },
  { id: "pay2", user: "Carlos Mendes", plan: "Básico", value: 59.9, due: daysAgo(3), status: "pago", createdAt: daysAgo(3) },
  { id: "pay3", user: "Mariana Silva", plan: "Premium", value: 149.9, due: daysAgo(0), status: "pendente", createdAt: daysAgo(0) },
  { id: "pay4", user: "João Pedro", plan: "Padrão", value: 89.9, due: daysAgo(10), status: "atrasado", createdAt: daysAgo(10) },
  { id: "pay5", user: "Fernanda Alves", plan: "Básico", value: 59.9, due: daysAgo(2), status: "pago", createdAt: daysAgo(2) },
  { id: "pay6", user: "Beatriz Costa", plan: "Padrão", value: 89.9, due: daysAgo(20), status: "atrasado", createdAt: daysAgo(20) }
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

function ensureDefaults() {
  if (!localStorage.getItem(STORAGE.users)) write(STORAGE.users, DEFAULT_USERS);
  if (!localStorage.getItem(STORAGE.regs)) write(STORAGE.regs, DEFAULT_REGS);
  if (!localStorage.getItem(STORAGE.payments)) write(STORAGE.payments, DEFAULT_PAYMENTS);
  if (!localStorage.getItem(STORAGE.traffic)) write(STORAGE.traffic, makeTraffic(30));
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
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(n) {
  return "R$ " + Number(n || 0).toFixed(2).replace(".", ",");
}

/* ---------- Auth ---------- */
function isLoggedIn() {
  return localStorage.getItem(STORAGE.auth) === "1";
}

function showApp(show) {
  document.getElementById("login-screen").classList.toggle("hidden", show);
  document.getElementById("app").classList.toggle("hidden", !show);
  if (show) {
    refreshAll();
  }
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
  if (panel === "overview") renderOverviewCharts();
  if (panel === "traffic") renderTrafficCharts();
  if (panel === "payments") renderRevenueChart();
}

/* ---------- Charts helpers ---------- */
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

const chartDefaults = {
  color: "#9cb1d9",
  borderColor: "rgba(237,241,245,0.14)",
  teal: "#68beb5",
  tealFill: "rgba(104,190,181,0.25)",
  amber: "#e7a82e",
  danger: "#e57373",
  ok: "#81c784",
  navy: "#0a2040"
};

function lineChart(canvasId, labels, data, label) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === "undefined") return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: label || "Visitas",
        data,
        borderColor: chartDefaults.teal,
        backgroundColor: chartDefaults.tealFill,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: chartDefaults.color, maxTicksLimit: 8, font: { size: 10 } },
          grid: { color: chartDefaults.borderColor }
        },
        y: {
          ticks: { color: chartDefaults.color, font: { size: 10 } },
          grid: { color: chartDefaults.borderColor },
          beginAtZero: true
        }
      }
    }
  });
}

function doughnutChart(canvasId, labels, data, colors) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === "undefined") return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || [chartDefaults.teal, chartDefaults.amber, chartDefaults.danger, chartDefaults.ok],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: chartDefaults.color, boxWidth: 12, font: { size: 11 } }
        }
      }
    }
  });
}

function barChart(canvasId, labels, data, label) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === "undefined") return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: label || "Valor",
        data,
        backgroundColor: chartDefaults.teal,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: chartDefaults.color, font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: chartDefaults.color, font: { size: 10 } },
          grid: { color: chartDefaults.borderColor },
          beginAtZero: true
        }
      }
    }
  });
}

/* ---------- Overview ---------- */
function renderOverview() {
  const users = read(STORAGE.users, []);
  const traffic = read(STORAGE.traffic, []);
  const payments = read(STORAGE.payments, []);
  const regs = read(STORAGE.regs, []);

  const active = users.filter((u) => u.status === "ativo").length;
  const inactive = users.filter((u) => u.status === "inativo").length;
  const visits30 = traffic.reduce((s, t) => s + (t.visits || 0), 0);
  const paidThisMonth = payments.filter((p) => p.status === "pago");
  const revenue = paidThisMonth.reduce((s, p) => s + Number(p.value || 0), 0);

  document.getElementById("stat-users").textContent = users.length;
  document.getElementById("stat-active").textContent = active;
  document.getElementById("stat-inactive").textContent = inactive;
  document.getElementById("stat-visits").textContent = visits30.toLocaleString("pt-BR");
  document.getElementById("stat-revenue").textContent = formatMoney(revenue);

  // Recent payments
  const boxP = document.getElementById("overview-payments");
  const recentPay = payments.slice().sort((a, b) => (b.due || "").localeCompare(a.due || "")).slice(0, 5);
  if (!recentPay.length) {
    boxP.innerHTML = '<p class="empty">Nenhuma mensalidade.</p>';
  } else {
    boxP.innerHTML = recentPay.map((p) => {
      const cls = p.status === "pago" ? "paid" : p.status === "atrasado" ? "late" : "pending";
      return `<div class="msg-item ${cls}">
        <div class="msg-meta">
          <span>${escapeHtml(p.user)} · ${escapeHtml(p.plan)}</span>
          <span>${escapeHtml(p.status)}</span>
        </div>
        <h4>${formatMoney(p.value)} — venc. ${formatDate(p.due)}</h4>
      </div>`;
    }).join("");
  }

  // Recent regs
  const boxR = document.getElementById("overview-regs");
  const recentReg = regs.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5);
  if (!recentReg.length) {
    boxR.innerHTML = '<p class="empty">Nenhum cadastro recente.</p>';
  } else {
    boxR.innerHTML = recentReg.map((r) => `
      <div class="msg-item">
        <div class="msg-meta">
          <span>${escapeHtml(r.type)} · ${formatDate(r.createdAt)}</span>
          <span>${escapeHtml(r.status)}</span>
        </div>
        <h4>${escapeHtml(r.name)}</h4>
        <p>${escapeHtml(r.contact || "")}</p>
      </div>`).join("");
  }

  renderOverviewCharts();
}

function renderOverviewCharts() {
  const traffic = read(STORAGE.traffic, []);
  const users = read(STORAGE.users, []);
  const last14 = traffic.slice(-14);
  lineChart(
    "chart-traffic-mini",
    last14.map((t) => formatDate(t.date).replace(/ de /g, "/").split("/")[0] + "/" + (formatDate(t.date).split(" ")[1] || "")),
    last14.map((t) => t.visits),
    "Visitas"
  );

  const tipos = { paciente: 0, cuidador: 0, admin: 0 };
  users.forEach((u) => { if (tipos[u.type] !== undefined) tipos[u.type]++; });
  doughnutChart(
    "chart-users-type",
    ["Pacientes", "Cuidadores", "Admins"],
    [tipos.paciente, tipos.cuidador, tipos.admin],
    [chartDefaults.teal, chartDefaults.amber, chartDefaults.ok]
  );
}

/* ---------- Traffic ---------- */
function renderTraffic() {
  const traffic = read(STORAGE.traffic, []);
  const today = traffic[traffic.length - 1]?.visits || 0;
  const week = traffic.slice(-7).reduce((s, t) => s + t.visits, 0);
  const month = traffic.reduce((s, t) => s + t.visits, 0);
  const peak = Math.max(...traffic.map((t) => t.visits), 0);

  document.getElementById("traf-today").textContent = today;
  document.getElementById("traf-week").textContent = week.toLocaleString("pt-BR");
  document.getElementById("traf-month").textContent = month.toLocaleString("pt-BR");
  document.getElementById("traf-peak").textContent = peak;

  renderTrafficCharts();
}

function renderTrafficCharts() {
  const traffic = read(STORAGE.traffic, []);
  lineChart(
    "chart-traffic-full",
    traffic.map((t) => {
      const d = new Date(t.date + "T12:00:00");
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }),
    traffic.map((t) => t.visits),
    "Visitas"
  );

  doughnutChart(
    "chart-sources",
    ["Direto", "Google", "Redes sociais", "Indicação"],
    [35, 40, 15, 10],
    [chartDefaults.teal, chartDefaults.ok, chartDefaults.amber, chartDefaults.danger]
  );

  barChart(
    "chart-pages",
    ["Início", "Sobre", "Cadastro", "Login", "Contato"],
    [420, 180, 260, 310, 95],
    "Visitas"
  );
}

/* ---------- Users ---------- */
let editingUserId = null;

function renderUsers() {
  const list = read(STORAGE.users, []);
  const q = (document.getElementById("user-search")?.value || "").toLowerCase();
  const st = document.getElementById("user-filter-status")?.value || "all";
  const tp = document.getElementById("user-filter-type")?.value || "all";

  const filtered = list.filter((u) => {
    const matchQ = !q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    const matchS = st === "all" || u.status === st;
    const matchT = tp === "all" || u.type === tp;
    return matchQ && matchS && matchT;
  });

  const tbody = document.getElementById("users-tbody");
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6"><p class="empty">Nenhum usuário encontrado.</p></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((u) => `
    <tr data-id="${u.id}">
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge badge-info">${escapeHtml(u.type)}</span></td>
      <td><span class="badge ${u.status === "ativo" ? "badge-ok" : "badge-off"}">${escapeHtml(u.status)}</span></td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <button type="button" class="btn-secondary" data-action="toggle">${u.status === "ativo" ? "Desativar" : "Ativar"}</button>
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </td>
    </tr>`).join("");

  tbody.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      const current = read(STORAGE.users, []);
      if (btn.dataset.action === "delete") {
        write(STORAGE.users, current.filter((x) => x.id !== id));
        renderUsers();
        renderOverview();
      } else if (btn.dataset.action === "toggle") {
        const idx = current.findIndex((x) => x.id === id);
        if (idx >= 0) {
          current[idx].status = current[idx].status === "ativo" ? "inativo" : "ativo";
          write(STORAGE.users, current);
          renderUsers();
          renderOverview();
        }
      } else if (btn.dataset.action === "edit") {
        const item = current.find((x) => x.id === id);
        if (!item) return;
        editingUserId = id;
        document.getElementById("u-name").value = item.name || "";
        document.getElementById("u-email").value = item.email || "";
        document.getElementById("u-type").value = item.type || "paciente";
        document.getElementById("u-status").value = item.status || "ativo";
        document.getElementById("user-form-title").textContent = "Editar usuário";
        document.getElementById("user-form-wrap").classList.remove("hidden");
      }
    });
  });
}

function openUserForm() {
  editingUserId = null;
  document.getElementById("u-name").value = "";
  document.getElementById("u-email").value = "";
  document.getElementById("u-type").value = "paciente";
  document.getElementById("u-status").value = "ativo";
  document.getElementById("user-form-title").textContent = "Novo usuário";
  document.getElementById("user-form-wrap").classList.remove("hidden");
}

function saveUser() {
  const list = read(STORAGE.users, []);
  const item = {
    id: editingUserId || uid("u"),
    name: document.getElementById("u-name").value.trim(),
    email: document.getElementById("u-email").value.trim(),
    type: document.getElementById("u-type").value,
    status: document.getElementById("u-status").value,
    createdAt: editingUserId
      ? (list.find((x) => x.id === editingUserId)?.createdAt || daysAgo(0))
      : daysAgo(0)
  };
  if (editingUserId) {
    const idx = list.findIndex((x) => x.id === editingUserId);
    if (idx >= 0) list[idx] = item;
  } else {
    list.push(item);
  }
  write(STORAGE.users, list);
  document.getElementById("user-form-wrap").classList.add("hidden");
  renderUsers();
  renderOverview();
}

/* ---------- Registrations ---------- */
let editingRegId = null;

function renderRegs() {
  const list = read(STORAGE.regs, []);
  const q = (document.getElementById("reg-search")?.value || "").toLowerCase();
  const st = document.getElementById("reg-filter-status")?.value || "all";

  const filtered = list.filter((r) => {
    const matchQ = !q || (r.name || "").toLowerCase().includes(q) || (r.contact || "").toLowerCase().includes(q);
    const matchS = st === "all" || r.status === st;
    return matchQ && matchS;
  });

  const tbody = document.getElementById("regs-tbody");
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6"><p class="empty">Nenhum cadastro encontrado.</p></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((r) => {
    const badge =
      r.status === "aprovado" ? "badge-ok" :
      r.status === "recusado" ? "badge-off" : "badge-pending";
    return `<tr data-id="${r.id}">
      <td>${escapeHtml(r.name)}</td>
      <td><span class="badge badge-info">${escapeHtml(r.type)}</span></td>
      <td>${escapeHtml(r.contact)}</td>
      <td>${formatDate(r.createdAt)}</td>
      <td><span class="badge ${badge}">${escapeHtml(r.status)}</span></td>
      <td>
        ${r.status === "pendente" ? `
          <button type="button" class="btn-secondary" data-action="approve">Aprovar</button>
          <button type="button" class="btn-danger" data-action="reject">Recusar</button>
        ` : ""}
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      const current = read(STORAGE.regs, []);
      const idx = current.findIndex((x) => x.id === id);
      if (btn.dataset.action === "delete") {
        write(STORAGE.regs, current.filter((x) => x.id !== id));
      } else if (btn.dataset.action === "approve" && idx >= 0) {
        current[idx].status = "aprovado";
        write(STORAGE.regs, current);
        // Auto-create user if approved
        const users = read(STORAGE.users, []);
        if (!users.some((u) => u.email === current[idx].contact || u.name === current[idx].name)) {
          users.push({
            id: uid("u"),
            name: current[idx].name,
            email: current[idx].contact.includes("@") ? current[idx].contact : current[idx].name.toLowerCase().replace(/\s+/g, ".") + "@email.com",
            type: current[idx].type,
            status: "ativo",
            createdAt: daysAgo(0)
          });
          write(STORAGE.users, users);
        }
      } else if (btn.dataset.action === "reject" && idx >= 0) {
        current[idx].status = "recusado";
        write(STORAGE.regs, current);
      } else if (btn.dataset.action === "edit" && idx >= 0) {
        const item = current[idx];
        editingRegId = id;
        document.getElementById("r-name").value = item.name || "";
        document.getElementById("r-type").value = item.type || "paciente";
        document.getElementById("r-contact").value = item.contact || "";
        document.getElementById("r-status").value = item.status || "pendente";
        document.getElementById("r-notes").value = item.notes || "";
        document.getElementById("reg-form-wrap").classList.remove("hidden");
        return;
      }
      renderRegs();
      renderOverview();
      renderUsers();
    });
  });
}

function openRegForm() {
  editingRegId = null;
  document.getElementById("r-name").value = "";
  document.getElementById("r-type").value = "paciente";
  document.getElementById("r-contact").value = "";
  document.getElementById("r-status").value = "pendente";
  document.getElementById("r-notes").value = "";
  document.getElementById("reg-form-wrap").classList.remove("hidden");
}

function saveReg() {
  const list = read(STORAGE.regs, []);
  const item = {
    id: editingRegId || uid("reg"),
    name: document.getElementById("r-name").value.trim(),
    type: document.getElementById("r-type").value,
    contact: document.getElementById("r-contact").value.trim(),
    status: document.getElementById("r-status").value,
    notes: document.getElementById("r-notes").value.trim(),
    createdAt: editingRegId
      ? (list.find((x) => x.id === editingRegId)?.createdAt || daysAgo(0))
      : daysAgo(0)
  };
  if (editingRegId) {
    const idx = list.findIndex((x) => x.id === editingRegId);
    if (idx >= 0) list[idx] = item;
  } else {
    list.push(item);
  }
  write(STORAGE.regs, list);
  document.getElementById("reg-form-wrap").classList.add("hidden");
  renderRegs();
  renderOverview();
}

/* ---------- Payments ---------- */
let editingPaymentId = null;

function renderPayments() {
  const list = read(STORAGE.payments, []);
  const paid = list.filter((p) => p.status === "pago");
  const pending = list.filter((p) => p.status === "pendente");
  const late = list.filter((p) => p.status === "atrasado");
  const total = paid.reduce((s, p) => s + Number(p.value || 0), 0);

  document.getElementById("pay-paid-count").textContent = paid.length;
  document.getElementById("pay-pending-count").textContent = pending.length;
  document.getElementById("pay-late-count").textContent = late.length;
  document.getElementById("pay-total").textContent = formatMoney(total);

  const q = (document.getElementById("pay-search")?.value || "").toLowerCase();
  const st = document.getElementById("pay-filter-status")?.value || "all";
  const filtered = list.filter((p) => {
    const matchQ = !q || (p.user || "").toLowerCase().includes(q);
    const matchS = st === "all" || p.status === st;
    return matchQ && matchS;
  });

  const tbody = document.getElementById("payments-tbody");
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6"><p class="empty">Nenhuma mensalidade encontrada.</p></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((p) => {
    const badge =
      p.status === "pago" ? "badge-ok" :
      p.status === "atrasado" ? "badge-off" : "badge-pending";
    return `<tr data-id="${p.id}">
      <td>${escapeHtml(p.user)}</td>
      <td>${escapeHtml(p.plan)}</td>
      <td>${formatMoney(p.value)}</td>
      <td>${formatDate(p.due)}</td>
      <td><span class="badge ${badge}">${escapeHtml(p.status)}</span></td>
      <td>
        ${p.status !== "pago" ? `<button type="button" class="btn-secondary" data-action="mark-paid">Marcar pago</button>` : ""}
        <button type="button" class="btn-secondary" data-action="edit">Editar</button>
        <button type="button" class="btn-danger" data-action="delete">Excluir</button>
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("tr").dataset.id;
      const current = read(STORAGE.payments, []);
      if (btn.dataset.action === "delete") {
        write(STORAGE.payments, current.filter((x) => x.id !== id));
      } else if (btn.dataset.action === "mark-paid") {
        const idx = current.findIndex((x) => x.id === id);
        if (idx >= 0) {
          current[idx].status = "pago";
          write(STORAGE.payments, current);
        }
      } else if (btn.dataset.action === "edit") {
        const item = current.find((x) => x.id === id);
        if (!item) return;
        editingPaymentId = id;
        document.getElementById("p-user").value = item.user || "";
        document.getElementById("p-plan").value = item.plan || "Padrão";
        document.getElementById("p-value").value = item.value || "";
        document.getElementById("p-due").value = item.due || "";
        document.getElementById("p-status").value = item.status || "pendente";
        document.getElementById("payment-form-title").textContent = "Editar mensalidade";
        document.getElementById("payment-form-wrap").classList.remove("hidden");
        return;
      }
      renderPayments();
      renderOverview();
      renderRevenueChart();
    });
  });

  renderRevenueChart();
}

function renderRevenueChart() {
  // Mock 6 months revenue from payments + synthetic history
  const months = [];
  const values = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleDateString("pt-BR", { month: "short" }));
    values.push(Math.round(400 + Math.random() * 600 + (5 - i) * 80));
  }
  // Override current month with real paid total
  const payments = read(STORAGE.payments, []);
  const currentPaid = payments.filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.value || 0), 0);
  values[values.length - 1] = Math.round(currentPaid) || values[values.length - 1];
  barChart("chart-revenue", months, values, "Receita (R$)");
}

function openPaymentForm() {
  editingPaymentId = null;
  const s = read(STORAGE.settings, DEFAULT_SETTINGS);
  document.getElementById("p-user").value = "";
  document.getElementById("p-plan").value = "Padrão";
  document.getElementById("p-value").value = s.planValue || 89.9;
  document.getElementById("p-due").value = daysAgo(0);
  document.getElementById("p-status").value = "pendente";
  document.getElementById("payment-form-title").textContent = "Nova mensalidade";
  document.getElementById("payment-form-wrap").classList.remove("hidden");
}

function savePayment() {
  const list = read(STORAGE.payments, []);
  const item = {
    id: editingPaymentId || uid("pay"),
    user: document.getElementById("p-user").value.trim(),
    plan: document.getElementById("p-plan").value,
    value: parseFloat(document.getElementById("p-value").value) || 0,
    due: document.getElementById("p-due").value,
    status: document.getElementById("p-status").value,
    createdAt: daysAgo(0)
  };
  if (editingPaymentId) {
    const idx = list.findIndex((x) => x.id === editingPaymentId);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
  } else {
    list.push(item);
  }
  write(STORAGE.payments, list);
  document.getElementById("payment-form-wrap").classList.add("hidden");
  renderPayments();
  renderOverview();
}

/* ---------- Settings ---------- */
function loadSettings() {
  const s = read(STORAGE.settings, DEFAULT_SETTINGS);
  document.getElementById("s-name").value = s.name || "";
  document.getElementById("s-email").value = s.email || "";
  document.getElementById("s-plan-value").value = s.planValue ?? 89.9;
}

function saveSettings() {
  const s = {
    name: document.getElementById("s-name").value.trim(),
    email: document.getElementById("s-email").value.trim(),
    planValue: parseFloat(document.getElementById("s-plan-value").value) || 89.9
  };
  write(STORAGE.settings, s);
  const msg = document.getElementById("settings-saved");
  msg.textContent = "Configurações salvas!";
  setTimeout(() => { msg.textContent = ""; }, 2500);
}

function exportData() {
  const data = {
    users: read(STORAGE.users, []),
    regs: read(STORAGE.regs, []),
    payments: read(STORAGE.payments, []),
    traffic: read(STORAGE.traffic, []),
    settings: read(STORAGE.settings, DEFAULT_SETTINGS)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cuidado-puro-admin-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.users) write(STORAGE.users, data.users);
      if (data.regs) write(STORAGE.regs, data.regs);
      if (data.payments) write(STORAGE.payments, data.payments);
      if (data.traffic) write(STORAGE.traffic, data.traffic);
      if (data.settings) write(STORAGE.settings, data.settings);
      document.getElementById("import-msg").textContent = "Dados importados!";
      refreshAll();
    } catch {
      document.getElementById("import-msg").textContent = "Erro ao importar.";
    }
  };
  reader.readAsText(file);
}

function resetDemo() {
  if (!confirm("Resetar todos os dados de demonstração do admin?")) return;
  write(STORAGE.users, DEFAULT_USERS);
  write(STORAGE.regs, DEFAULT_REGS);
  write(STORAGE.payments, DEFAULT_PAYMENTS);
  write(STORAGE.traffic, makeTraffic(30));
  write(STORAGE.settings, DEFAULT_SETTINGS);
  refreshAll();
}

/* ---------- Helpers ---------- */
function refreshIcons() {
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function refreshAll() {
  renderOverview();
  renderTraffic();
  renderUsers();
  renderRegs();
  renderPayments();
  loadSettings();
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

  // Users
  document.getElementById("add-user").addEventListener("click", openUserForm);
  document.getElementById("save-user").addEventListener("click", saveUser);
  document.getElementById("cancel-user").addEventListener("click", () => {
    document.getElementById("user-form-wrap").classList.add("hidden");
  });
  document.getElementById("user-search").addEventListener("input", renderUsers);
  document.getElementById("user-filter-status").addEventListener("change", renderUsers);
  document.getElementById("user-filter-type").addEventListener("change", renderUsers);

  // Regs
  document.getElementById("add-reg").addEventListener("click", openRegForm);
  document.getElementById("save-reg").addEventListener("click", saveReg);
  document.getElementById("cancel-reg").addEventListener("click", () => {
    document.getElementById("reg-form-wrap").classList.add("hidden");
  });
  document.getElementById("reg-search").addEventListener("input", renderRegs);
  document.getElementById("reg-filter-status").addEventListener("change", renderRegs);

  // Payments
  document.getElementById("add-payment").addEventListener("click", openPaymentForm);
  document.getElementById("save-payment").addEventListener("click", savePayment);
  document.getElementById("cancel-payment").addEventListener("click", () => {
    document.getElementById("payment-form-wrap").classList.add("hidden");
  });
  document.getElementById("pay-search").addEventListener("input", renderPayments);
  document.getElementById("pay-filter-status").addEventListener("change", renderPayments);

  // Settings
  document.getElementById("save-settings").addEventListener("click", saveSettings);
  document.getElementById("export-data").addEventListener("click", exportData);
  document.getElementById("import-data").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });
  document.getElementById("reset-demo").addEventListener("click", resetDemo);

  if (isLoggedIn()) showApp(true);
  else showApp(false);
  refreshIcons();
});
