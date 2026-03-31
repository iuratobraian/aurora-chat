import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CourseCard } from '../../components/academy/CourseCard';
import { AccessSelector } from '../../components/academy/AccessSelector';
import { useToast } from '../../components/ToastProvider';
import { Usuario } from '../../types';

interface CommunityAcademyViewProps {
  communityId: string;
  usuario: Usuario | null;
  isMember: boolean;
  onLoginRequest?: () => void;
}

interface Course {
  _id: string;
  titulo: string;
  descripcion: string;
  thumbnail: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  precio: number;
}

export const CommunityAcademyView: React.FC<CommunityAcademyViewProps> = ({
  communityId,
  usuario,
  isMember,
  onLoginRequest,
}) => {
  const { showToast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Queries
  const academy = useQuery(api.academies.getAcademy, { communityId: communityId as any }) as any;
  const courses = useQuery(api.academies.getAcademyCourses, academy?._id ? { academyId: academy._id } : "skip") as Course[] || [];
  const accessTypes = useQuery(api.courses.getCourseAccessTypes, selectedCourse ? { courseId: selectedCourse as any } : "skip") as any[] || [];
  
  // User progress for each course
  const userProgresses: any = {};
  const userAccesses: any = {};
  
  if (usuario && courses.length > 0) {
    courses.forEach((course) => {
      const progress = useQuery(api.classes.getUserProgress, { userId: usuario.id, courseId: course._id as any });
      const hasAccess = useQuery(api.courses.hasCourseAccess, { userId: usuario.id, courseId: course._id as any });
      if (progress) userProgresses[course._id] = progress;
      if (hasAccess !== undefined) userAccesses[course._id] = hasAccess;
    });
  }

  // Mutations
  const purchaseCourse = useMutation(api.courses.purchaseCourse);

  const handleOpenCourse = (courseId: string) => {
    // Dispatch event to open course player
    window.dispatchEvent(new CustomEvent('open-course-player', {
      detail: { courseId }
    }));
  };

  const handlePurchaseClick = (courseId: string) => {
    if (!usuario) {
      onLoginRequest?.();
      return;
    }
    setSelectedCourse(courseId);
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (accessTypeId: string) => {
    if (!selectedCourse || !usuario) return;

    try {
      // Aquí iría la integración con MercadoPago
      // Por ahora, compra directa
      await purchaseCourse({
        courseId: selectedCourse as any,
        accessTypeId: accessTypeId as any,
      });

      showToast('success', '¡Curso comprado exitosamente!');
      setShowPurchaseModal(false);
      setSelectedCourse(null);
    } catch (error: any) {
      showToast('error', error.message || 'Error al comprar el curso');
    }
  };

  if (!academy) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-violet-600/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">school</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          Academia en Construcción
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          El creador está preparando contenido exclusivo para esta comunidad. ¡Volvé pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Academy Header */}
      <div className="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                {academy.nombre}
              </h1>
              <p className="text-gray-400 text-sm">{academy.descripcion}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
              <span className="text-white font-black text-lg">{courses.length}</span>
              <span className="text-gray-400 text-xs uppercase tracking-wider">Cursos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl">collections_bookmark</span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Cursos Disponibles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                progress={userProgresses[course._id]}
                hasAccess={userAccesses[course._id]}
                onOpen={handleOpenCourse}
                onPurchase={handlePurchaseClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">inbox</span>
          <p className="text-gray-400 text-sm">No hay cursos disponibles aún</p>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedCourse && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-4xl glass rounded-3xl p-8 border border-white/10 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                Elegí tu Plan
              </h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            {accessTypes.length > 0 ? (
              <>
                <AccessSelector
                  accessTypes={accessTypes}
                  onSelect={() => {}}
                />

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Get selected from AccessSelector (would need to lift state)
                      showToast('info', 'Integración con MercadoPago pendiente');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 transition-all"
                  >
                    Continuar a Pago
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">error</span>
                <p className="text-gray-400 text-sm">No hay tipos de acceso configurados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityAcademyView;
