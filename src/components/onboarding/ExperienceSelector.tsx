import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface ExperienceSelectorProps {
  userId: string;
  onSelect: (level: string) => void;
}

const LEVELS = [
  {
    id: 'beginner',
    title: 'Principiante',
    description: 'Estoy empezando mi camino en el trading. Quiero aprender las bases.',
    icon: 'school',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'intermediate',
    title: 'Intermedio',
    description: 'Ya opero pero busco consistencia y mejores herramientas.',
    icon: 'trending_up',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'advanced',
    title: 'Avanzado / Pro',
    description: 'Soy un trader experimentado. Busco herramientas de alto nivel.',
    icon: 'diamond',
    color: 'from-violet-500 to-purple-600',
  },
];

export const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({ userId, onSelect }) => {
  const updateProfile = useMutation(api.profiles.updateProfile);

  const handleSelect = async (level: string) => {
    try {
      await updateProfile({
        userId,
        rol: level === 'beginner' ? 'principiante' : level === 'intermediate' ? 'trader_intermedio' : 'trader_experimentado',
      });
      onSelect(level);
    } catch (error) {
      console.error('Error updating experience level:', error);
      onSelect(level);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Personalización</span>
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-2 italic tracking-tight">Elegí tu nivel de trading</h2>
        <p className="text-white/40 font-medium">Adaptaremos tu experiencia en TradeShare según tu conocimiento actual.</p>
      </div>

      <div className="grid gap-4 w-full">
        {LEVELS.map((level, index) => (
          <motion.button
            key={level.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(level.id)}
            className="group relative flex items-center gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            
            <div className={`size-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white shadow-xl shadow-black/40`}>
              <span className="material-symbols-outlined text-3xl">{level.icon}</span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-violet-400 transition-colors">
                {level.title}
              </h3>
              <p className="text-sm text-white/40 mt-1 font-medium italic">
                {level.description}
              </p>
            </div>

            <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
          </motion.button>
        ))}
      </div>

      <p className="mt-12 text-[9px] font-black uppercase tracking-[0.4em] text-white/10">
        Paso 1 de 3 • Configuración de Perfil
      </p>
    </div>
  );
};

export default ExperienceSelector;
