const quickActions = [
  { label: "Estado", command: "/status" },
  { label: "Inicio Brief", command: "/aurora/session-brief" },
  { label: "Speed", command: "/speed-check" },
  { label: "Surfaces", command: "/aurora/surfaces" },
  { label: "Health", command: "/aurora/health-snapshot" },
  { label: "Drift", command: "/aurora/drift-report" },
  { label: "Scorecard", command: "/aurora/scorecard-daily" },
  { label: "Score History", command: "/aurora/scorecard-history" },
  { label: "Product", command: "/aurora/product-snapshot" },
  { label: "Failure Modes", command: "/aurora/product/failure-modes" },
  { label: "Conectores", command: "/conectores" },
  { label: "Runtime", command: "/aurora/runtime-status" },
  { label: "Antigravity Sync", command: "/antigravity-sync" }
];

const state = {
  messages: [
    {
      role: "aurora",
      text: "Aurora lista. Esta consola prioriza claridad, estado del sistema y acciones utiles para producto, codigo y aprendizaje."
    }
  ],
  summary: null,
  alerts: [],
  speed: null,
  health: null,
  sessionBrief: null,
  surfaces: null,
  scorecard: null,
  drift: null,
  scoreHistory: null,
  productSnapshot: null
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function renderSummary() {
  const node = document.getElementById("session-summary");
  const summary = state.summary;
  const health = state.health;
  const scorecard = state.scorecard;
  const product = state.productSnapshot;
  if (!node) return;
  if (!summary) {
    node.innerHTML = `<div class="summary-grid"><div class="summary-line"><strong>Preparando</strong><span>Cargando estado de Aurora...</span></div></div>`;
    return;
  }
  
  const healthColor = health?.health === "green" ? "#22c55e" : health?.health === "yellow" ? "#f59e0b" : "#ef4444";
  const scoreValue = scorecard?.metrics?.overallScore || scorecard?.utilityScore || "-";
  const driftSignals = health?.driftSignals || 0;
  const productHealth = product?.overallHealth;
  const productHealthColor = productHealth?.status === "green" ? "#22c55e" : productHealth?.status === "yellow" ? "#f59e0b" : "#ef4444";
  const productScore = productHealth?.score || "-";
  const productFailures = product?.summary?.totalFailuresHigh || 0;
  
  node.innerHTML = `
    <div class="summary-grid">
      <div class="summary-line"><strong style="color:${healthColor}">${health?.health || "?"}</strong><span>aurora health</span></div>
      <div class="summary-line"><strong>${summary.tasks?.open ?? 0}</strong><span>tareas abiertas</span></div>
      <div class="summary-line"><strong style="color:${driftSignals > 5 ? "#ef4444" : "#22c55e"}">${driftSignals}</strong><span>drift signals</span></div>
      <div class="summary-line"><strong>${scoreValue}</strong><span>aurora score</span></div>
      <div class="summary-line"><strong style="color:${productHealthColor}">${productHealth?.status || "?"}</strong><span>product health</span></div>
      <div class="summary-line"><strong>${productScore}</strong><span>product score</span></div>
      <div class="summary-line"><strong style="color:${productFailures > 0 ? "#ef4444" : "#22c55e"}">${productFailures}</strong><span>product failures</span></div>
      <div class="summary-line"><strong>${productHealth?.totalSurfaces || 0}</strong><span>product surfaces</span></div>
    </div>
  `;
}

function renderSessionBrief() {
  const node = document.getElementById("session-brief");
  const brief = state.sessionBrief;
  if (!node) return;
  if (!brief) {
    node.innerHTML = `
      <h2>Session Brief</h2>
      <div class="brief-block">
        <p>Cargando contexto inicial...</p>
      </div>
    `;
    return;
  }

  const mcpItems = (brief.mcpSelection?.selected || [])
    .map(
      (item) => `
        <li>
          <strong>${item.id}</strong>
          <span>${item.readiness} · ${item.role}</span>
        </li>
      `
    )
    .join("");

  node.innerHTML = `
    <h2>Session Brief</h2>
    <div class="brief-block">
      <div class="brief-section">
        <strong>${brief.proactiveImprovement?.title || "Sin mejora propuesta"}</strong>
        <p>${brief.proactiveImprovement?.statement || "No hay statement disponible."}</p>
      </div>
      <div class="brief-section">
        <strong>Next Action</strong>
        <p>${brief.nextAction?.statement || "Sin siguiente paso claro."}</p>
        <p>${brief.nextAction?.whyNow || ""}</p>
      </div>
      <div class="brief-section">
        <strong>MCP Stack</strong>
        <ul class="brief-list">${mcpItems || "<li><strong>Sin stack</strong><span>No hay MCPs seleccionados.</span></li>"}</ul>
      </div>
      <div class="brief-section">
        <strong>Research Cache</strong>
        <div class="brief-chip-grid">
          <div class="brief-chip">
            <strong>${brief.research?.repo || "Sin repo"}</strong>
            <span>${brief.research?.source || "Sin fuente"}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderQuickActions() {
  const node = document.getElementById("quick-actions");
  if (!node) return;
  node.innerHTML = quickActions
    .map(
      (item) =>
        `<button class="quick-action" data-command="${item.command}">${item.label}</button>`
    )
    .join("");
  node.querySelectorAll(".quick-action").forEach((button) => {
    button.addEventListener("click", () => runCommand(button.dataset.command));
  });
}

function renderAlerts() {
  const tray = document.getElementById("alert-tray");
  if (!tray) return;
  const alerts = state.alerts.length
    ? state.alerts
    : [
        {
          severity: state.speed?.health ? "success" : "info",
          text: state.speed?.summary || "Aurora lista",
          detail: state.speed?.healthMessage || "Sin alertas fuertes"
        }
      ];
  tray.innerHTML = alerts
    .map(
      (alert) => `
      <div class="alert-pill ${alert.severity || "info"}">
        <strong>${alert.text}</strong>
        ${alert.detail ? `<div class="alert-detail">${alert.detail}</div>` : ""}
      </div>`
    )
    .join("");
}

function renderChat() {
  const view = document.getElementById("chat-view");
  if (!view) return;
  const speed = state.speed;
  view.innerHTML = `
    <section class="chat-shell">
      <div class="chat-head">
        <div>
          <p class="chat-kicker">Aurora Runtime</p>
          <h3>Control simple, memoria util, sync rapido</h3>
        </div>
        <div class="meta-strip">
          <div class="meta-item"><strong>${speed?.knowledgeEntries ?? "-"}</strong><span>knowledge</span></div>
          <div class="meta-item"><strong>${speed?.structuredCoveragePct ?? "-"}%</strong><span>estructura</span></div>
          <div class="meta-item"><strong>${speed?.alerts?.length ?? 0}</strong><span>alertas</span></div>
        </div>
      </div>
      <div class="message-list" id="message-list">
        ${state.messages
          .map((message) => `<div class="message ${message.role}">${message.text}</div>`)
          .join("")}
      </div>
      <div class="composer">
        <input id="chat-input" placeholder="Escribe un comando o una pregunta..." />
        <button id="send-button" class="primary-button">Enviar</button>
      </div>
    </section>
  `;

  document.getElementById("send-button").addEventListener("click", submitInput);
  document.getElementById("chat-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitInput();
  });
  const list = document.getElementById("message-list");
  if (list) list.scrollTop = list.scrollHeight;
}

function addMessage(role, text) {
  state.messages.push({ role, text });
  renderChat();
}

async function runCommand(command) {
  addMessage("user", command);
  if (command === "/antigravity-sync") {
    try {
      const result = await fetchJson("/antigravity-sync");
      addMessage("aurora", result.message || "Antigravity sync ejecutado.");
      await refreshAll();
    } catch (error) {
      addMessage("aurora", `No se pudo ejecutar el sync: ${error.message}`);
    }
    return;
  }
  if (command.startsWith("/aurora/") || command === "/status" || command === "/conectores" || command === "/speed-check") {
    try {
      const data = await fetchJson(command);
      if (command === "/aurora/session-brief") {
        state.sessionBrief = data;
        renderSessionBrief();
        addMessage(
          "aurora",
          `${data.proactiveImprovement?.title || "Session brief"}: ${data.nextAction?.statement || "sin next action"}`
        );
        return;
      }
      if (command === "/aurora/health-snapshot") {
        state.health = data;
        renderSummary();
        addMessage(
          "aurora",
          `Health ${data.health}. Open tasks: ${data.openTasks}. Drift signals: ${data.driftSignals}.`
        );
        return;
      }
      if (command === "/aurora/drift-report") {
        state.drift = data;
        state.alerts = (data.signals || []).map((s) => ({ severity: s.severity, text: s.title, detail: s.statement }));
        renderAlerts();
        addMessage(
          "aurora",
          `Drift report listo: ${data.summary?.totalSignals || 0} señales.`
        );
        return;
      }
      if (command === "/aurora/scorecard-daily") {
        state.scorecard = data;
        renderSummary();
        addMessage(
          "aurora",
          `Scorecard diario: overall ${data.metrics?.overallScore || data.utilityScore || "-"}.`
        );
        return;
      }
      if (command === "/speed-check") {
        state.speed = data;
        state.alerts = [
          ...(data.alerts || []),
          ...state.alerts
        ];
        renderAlerts();
        renderChat();
        addMessage(
          "aurora",
          `${data.summary}. Knowledge: ${data.knowledgeEntries}. Cobertura estructurada: ${data.structuredCoveragePct}%.`
        );
        return;
      }
      if (command === "/status") {
        state.summary = data;
        renderSummary();
        addMessage(
          "aurora",
          `Estado: ${data.tasks?.open ?? 0} tareas abiertas y ${data.tasks?.critical ?? 0} críticas.`
        );
        return;
      }
      if (command === "/conectores") {
        const activeApis = data.apis?.filter((item) => item.activo).map((item) => item.id) || [];
        addMessage(
          "aurora",
          `Conectores activos: ${activeApis.length ? activeApis.join(", ") : "ninguno"}.`
        );
        return;
      }
      if (command === "/aurora/runtime-status") {
        addMessage(
          "aurora",
          `Runtime PID ${data.runtime?.pid ?? "?"}, puerto ${data.runtime?.port ?? "?"}, estado ${data.runtimeStatus?.state || data.processStatus?.state || "desconocido"}.`
        );
        return;
      }
      addMessage("aurora", JSON.stringify(data, null, 2));
      return;
    } catch (error) {
      addMessage("aurora", `Error: ${error.message}`);
      return;
    }
  }
  try {
    const data = await fetchJson(`/chat?q=${encodeURIComponent(command)}`);
    addMessage("aurora", data.answer || "Sin respuesta.");
  } catch (error) {
    addMessage("aurora", `Error: ${error.message}`);
  }
}

function submitInput() {
  const input = document.getElementById("chat-input");
  const value = input.value.trim();
  if (!value) return;
  input.value = "";
  runCommand(value);
}

async function refreshAll() {
  try {
    const [status, speed, health, sessionBrief, scorecard, drift, surfaces, scoreHistory, productSnapshot] = await Promise.all([
      fetchJson("/status"),
      fetchJson("/speed-check"),
      fetchJson("/aurora/health-snapshot"),
      fetchJson("/aurora/session-brief"),
      fetchJson("/aurora/scorecard-daily"),
      fetchJson("/aurora/drift-report"),
      fetchJson("/aurora/surfaces"),
      fetchJson("/aurora/scorecard-history"),
      fetchJson("/aurora/product-snapshot")
    ]);
    state.summary = status;
    state.speed = speed;
    state.health = health;
    state.sessionBrief = sessionBrief;
    state.scorecard = scorecard;
    state.drift = drift;
    state.surfaces = surfaces;
    state.scoreHistory = scoreHistory;
    state.productSnapshot = productSnapshot;
    state.alerts = [
      ...((speed.alerts || []).map((s) => ({ severity: s.severity, text: s.text, detail: s.detail }))),
      ...(drift.signals || []).map(s => ({ severity: s.severity, text: s.title, detail: s.statement })),
      ...(health.driftSignals > 0 ? [{ severity: "warning", text: `${health.driftSignals} drift signals`, detail: "Verificar consistencia del board" }] : []),
      ...((productSnapshot?.summary?.totalFailuresHigh || 0) > 0 ? [{ severity: "error", text: `${productSnapshot.summary.totalFailuresHigh} failure modes de alta severidad`, detail: productSnapshot.worstSurfaces?.map(s => s.surfaceId).join(", ") }] : [])
    ];
  } catch (error) {
    state.alerts = [{ severity: "critical", text: "No se pudo refrescar Aurora", detail: error.message }];
  }
  renderSummary();
  renderSessionBrief();
  renderAlerts();
  renderQuickActions();
  renderChat();
}

document.getElementById("refresh-button").addEventListener("click", refreshAll);
document.getElementById("sync-button").addEventListener("click", () => runCommand("/antigravity-sync"));

refreshAll();
