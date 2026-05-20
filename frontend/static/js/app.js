/* ── Config ───────────────────────────────────────────── */
const API = "/api";

/* ── State ────────────────────────────────────────────── */
let token = localStorage.getItem("token") || null;
let user  = JSON.parse(localStorage.getItem("user") || "null");
let allPlants = [];
let currentCategory = "";

/* ── Emoji map for plants ─────────────────────────────── */
const EMOJI = { Flower:"🌸", Vegetable:"🥦", Herb:"🌿", default:"🪴" };

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  if (token) {
    document.getElementById("heroSection").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    showPage("plants");
  }
});

/* ── Navigation ───────────────────────────────────────── */
function renderNav() {
  const btn = document.getElementById("authBtn");
  if (token && user) {
    btn.innerHTML = `<span style="opacity:.8">👤 ${user.username}</span>
      &nbsp;<button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>`;
  } else {
    btn.innerHTML = `<button class="btn btn-outline btn-sm" onclick="openModal('login')">Sign In</button>`;
  }
}

function showPage(name) {
  if (!token) { openModal("login"); return; }
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(name + "Page").style.display = "block";
  if (name === "plants")  loadPlants();
  if (name === "plots")   loadPlots();
  if (name === "tasks")   loadTasks();
}

/* ── API helper ───────────────────────────────────────── */
async function api(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ── Toast ────────────────────────────────────────────── */
function toast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => t.className = "toast", 3000);
}

