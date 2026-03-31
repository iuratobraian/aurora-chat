import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ProgressBar } from '../../components/academy/ProgressBar';
import { useToast } from '../../components/ToastProvider';
import { Usuario } from '../../types';

interface CoursePlayerViewProps {
  courseId: string;
  usuario: Usuario | null;
  onBack: () => void;
}

interface CourseClass {
  _id: string;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  duracion: string;
  tipo: 'video' | 'texto' | 'pdf';
  contenido?: string;
  archivoUrl?: string;
  gratis: boolean;
  orden: number;
}

export const CoursePlayerView: React.FC<CoursePlayerViewProps> = ({
  courseId,
  usuario,
  onBack,
}) => {
  const { showToast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Queries
  const course = useQuery(api.courses.getCourseWithClasses, { courseId: courseId as any }) as any;
  const progress = useQuery(api.classes.getUserProgress, 
    usuario ? { userId: usuario.id, courseId: courseId as any } : "skip"
  ) as any;
  const completedClasses = useQuery(api.classes.getCompletedClasses,
    usuario ? { userId: usuario.id, courseId: courseId as any } : "skip"
  ) as string[] || [];

  // Mutations
  const markComplete = useMutation(api.classes.markClassComplete);

  // Auto-select first class
  useEffect(() => {
    if (course?.classes?.length > 0 && !selectedClass) {
      setSelectedClass(course.classes[0]._id);
    }
  }, [course, selectedClass]);

  const handleSelectClass = (classId: string) => {
    setSelectedClass(classId);
  };

  const handleMarkComplete = async (classId: string) => {
    if (!usuario) return;

    try {
      await markComplete({
        courseId: courseId as any,
        classId: classId as any,
      });
      showToast('success', '¡Clase completada!');
    } catch (error: any) {
      showToast('error', error.message || 'Error al marcar como completada');
    }
  };

  const handleNextClass = () => {
    if (!course?.classes || !selectedClass) return;
    const currentIndex = course.classes.findIndex((c: any) => c._id === selectedClass);
    if (currentIndex < course.classes.length - 1) {
      setSelectedClass(course.classes[currentIndex + 1]._id);
    }
  };

  const handlePrevClass = () => {
    if (!course?.classes || !selectedClass) return;
    const currentIndex = course.classes.findIndex((c: any) => c._id === selectedClass);
    if (currentIndex > 0) {
      setSelectedClass(course.classes[currentIndex - 1]._id);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Cargando curso...</p>
        </div>
      </div>
    );
  }

  const currentClass = course.classes.find((c: any) => c._id === selectedClass);
  const totalClasses = course.classes.length;
  const completedCount = completedClasses.length;
  const progressPercentage = Math.round((completedCount / totalClasses) * 100);

  return (
    <div className={`min-h-screen transition-all ${isCinemaMode ? 'bg-black' : 'bg-[#0f1115]'}`}>
      {/* Header */}
      {!isCinemaMode && (
        <div className="glass border-b border-white/10 p-4 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-white">arrow_back</span>
              </button>
              <div>
                <h1 className="text-lg font-black text-white uppercase tracking-wider">
                  {course.titulo}
                </h1>
                <p className="text-gray-400 text-xs">{course.descripcion}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="w-48 hidden md:block">
                <ProgressBar
                  current={completedCount}
                  total={totalClasses}
                  showLabel={false}
                  size="sm"
                />
              </div>

              {/* Cinema Mode Toggle */}
              <button
                onClick={() => setIsCinemaMode(!isCinemaMode)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isCinemaMode
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
                <span className="hidden md:inline">Modo Cine</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Container */}
            <div className={`relative rounded-2xl overflow-hidden bg-black ${isCinemaMode ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-video'}`}>
              {currentClass?.tipo === 'video' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={currentClass.videoUrl}
                  title={currentClass.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : currentClass?.tipo === 'texto' ? (
                <div className="w-full h-full p-8 overflow-y-auto">
                  <h2 className="text-2xl font-black text-white mb-4">{currentClass?.titulo}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap">{currentClass?.contenido}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <a
                    href={currentClass?.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Descargar PDF
                  </a>
                </div>
              )}

              {/* Cinema Mode Exit Button */}
              {isCinemaMode && (
                <button
                  onClick={() => setIsCinemaMode(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors z-[110]"
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              )}
            </div>

            {/* Class Info */}
            {currentClass && (
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
                      {currentClass.titulo}
                    </h2>
                    <p className="text-gray-400 text-sm">{currentClass.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                    <span className="text-gray-400 text-xs font-bold">{currentClass.duracion}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevClass}
                      disabled={!course.classes.find((c: any) => c._id === selectedClass) || course.classes.indexOf(course.classes.find((c: any) => c._id === selectedClass)) === 0}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Anterior
                    </button>
                    <button
                      onClick={handleNextClass}
                      disabled={course.classes.indexOf(course.classes.find((c: any) => c._id === selectedClass)) === course.classes.length - 1}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      Siguiente
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleMarkComplete(currentClass._id)}
                    disabled={completedClasses.includes(currentClass._id)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                      completedClasses.includes(currentClass._id)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {completedClasses.includes(currentClass._id) ? 'check_circle' : 'check'}
                    </span>
                    {completedClasses.includes(currentClass._id) ? 'Completada' : 'Marcar como Vista'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Class List Sidebar - 1 column */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Contenido del Curso
                </h3>
                <span className="text-gray-400 text-xs font-bold">
                  {completedCount}/{totalClasses} completadas
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <ProgressBar
                  current={completedCount}
                  total={totalClasses}
                  size="sm"
                />
              </div>

              {/* Class List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {course.classes.map((classItem: any, index: number) => {
                  const isCompleted = completedClasses.includes(classItem._id);
                  const isSelected = selectedClass === classItem._id;
                  const isLocked = !classItem.gratis && index > 0 && !completedClasses.some(id => 
                    course.classes.slice(0, index).some((c: any) => c._id === id)
                  );

                  return (
                    <button
                      key={classItem._id}
                      onClick={() => !isLocked && handleSelectClass(classItem._id)}
                      disabled={isLocked}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-primary/20 border-primary/50'
                          : isLocked
                          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-400'
                            : isSelected
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-sm">check</span>
                          ) : (
                            <span className="text-xs font-black">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold mb-1 ${
                            isSelected ? 'text-white' : 'text-gray-300'
                          }`}>
                            {classItem.titulo}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                              {classItem.tipo}
                            </span>
                            <span className="text-[10px] text-gray-500">•</span>
                            <span className="text-[10px] text-gray-500">
                              {classItem.duracion}
                            </span>
                          </div>
                        </div>

                        {isLocked && (
                          <span className="material-symbols-outlined text-gray-500 text-sm">lock</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerView;
