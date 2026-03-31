import React from 'react';

interface Course {
  _id: string;
  titulo: string;
  descripcion: string;
  thumbnail: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  precio: number;
  clases?: any[];
}

interface CourseCardProps {
  course: Course;
  progress?: {
    porcentaje: number;
    clasesCompletadas: string[];
  };
  onOpen: (courseId: string) => void;
  onPurchase?: (courseId: string) => void;
  hasAccess?: boolean;
}

const NIVEL_COLORS = {
  principiante: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  intermedio: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  avanzado: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress,
  onOpen,
  onPurchase,
  hasAccess = false,
}) => {
  const nivelColor = NIVEL_COLORS[course.nivel];

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 group cursor-pointer">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Nivel Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${nivelColor}`}>
            {course.nivel}
          </span>
        </div>

        {/* Precio */}
        <div className="absolute bottom-3 right-3">
          {course.precio === 0 ? (
            <span className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-black uppercase tracking-wider">
              GRATIS
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider">
              ${course.precio}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2 group-hover:text-primary transition-colors">
          {course.titulo}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {course.descripcion}
        </p>

        {/* Progress Bar */}
        {hasAccess && progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Progreso</span>
              <span className="text-[10px] text-white font-black">{progress.porcentaje}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.porcentaje}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => hasAccess ? onOpen(course._id) : onPurchase?.(course._id)}
          className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            hasAccess
              ? 'bg-primary/10 hover:bg-primary/20 text-primary'
              : 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/20'
          }`}
        >
          {hasAccess ? 'Continuar' : 'Comprar Ahora'}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