/* ── Modal ────────────────────────────────────────────── */
function openModal(type) {
  document.getElementById("modalOverlay").classList.add("open");
  const body = document.getElementById("modalBody");
  if (type === "login")   body.innerHTML = loginForm();
  if (type === "register") body.innerHTML = registerForm();
  if (type === "addPlot")  body.innerHTML = addPlotForm();
  if (type === "addTask")  body.innerHTML = addTaskForm();
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

/* ── Auth Forms ───────────────────────────────────────── */
function loginForm() {
  return `<h3>🌱 Sign In</h3>
    <div class="form-group"><label>Email</label><input id="loginEmail" type="email" placeholder="you@example.com"/></div>
    <div class="form-group"><label>Password</label><input id="loginPass" type="password" placeholder="••••••••"/></div>
    <button class="btn btn-green" style="width:100%" onclick="doLogin()">Sign In</button>
    <p class="auth-link">No account? <a onclick="openModal('register')">Register here</a></p>`;
}
function registerForm() {
  return `<h3>🌿 Create Account</h3>
    <div class="form-row">
      <div class="form-group"><label>Username</label><input id="regUser" placeholder="GardenHero"/></div>
      <div class="form-group"><label>Email</label><input id="regEmail" type="email" placeholder="you@example.com"/></div>
    </div>
    <div class="form-group"><label>Password</label><input id="regPass" type="password" placeholder="min 6 chars"/></div>
    <button class="btn btn-green" style="width:100%" onclick="doRegister()">Create Account</button>
    <p class="auth-link">Already have one? <a onclick="openModal('login')">Sign in</a></p>`;
}

async function doLogin() {
  try {
    const data = await api("POST", "/auth/login", {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPass").value,
    });
    setAuth(data.token, data.user);
  } catch(e) { toast(e.message, true); }
}

async function doRegister() {
  try {
    const data = await api("POST", "/auth/register", {
      username: document.getElementById("regUser").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPass").value,
    });
    setAuth(data.token, data.user);
  } catch(e) { toast(e.message, true); }
}

function setAuth(t, u) {
  token = t; user = u;
  localStorage.setItem("token", t);
  localStorage.setItem("user", JSON.stringify(u));
  closeModal();
  document.getElementById("heroSection").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  renderNav();
  showPage("plants");
  toast(`Welcome, ${u.username}! 🌱`);
}

function logout() {
  token = null; user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.getElementById("heroSection").style.display = "block";
  document.getElementById("mainContent").style.display = "none";
  renderNav();
  toast("Goodbye! 👋");
}

/* ── Plants ───────────────────────────────────────────── */
async function loadPlants() {
  try {
    allPlants = await api("GET", "/plants/");
    renderPlants(allPlants);
  } catch(e) { toast(e.message, true); }
}

function filterPlants(cat) {
  currentCategory = cat;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  event.target.classList.add("active");
  const filtered = cat ? allPlants.filter(p => p.category === cat) : allPlants;
  renderPlants(filtered);
}

function renderPlants(plants) {
  const grid = document.getElementById("plantsGrid");
  if (!plants.length) { grid.innerHTML = emptyState("🌱","No plants found"); return; }
  grid.innerHTML = plants.map(p => `
    <div class="card">
      <div class="card-img">${EMOJI[p.category]||EMOJI.default}</div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <span class="card-badge">${p.category}</span>
        <div class="card-meta">
          <span>☀️ ${p.sunlight}</span>
          <span>💧 Watering: ${p.watering}</span>
          <span>🌍 Soil: ${p.soil_type}</span>
          <span>📅 Season: ${p.season}</span>
        </div>
        <p style="font-size:.85rem;color:var(--text-muted);margin-top:.3rem">${p.description||""}</p>
      </div>
    </div>`).join("");
}

/* ── Plots ────────────────────────────────────────────── */
async function loadPlots() {
  try {
    const plots = await api("GET", "/plots/");
    const grid  = document.getElementById("plotsGrid");
    if (!plots.length) { grid.innerHTML = emptyState("🏡","No garden plots yet — add one!"); return; }
    // Load plants for each plot
    const enriched = await Promise.all(plots.map(async pl => {
      pl.plants = await api("GET", `/plots/${pl.id}/plants`);
      return pl;
    }));
    grid.innerHTML = enriched.map(pl => plotCard(pl)).join("");
  } catch(e) { toast(e.message, true); }
}

function plotCard(pl) {
  const plantsHTML = pl.plants.length
    ? pl.plants.map(pp => `
      <li>
        <span>${EMOJI[pp.plant?.category]||"🪴"} ${pp.plant?.name||"Unknown"} ×${pp.quantity}</span>
        <span class="status-badge status-${pp.status}">${pp.status}</span>
      </li>`).join("")
    : "<li style='color:var(--text-muted);font-size:.84rem'>No plants yet</li>";

  return `<div class="card">
    <div class="plot-card-header">
      <h3>${pl.plot_name}</h3>
      <p>${pl.size_sqft ? pl.size_sqft + " sq ft" : ""} ${pl.location ? "• " + pl.location : ""}</p>
    </div>
    <ul class="plot-plants-list">${plantsHTML}</ul>
    <div class="card-actions" style="padding:.6rem 1.1rem 1rem">
      <button class="btn btn-green btn-sm" onclick="openAddPlantModal(${pl.id})">+ Add Plant</button>
      <button class="btn btn-danger btn-sm" onclick="deletePlot(${pl.id})">🗑</button>
    </div>
  </div>`;
}

function addPlotForm() {
  return `<h3>🏡 New Garden Plot</h3>
    <div class="form-group"><label>Plot Name</label><input id="plotName" placeholder="Backyard Bed A"/></div>
    <div class="form-row">
      <div class="form-group"><label>Size (sq ft)</label><input id="plotSize" type="number" placeholder="40"/></div>
      <div class="form-group"><label>Location</label><input id="plotLoc" placeholder="Backyard"/></div>
    </div>
    <button class="btn btn-green" style="width:100%" onclick="createPlot()">Create Plot</button>`;
}

async function createPlot() {
  try {
    await api("POST", "/plots/", {
      plot_name:  document.getElementById("plotName").value,
      size_sqft:  parseFloat(document.getElementById("plotSize").value)||null,
      location:   document.getElementById("plotLoc").value,
    });
    closeModal(); loadPlots(); toast("Plot created! 🏡");
  } catch(e) { toast(e.message, true); }
}

async function deletePlot(id) {
  if (!confirm("Delete this plot and all its plants?")) return;
  try {
    await api("DELETE", `/plots/${id}`);
    loadPlots(); toast("Plot deleted.");
  } catch(e) { toast(e.message, true); }
}

function openAddPlantModal(plotId) {
  document.getElementById("modalOverlay").classList.add("open");
  const opts = allPlants.map(p => `<option value="${p.id}">${p.name} (${p.category})</option>`).join("");
  document.getElementById("modalBody").innerHTML = `
    <h3>🪴 Add Plant to Plot</h3>
    <div class="form-group"><label>Plant</label><select id="apPlant">${opts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Quantity</label><input id="apQty" type="number" value="1" min="1"/></div>
      <div class="form-group"><label>Planted Date</label><input id="apDate" type="date"/></div>
    </div>
    <div class="form-group"><label>Notes</label><textarea id="apNotes" rows="2" placeholder="Optional notes…"></textarea></div>
    <button class="btn btn-green" style="width:100%" onclick="addPlantToPlot(${plotId})">Add Plant</button>`;
}

async function addPlantToPlot(plotId) {
  try {
    await api("POST", `/plots/${plotId}/plants`, {
      plant_id:     parseInt(document.getElementById("apPlant").value),
      quantity:     parseInt(document.getElementById("apQty").value)||1,
      planted_date: document.getElementById("apDate").value || null,
      notes:        document.getElementById("apNotes").value,
    });
    closeModal(); loadPlots(); toast("Plant added! 🌱");
  } catch(e) { toast(e.message, true); }
}

/* ── Tasks ────────────────────────────────────────────── */
async function loadTasks() {
  try {
    const tasks = await api("GET", "/tasks/");
    const list  = document.getElementById("tasksList");
    if (!tasks.length) { list.innerHTML = emptyState("✅","No tasks yet — add one!"); return; }
    const today = new Date().toISOString().split("T")[0];
    list.innerHTML = tasks.map(t => {
      const overdue = t.due_date && t.due_date < today && !t.completed;
      return `<div class="task-item ${t.completed?"done":""}" id="task-${t.id}">
        <input class="task-check" type="checkbox" ${t.completed?"checked":""} onchange="toggleTask(${t.id}, this.checked)"/>
        <div class="task-info">
          <div class="task-title">${t.title}</div>
          ${t.due_date ? `<div class="task-due ${overdue?"task-overdue":""}">📅 ${t.due_date}${overdue?" — Overdue!":""}</div>` : ""}
          ${t.description ? `<div style="font-size:.85rem;color:var(--text-muted)">${t.description}</div>` : ""}
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">🗑</button>
      </div>`;
    }).join("");
  } catch(e) { toast(e.message, true); }
}

function addTaskForm() {
  return `<h3>✅ New Care Task</h3>
    <div class="form-group"><label>Title</label><input id="taskTitle" placeholder="Water the roses"/></div>
    <div class="form-group"><label>Description</label><textarea id="taskDesc" rows="2" placeholder="Details…"></textarea></div>
    <div class="form-group"><label>Due Date</label><input id="taskDue" type="date"/></div>
    <button class="btn btn-green" style="width:100%" onclick="createTask()">Add Task</button>`;
}

async function createTask() {
  try {
    await api("POST", "/tasks/", {
      title:       document.getElementById("taskTitle").value,
      description: document.getElementById("taskDesc").value,
      due_date:    document.getElementById("taskDue").value || null,
    });
    closeModal(); loadTasks(); toast("Task added! ✅");
  } catch(e) { toast(e.message, true); }
}

async function toggleTask(id, done) {
  try {
    await api("PATCH", `/tasks/${id}`, { completed: done });
    const el = document.getElementById("task-" + id);
    if (el) el.classList.toggle("done", done);
  } catch(e) { toast(e.message, true); }
}

async function deleteTask(id) {
  try {
    await api("DELETE", `/tasks/${id}`);
    loadTasks(); toast("Task removed.");
  } catch(e) { toast(e.message, true); }
}

/* ── Utility ──────────────────────────────────────────── */
function emptyState(icon, msg) {
  return `<div class="empty"><div class="icon">${icon}</div><p>${msg}</p></div>`;
}
