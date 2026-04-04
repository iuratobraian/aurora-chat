import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import './AuroraHiveDashboard.css';
import { Suspense, lazy } from 'react';

const AuroraSupportSection = lazy(() => import('../../components/admin/AuroraSupportSection'));


const SEV_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const AuroraHiveDashboard = () => {
  const [title, setTitle] = useState('');
  const [epic, setEpic] = useState('');
  const [description, setDescription] = useState('');
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagLog, setDiagLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'tasks' | 'diag' | 'support'>('dispatch');
  const transmissionsRef = useRef<HTMLDivElement>(null);

  // ── Convex Queries ──────────────────────────────────────────
  const metrics = useQuery(api.auroraHive.getHiveMetrics);
  const pendingTasks = useQuery(api.auroraHive.getPendingTasks, { limit: 20 });
  const inProgressTasks = useQuery(api.auroraHive.getInProgressTasks);
  const doneTasks = useQuery(api.auroraHive.getCompletedTasks, { limit: 20 });
  const transmissions = useQuery(api.auroraHive.getActiveTransmissions, { limit: 40 });
  const unreviewedErrors = useQuery(api.systemErrors.getUnreviewedErrors);

  // ── Convex Mutations ────────────────────────────────────────
  const createTask = useMutation(api.auroraHive.createTask);
  const createDiagnosticTasks = useMutation(api.auroraHive.createDiagnosticTasks);

  // Auto-scroll transmisiones
  useEffect(() => {
    if (transmissionsRef.current) {
      transmissionsRef.current.scrollTop = 0;
    }
  }, [transmissions]);

  // ── Dispatcher manual ───────────────────────────────────────
  const handleLaunchTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask({ title, epic: epic || "General", description, priority: 1, source: "manual" });
      setTitle(''); setDescription(''); setEpic('');
    } catch (error) {
      console.error("Error al inyectar tarea en el Hive:", error);
    }
  };

  // ── Auto-Diagnóstico ─────────────────────────────────────────
  const runDiagnostic = async () => {
    setDiagRunning(true);
    setDiagLog([]);
    const log = (msg: string) => setDiagLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    log('🔍 Iniciando diagnóstico de la plataforma...');

    // 1. Chequear errores sin revisar de systemErrors
    const errors = unreviewedErrors || [];
    log(`📊 Errores sin resolver en DB: ${errors.length}`);

    const toFix = errors.filter(e => e.severity === 'critical' || e.severity === 'high');
    log(`🚨 Errores críticos/altos detectados: ${toFix.length}`);

    // 2. Verificar conectividad Convex
    log('🌐 Verificando conectividad con Convex...');
    const convexOk = metrics !== undefined;
    log(convexOk ? '✅ Convex: Conectado' : '❌ Convex: Sin respuesta');

    // 3. Chequear tareas en progreso atascadas (> 30 min sin update)
    const stuckThreshold = Date.now() - 30 * 60 * 1000;
    const inProgressTasks = (pendingTasks || []).filter((t: any) => t.status === 'in_progress' && t.updatedAt < stuckThreshold);
    if (inProgressTasks.length > 0) {
      log(`⚠️ ${inProgressTasks.length} tarea(s) atascada(s) por más de 30 min`);
    }

    // 4. Crear tareas automáticas para errores críticos
    if (toFix.length > 0) {
      log(`🤖 Creando ${toFix.length} tarea(s) de auto-reparación...`);
      try {
        const result = await createDiagnosticTasks({
          errors: toFix.map(e => ({
            message: e.errorMessage,
            severity: e.severity,
            pageUrl: e.pageUrl || window.location.hostname,
          }))
        });
        log(`✅ ${result.created} tarea(s) nueva(s) creadas en el Hive`);
        if (result.created > 0) {
          log('🚀 El Worker detectará las tareas en el próximo ciclo (15s) y dispatching a agentes');
        } else {
          log('ℹ️ Todas las tareas ya existen como pendientes — sin duplicados');
        }
      } catch (err) {
        log('❌ Error al crear tareas diagnóstico');
      }
    } else {
      log('✅ No hay errores críticos sin tarea de reparación asignada');
    }

    log('🏁 Diagnóstico completo.');
    setDiagRunning(false);
  };

  const completionPct = metrics && metrics.total > 0
    ? Math.round((metrics.done / metrics.total) * 100)
    : 0;

  // ── Tipo de transmisión → color ──────────────────────────────
  const typeColor: Record<string, string> = {
    log: '#6366f1',
    claim: '#8b5cf6',
    complete: '#22c55e',
    alert: '#ef4444',
  };

  return (
    <div className="aurora-hive-container" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── HEADER ── */}
      <header className="hive-header" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>hub</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>
              ✨ Aurora Hive Mind Control
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Centro de Coordinación Autónoma · Real-Time
            </p>
          </div>
        </div>
        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sistema Activo</span>
        </div>
      </header>

      {/* ── MÉTRICAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pendientes', value: metrics?.pending ?? 0, icon: 'pending', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
          { label: 'En progreso', value: metrics?.inProgress ?? 0, icon: 'autorenew', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
          { label: 'Completadas', value: metrics?.done ?? 0, icon: 'check_circle', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
          { label: 'Hoy', value: metrics?.doneToday ?? 0, icon: 'today', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)' },
          { label: 'Errores sin resolver', value: unreviewedErrors?.length ?? 0, icon: 'bug_report', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
        ].map(m => (
          <div key={m.label} style={{
            background: m.bg, border: `1px solid ${m.border}`,
            borderRadius: 14, padding: '14px 16px', textAlign: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ color: m.color, fontSize: 22 }}>{m.icon}</span>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginTop: 4 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de progreso global */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 20 }}>
        <div style={{
          height: '100%', width: `${completionPct}%`,
          background: 'linear-gradient(90deg, #7c3aed, #22c55e)',
          borderRadius: 8, transition: 'width 0.6s ease'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: -16, marginBottom: 20 }}>
        <span>0%</span>
        <span style={{ color: '#a78bfa', fontWeight: 700 }}>{completionPct}% completado · {metrics?.total ?? 0} tareas totales</span>
        <span>100%</span>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'dispatch', label: '🚀 Dispatcher', icon: 'send' },
          { id: 'tasks', label: '📋 Tareas', icon: 'list' },
          { id: 'diag', label: '🔍 Auto-Diagnóstico', icon: 'troubleshoot' },
          { id: 'support', label: '🤖 Support Agent', icon: 'support_agent' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── GRID CONTENT ── */}
      <div className="hive-grid">

        {/* LEFT PANEL */}
        <div>
          {activeTab === 'dispatch' && (
            <section className="hive-panel dispatcher">
              <h2>⚡ Inyectar Tarea Directa</h2>
              <form onSubmit={handleLaunchTask}>
                <div className="form-group">
                  <label>Épica / Proyecto</label>
                  <input value={epic} onChange={e => setEpic(e.target.value)} placeholder="Ej. [FIX-011] Nuevo Fix" />
                </div>
                <div className="form-group">
                  <label>Comando Directo (Obligatorio)</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Corregir crash en SignalsView" required />
                </div>
                <div className="form-group">
                  <label>Criterio de Aceptación</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Qué debe hacer el agente..." rows={3} />
                </div>
                <button type="submit" className="launch-btn">⚡ INICIAR OPERACIÓN</button>
              </form>
            </section>
          )}

          {activeTab === 'tasks' && (
            <section className="hive-panel tasks-queue">
              <h2>📋 Pendientes ({pendingTasks?.length ?? 0})</h2>
              {!pendingTasks || pendingTasks.length === 0 ? (
                <p className="empty-state">✅ Sin tareas pendientes. El enjambre descansa.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingTasks.map((task: any) => (
                    <li key={task._id} className="task-item pending" style={{
                      background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8
                    }}>
                      <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 16, marginTop: 2 }}>pending</span>
                      <div style={{ flex: 1 }}>
                        <span className="epic-badge" style={{ fontSize: 9, background: task.source === 'auto-diagnostic' ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)', color: task.source === 'auto-diagnostic' ? '#ef4444' : '#a78bfa', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {task.source === 'auto-diagnostic' ? '🔍 AUTO' : task.epic || 'MANUAL'}
                        </span>
                        <strong style={{ display: 'block', fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{task.title}</strong>
                        <span style={{ fontSize: 10, color: '#64748b' }}>{new Date(task.createdAt).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* ── EN PROGRESO ── */}
              <h2 style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                🔄 En Proceso ({inProgressTasks?.length ?? 0})
                {(inProgressTasks?.length ?? 0) > 0 && (
                  <span style={{ fontSize: 9, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
                )}
              </h2>
              {!inProgressTasks || inProgressTasks.length === 0 ? (
                <p className="empty-state" style={{ color: '#475569', fontSize: 11 }}>Sin agentes trabajando ahora.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inProgressTasks.map((task: any) => {
                    const elapsed = Math.round((Date.now() - (task.updatedAt || task.createdAt)) / 60000);
                    return (
                      <li key={task._id} style={{
                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 10, padding: '10px 12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: 16, animation: 'spin 2s linear infinite' }}>autorenew</span>
                          <strong style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>{task.title}</strong>
                          <span style={{ fontSize: 9, color: '#475569' }}>{elapsed}min</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 1.5s infinite' }} />
                            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>
                              {task.assignedTo || 'Agente desconocido'}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                            background: elapsed > 30 ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.2)',
                            color: elapsed > 30 ? '#ef4444' : '#a78bfa'
                          }}>
                            {elapsed > 30 ? '⚠️ Posible bloqueo' : '✅ Activo'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <h2 style={{ marginTop: 20 }}>✅ Completadas ({doneTasks?.length ?? 0})</h2>
              {!doneTasks || doneTasks.length === 0 ? (
                <p className="empty-state">Ninguna completada aún.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {doneTasks.map((task: any) => (
                    <li key={task._id} style={{
                      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                      borderRadius: 10, padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center'
                    }}>
                      <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: 16 }}>check_circle</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 11, color: '#94a3b8' }}>{task.title}</strong>
                        <span style={{ display: 'block', fontSize: 9, color: '#475569' }}>{task.assignedTo || 'Agente desconocido'} · {new Date(task.updatedAt || task.createdAt).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'diag' && (
            <section className="hive-panel" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 20 }}>
              <h2 style={{ color: '#ef4444', marginBottom: 12 }}>🔍 Motor de Auto-Diagnóstico</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>
                Escanea el sistema en tiempo real, detecta errores críticos registrados en la DB y crea tareas automáticas para que los agentes las resuelvan.
              </p>

              <button
                onClick={runDiagnostic}
                disabled={diagRunning}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: diagRunning ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: '#fff', fontWeight: 800, fontSize: 13, cursor: diagRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', marginBottom: 16
                }}
              >
                {diagRunning ? '⏳ Diagnosticando...' : '🚨 EJECUTAR DIAGNÓSTICO AHORA'}
              </button>

              {/* Log del diagnóstico */}
              <div style={{
                background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 12, minHeight: 120, maxHeight: 260, overflowY: 'auto',
                fontFamily: 'monospace', fontSize: 11
              }}>
                {diagLog.length === 0 ? (
                  <span style={{ color: '#475569' }}>// Aguardando diagnóstico...</span>
                ) : (
                  diagLog.map((l, i) => (
                    <div key={i} style={{
                      color: l.includes('❌') ? '#ef4444' : l.includes('✅') ? '#22c55e' : l.includes('⚠️') ? '#eab308' : l.includes('🚨') ? '#f97316' : '#94a3b8',
                      marginBottom: 2
                    }}>{l}</div>
                  ))
                )}
              </div>

              {/* Tabla de errores detectados */}
              {unreviewedErrors && unreviewedErrors.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    Errores en DB ({unreviewedErrors.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {unreviewedErrors.slice(0, 10).map((err: any) => (
                      <div key={err._id} style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px',
                        border: `1px solid ${SEV_COLOR[err.severity] || '#475569'}33`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: SEV_COLOR[err.severity] || '#94a3b8', textTransform: 'uppercase' }}>
                            {err.severity}
                          </span>
                          <span style={{ fontSize: 9, color: '#475569' }}>{new Date(err.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                          {err.errorMessage?.substring(0, 120)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            )}

          {activeTab === 'support' && (
            <section style={{ minHeight: 400 }}>
              {/* Bridge banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 12, padding: '10px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span className="material-symbols-outlined" style={{ color: '#a78bfa', fontSize: 18 }}>link</span>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#a78bfa' }}>Puente activo:</strong> Los hallazgos de alta prioridad detectados aquí crean tareas automáticamente en el Hive y son despachados a los agentes en el próximo ciclo del Worker (15s).
                </p>
              </div>
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#64748b', fontSize: 12 }}>
                  ⏳ Cargando Aurora Support Agent...
                </div>
              }>
                <AuroraSupportSection />
              </Suspense>
            </section>
          )}
        </div>

        {/* RIGHT PANEL: TRANSMISIONES */}
        <div className="hive-status-column">
          <section className="hive-panel chat-logs">
            <h2>📡 Transmisiones Neuronales</h2>
            <div className="terminal-box" ref={transmissionsRef}>
              {(!transmissions || transmissions.length === 0) ? (
                <div style={{ color: '#475569', fontSize: 11 }}>// Sin transmisiones aún...</div>
              ) : (
                transmissions.map((msg: any) => (
                  <div key={msg._id} className={`log-line type-${msg.type}`} style={{
                    borderLeft: `3px solid ${typeColor[msg.type] || '#475569'}`,
                    paddingLeft: 8, marginBottom: 6
                  }}>
                    <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    <span className="agent-tag" style={{ color: typeColor[msg.type] || '#a78bfa' }}> [{msg.agentId}] </span>
                    <span className="message" style={{ color: '#cbd5e1' }}>{msg.message}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
