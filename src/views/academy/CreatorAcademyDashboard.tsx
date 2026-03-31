import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../../components/ToastProvider';
import { ProgressBar } from '../../components/academy/ProgressBar';

interface CreatorAcademyDashboardProps {
  communityId: string;
  ownerId: string;
  onBack: () => void;
}

interface Course {
  _id: string;
  titulo: string;
  descripcion: string;
  thumbnail: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  precio: number;
  activo: boolean;
  orden: number;
}

export const CreatorAcademyDashboard: React.FC<CreatorAcademyDashboardProps> = ({
  communityId,
  ownerId,
  onBack,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'stats'>('courses');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Queries
  const academy = useQuery(api.academies.getAcademy, { communityId: communityId as any }) as any;
  const courses = useQuery(api.academies.getAcademyCourses, academy?._id ? { academyId: academy._id } : "skip") as Course[] || [];

  // Mutations
  const createAcademy = useMutation(api.academies.createAcademy);
  const createCourse = useMutation(api.courses.createCourse);

  const handleCreateAcademy = async () => {
    try {
      await createAcademy({
        communityId: communityId as any,
        nombre: 'Academia de Trading',
        descripcion: 'Cursos exclusivos para la comunidad',
      });
      showToast('success', 'Academia creada exitosamente');
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear academia');
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    if (!academy?._id) return;

    try {
      await createCourse({
        academyId: academy._id,
        titulo: courseData.titulo,
        descripcion: courseData.descripcion,
        thumbnail: courseData.thumbnail,
        nivel: courseData.nivel,
        precio: courseData.precio,
        orden: courses.length,
      });
      showToast('success', 'Curso creado exitosamente');
      setShowCreateCourse(false);
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear curso');
    }
  };

  // Stats calculations
  const totalStudents = 0; // TODO: Implement query
  const totalRevenue = 0; // TODO: Implement query
  const averageProgress = 0; // TODO: Implement query

  if (!academy) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-white/10">
        <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-violet-600/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">school</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          No hay Academia
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Crea tu academia para comenzar a subir cursos y monetizar tu conocimiento
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Volver
          </button>
          <button
            onClick={handleCreateAcademy}
            className="px-8 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20"
          >
            Crear Academia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              Dashboard de la Academia
            </h1>
            <p className="text-gray-400 text-sm">{academy.nombre}</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateCourse(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo Curso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-2xl">school</span>
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Total Cursos</span>
          </div>
          <p className="text-3xl font-black text-white">{courses.length}</p>
        </div>

        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-green-400 text-2xl">groups</span>
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Estudiantes</span>
          </div>
          <p className="text-3xl font-black text-white">{totalStudents}</p>
        </div>

        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-2xl">attach_money</span>
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Ingresos</span>
          </div>
          <p className="text-3xl font-black text-white">${totalRevenue}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'courses'
              ? 'border-primary text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Cursos
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'students'
              ? 'border-primary text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Estudiantes
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'stats'
              ? 'border-primary text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">inbox</span>
              <p className="text-gray-400 text-sm mb-4">No hay cursos creados aún</p>
              <button
                onClick={() => setShowCreateCourse(true)}
                className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Crear Primer Curso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => setSelectedCourse(course._id)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${
                        course.nivel === 'principiante' ? 'bg-green-500/20 text-green-400' :
                        course.nivel === 'intermedio' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {course.nivel}
                      </span>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-black uppercase">
                        ${course.precio}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">
                      {course.titulo}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {course.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        course.activo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {course.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button className="text-primary hover:text-blue-400 text-xs font-bold uppercase tracking-wider">
                        Editar →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">groups</span>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            Estudiantes Inscritos
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Los estudiantes aparecerán aquí cuando se inscriban en tus cursos
          </p>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <span className="material-symbols-outlined text-gray-500 text-6xl mb-4">analytics</span>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            Estadísticas Detalladas
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Las estadísticas de rendimiento y ventas aparecerán aquí
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourse && (
        <CreateCourseModal
          isOpen={showCreateCourse}
          onClose={() => setShowCreateCourse(false)}
          onCreate={handleCreateCourse}
        />
      )}
    </div>
  );
};

// Create Course Modal Component
const CreateCourseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    thumbnail: '',
    nivel: 'principiante' as 'principiante' | 'intermedio' | 'avanzado',
    precio: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl glass rounded-3xl p-8 border border-white/10 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">
            Crear Nuevo Curso
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Título del Curso
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"
              placeholder="Ej: Trading desde Cero"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors h-32 resize-none"
              placeholder="Describí qué van a aprender los estudiantes..."
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Nivel
              </label>
              <select
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Precio ($)
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"
                placeholder="0 para gratis"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20"
            >
              Crear Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorAcademyDashboard;
