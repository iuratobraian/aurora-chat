import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Usuario, Curso, Clase } from '../types';
import ElectricLoader from '../components/ElectricLoader';
import logger from '../utils/logger';
import CourseAssistant from '../components/agents/CourseAssistant';

interface CursosProps {
  usuario: Usuario | null;
  onVisitProfile: (userId: string) => void;
  onLoginRequest?: () => void;
}

const extractYoutubeId = (url: string): string | null => {
    const match = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/).pop();
    return match ? match.split(/[^0-9a-z_-]/i)[0] || null : null;
};

const CinemaModal: React.FC<{ clase: Clase; onClose: () => void; onWatched: () => void }> = ({ clase, onClose, onWatched }) => {
    useEffect(() => {
        const timer = setTimeout(onWatched, 5000);
        return () => clearTimeout(timer);
    }, [clase.id]);

    return (
        <div className="fixed inset-0 z-[200] bg-black/98 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-full max-w-6xl aspect-video bg-black relative group shadow-2xl shadow-primary/20 border border-white/5 rounded-xl overflow-hidden mx-4">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(clase.videoUrl)}?autoplay=1&modestbranding=1&rel=0`}
                    title={clase.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tighter">{clase.titulo}</h2>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">Modo Cine • HD</p>
                        </div>
                        <button onClick={onClose} className="size-9 rounded-lg bg-white/5 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6 text-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3">Disfrutando de la Clase</p>
                <div className="flex items-center gap-5 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-xl animate-pulse">tv</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase">Sin Interrupciones</span>
                    </div>
                    <div className="w-px h-6 bg-white/5"></div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-signal-green text-xl">verified</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase">Calidad Premium</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CursosView: React.FC<CursosProps> = ({ usuario, onVisitProfile, onLoginRequest }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<'Todos' | 'Principiante' | 'Intermedio' | 'Avanzado'>('Todos');
  const [showMembershipPopup, setShowMembershipPopup] = useState(false);
  const [showRankWarning, setShowRankWarning] = useState(false);
  const [isEnteringModule, setIsEnteringModule] = useState(false);
  const [showCourseChat, setShowCourseChat] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const data = await StorageService.getCursos();
        setCursos(data);
    } catch (err) {
        logger.error("Error fetching cursos:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleEnterCourse = (curso: Curso) => {
      if (!usuario || usuario.id === 'guest') {
          setShowMembershipPopup(true);
          return;
      }
      
      const isCursante = usuario.rol === 'cursante' || usuario.rol === 'admin' || usuario.rol === 'ceo' || usuario.rol === 'programador';
      
      if (!isCursante) {
          setShowRankWarning(true);
          return;
      }

      setIsEnteringModule(true);
      
      // Artificial delay for futuristic immersion
      setTimeout(() => {
          setSelectedCurso(curso);
          setIsEnteringModule(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1200);
  };

  const handleMarkAsWatched = async (cursoId: string, claseId: string) => {
      if (!usuario) return;
      const currentWatched = usuario.watchedClasses || [];
      if (currentWatched.includes(claseId)) return;

      const updatedUser = {
          ...usuario,
          watchedClasses: [...currentWatched, claseId]
      };
      await StorageService.updateUser(updatedUser);
      
      const curso = cursos.find(c => c.id === cursoId);
      if (curso && curso.contenido) {
          const courseClaseIds = curso.contenido.map(c => c.id);
          const allWatched = courseClaseIds.every(id => updatedUser.watchedClasses.includes(id));
          if (allWatched) {
              const hasMedal = (usuario.medallas || []).some(m => m.nombre === `Experto en ${curso.titulo}`);
              if (!hasMedal) {
                  const diploma: any = {
                      id: crypto.randomUUID(),
                      nombre: `Experto en ${curso.titulo}`,
                      icono: '🎓',
                      descripcion: `Completó satisfactoriamente el curso ${curso.titulo}`,
                      otorgadaPor: 'Academia TS',
                      fecha: new Date().toISOString()
                  };
                  updatedUser.medallas = [...(usuario.medallas || []), diploma];
                  await StorageService.updateUser(updatedUser);
                  alert(`¡Felicidades! Has completado el curso ${curso.titulo} y recibido tu diploma.`);
              }
          }
      }
  };

  const filteredCourses = activeSector === 'Todos' 
      ? cursos 
      : cursos.filter(c => c.nivel === activeSector);

  // --- RENDERING DETAIL VIEW ---
  if (selectedCurso) {
      return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              {selectedClase && (
                  <CinemaModal 
                    clase={selectedClase} 
                    onClose={() => setSelectedClase(null)}
                    onWatched={() => handleMarkAsWatched(selectedCurso.id, selectedClase.id)}
                  />
              )}
              
              <div className="flex items-center gap-3 mb-4">
                  <button 
                    onClick={() => setSelectedCurso(null)}
                    className="group bg-white dark:bg-white/5 hover:bg-primary text-gray-500 dark:text-gray-300 hover:text-white size-9 rounded-lg flex items-center justify-center transition-all border border-gray-100 dark:border-white/5 shadow-sm"
                  >
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                  </button>
                  <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-0.5">{selectedCurso.titulo}</h2>
                      <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${selectedCurso.nivel === 'Principiante' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                              NIVEL {selectedCurso.nivel}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{selectedCurso.duracion} • {selectedCurso.lecciones} Módulos</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 space-y-4">
                      <div className="rounded-xl p-5 border border-white/5 bg-[#0d1117] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             <span className="text-6xl">{selectedCurso.emoji || '🎓'}</span>
                          </div>
                          <div className="relative z-10">
                              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">info</span>
                                  Sobre este curso
                              </h3>
                              <p className="text-xs text-gray-400 leading-relaxed font-medium mb-5">{selectedCurso.descripcion}</p>
                              <div className="pt-4 border-t border-white/5">
                                  <div className="flex items-center gap-3">
                                      <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/20">
                                          {selectedCurso.instructor?.[0] || 'TS'}
                                      </div>
                                      <div>
                                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5">Instructor</p>
                                          <p className="text-xs font-black text-white">{selectedCurso.instructor || 'Staff TradeHub'}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {usuario && selectedCurso.contenido && (
                          <div className="rounded-xl p-5 border border-primary/20 bg-primary/5">
                              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                                  Tu Progreso
                                  <span className="text-primary">{Math.round(((selectedCurso.contenido?.filter(c => usuario.watchedClasses?.includes(c.id)).length || 0) / (selectedCurso.contenido?.length || 1)) * 100) || 0}%</span>
                              </h3>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-5 border border-white/5">
                                  <div 
                                      className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000 rounded-full" 
                                      style={{ width: `${((selectedCurso.contenido?.filter(c => usuario.watchedClasses?.includes(c.id)).length || 0) / (selectedCurso.contenido?.length || 1)) * 100 || 0}%` }}
                                  ></div>
                              </div>
                              <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400">
                                      <span className="material-symbols-outlined text-sm text-signal-green">verified</span>
                                      Acceso de por vida
                                  </div>
                                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400">
                                      <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                                      Diploma de certificación
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-center justify-between px-1">
                          <h3 className="text-xs font-black text-white uppercase tracking-widest">Contenido del Programa</h3>
                          <span className="text-[9px] text-gray-500 font-bold uppercase">{selectedCurso.contenido?.length || 0} CLASES</span>
                      </div>
                      <div className="space-y-2">
                          {selectedCurso.contenido && selectedCurso.contenido.length > 0 ? (
                              selectedCurso.contenido.map((clase, i) => {
                                  const isWatched = usuario?.watchedClasses?.includes(clase.id);
                                  return (
                                      <button 
                                          key={clase.id} 
                                          onClick={() => setSelectedClase(clase)}
                                          className={`w-full group/clase relative overflow-hidden p-4 rounded-lg transition-all text-left flex items-center gap-4 border ${isWatched ? 'bg-primary/[0.03] border-primary/20' : 'bg-white/5 hover:bg-white/[0.08] border-white/5 hover:border-white/10'} cursor-pointer`}
                                      >
                                          {isWatched && (
                                              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-signal-green/10 border border-signal-green/20">
                                                  <span className="material-symbols-outlined text-signal-green text-[10px] font-black">done_all</span>
                                                  <span className="text-[7px] text-signal-green font-black uppercase tracking-tighter">Visto</span>
                                              </div>
                                          )}
                                          <div className={`size-10 rounded-lg flex items-center justify-center text-sm font-black transition-all ${isWatched ? 'bg-primary text-white' : 'bg-black/50 text-gray-500 group-hover/clase:bg-primary group-hover/clase:text-white'}`}>
                                              {i + 1}
                                          </div>
                                          <div className="flex-1">
                                              <h4 className={`text-xs font-black transition-colors ${isWatched ? 'text-primary' : 'text-white group-hover/clase:text-primary'} uppercase tracking-tight`}>{clase.titulo}</h4>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-0.5">
                                                      <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                      {clase.duracion}
                                                  </span>
                                              </div>
                                          </div>
                                          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/clase:bg-primary transition-all group-hover/clase:scale-110">
                                              <span className="material-symbols-outlined text-white text-sm">play_arrow</span>
                                          </div>
                                      </button>
                                  );
                              })
                          ) : (
                              <div className="p-10 border-2 border-dashed border-white/5 rounded-xl text-center">
                                  <span className="text-3xl block mb-3 opacity-30">⌛</span>
                                  <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Sin clases disponibles aún.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDERING GRID VIEW ---
  return (
    <div className="max-w-[1600px] mx-auto pb-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                {/* Removed title Academia Expert per request */}
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="size-1.5 rounded-full bg-signal-green animate-pulse"></span>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Formación Profesional Activa</p>
                </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                {['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map(s => (
                    <button 
                        key={s}
                        onClick={() => setActiveSector(s as any)}
                        className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSector === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && (
                <div className="col-span-full py-20 flex justify-center">
                    <ElectricLoader text="Cargando formación..." />
                </div>
            )}
            
            {filteredCourses.map(curso => {
                const prog = usuario && curso.contenido ? Math.round(((curso.contenido?.filter(c => usuario.watchedClasses?.includes(c.id)).length || 0) / (curso.contenido?.length || 1)) * 100) : 0;
                const colorMap: Record<string, string> = { Principiante: '#10b981', Intermedio: '#f59e0b', Avanzado: '#ef4444' };
                const neonColor = colorMap[curso.nivel] || '#3b82f6';

                return (
                    <div 
                        key={curso.id} 
                        onClick={() => handleEnterCourse(curso)}
                        className="relative rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all group bg-[#0d1117] flex flex-col cursor-pointer hover:shadow-xl"
                    >
                        {/* Neon top glow */}
                        <div
                            className="absolute top-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{ background: `linear-gradient(90deg, transparent, ${neonColor}, transparent)`, boxShadow: `0 0 8px ${neonColor}` }}
                        />
                        {/* Header */}
                        <div className="relative h-28 w-full overflow-hidden flex items-center justify-center bg-black/40">
                            <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-700"
                                style={{ background: `radial-gradient(ellipse at center, ${neonColor}80 0%, transparent 70%)` }} />
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: `linear-gradient(${neonColor}40 1px, transparent 1px), linear-gradient(90deg, ${neonColor}40 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }} />
                            <span className="text-5xl group-hover:scale-110 transition-all duration-500 relative z-10 drop-shadow-lg">{curso.emoji || '📚'}</span>
                            <div className="absolute top-3 left-3">
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border backdrop-blur-sm"
                                    style={{ color: neonColor, borderColor: neonColor + '40', backgroundColor: neonColor + '15' }}>
                                    {curso.nivel}
                                </span>
                            </div>
                            {prog > 0 && (
                                <div className="absolute top-3 right-3 size-8 rounded-full flex items-center justify-center text-[9px] font-black border"
                                    style={{ backgroundColor: '#10b98120', borderColor: '#10b981', color: '#10b981', boxShadow: `0 0 8px #10b98140` }}>
                                    {prog}%
                                </div>
                            )}
                        </div>
                        {/* Body */}
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="text-sm font-black text-white line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">{curso.titulo}</h3>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest shrink-0">{curso.duracion}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-2 mb-3 flex-1 leading-relaxed">{curso.descripcion}</p>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest px-1">
                                    <span className="text-gray-500">Progreso</span>
                                    <span style={{ color: neonColor }}>{prog}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full transition-all duration-1000 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                        style={{ width: `${prog}%`, backgroundColor: neonColor, boxShadow: `0 0 8px ${neonColor}` }} 
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-xs text-gray-600">play_circle</span>
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{curso.lecciones} módulos</span>
                                </div>
                                <div className="flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: neonColor }}>Acceder</span>
                                    <span className="material-symbols-outlined text-xs" style={{ color: neonColor }}>arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {showMembershipPopup && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                <div className="w-full max-w-sm rounded-xl p-8 shadow-2xl bg-[#0d1117] border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 size-40 bg-primary/20 blur-3xl rounded-full"></div>
                    <button onClick={() => setShowMembershipPopup(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white z-10">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="size-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-xl shadow-primary/30">
                        <span className="material-symbols-outlined text-2xl text-white">lock</span>
                    </div>
                    <h3 className="text-base font-black uppercase tracking-tighter text-white mb-2">Membresía Requerida</h3>
                    <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed px-2">
                        Este programa es exclusivo para la comunidad. Inicia sesión para acceder.
                    </p>
                    <button 
                        onClick={() => { setShowMembershipPopup(false); if(onLoginRequest) onLoginRequest(); }}
                        className="w-full py-3 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Acceder al Portal
                    </button>
                </div>
            </div>
        )}

        {showRankWarning && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                <div className="w-full max-w-sm rounded-xl p-8 shadow-2xl bg-[#0d1117] border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 size-40 bg-yellow-500/20 blur-3xl rounded-full"></div>
                    <button onClick={() => setShowRankWarning(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white z-10">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="size-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-xl shadow-yellow-500/30">
                        <span className="material-symbols-outlined text-2xl text-white">workspace_premium</span>
                    </div>
                    <h3 className="text-base font-black uppercase tracking-tighter text-white mb-2">Acceso Restringido</h3>
                    <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed px-2">
                        Este curso está reservado para el grado <span className="text-yellow-500 font-black">CURSANTE</span>. Solicita tu acceso en soporte si deseas aprender con nosotros.
                    </p>
                    <button 
                        onClick={() => setShowRankWarning(false)}
                        className="w-full py-3 bg-white/5 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all border border-white/10"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        )}

        {isEnteringModule && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-8">
                    <ElectricLoader size="lg" text="" />
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em] animate-pulse">Cargando Módulo</h2>
                        <div className="h-1 w-48 bg-white/5 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-primary animate-progress-fast" />
                        </div>
                    </div>
                </div>
            </div>
        )}

      {/* Chat Flotante de Cursos */}
      <button
        onClick={() => setShowCourseChat(!showCourseChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="text-2xl">📚</span>
      </button>

      {showCourseChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={() => setShowCourseChat(false)}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform"
          >
            ✕
          </button>
          <CourseAssistant />
        </div>
      )}
    </div>
  );
};

export default CursosView;