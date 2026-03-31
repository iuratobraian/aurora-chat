import React from 'react';
import { Usuario } from '../types';

interface ProfileVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  usuario: Usuario | null;
  onFollow?: (userId: string) => void;
}

const ProfileVisitModal: React.FC<ProfileVisitModalProps> = ({ isOpen, onClose, userId, usuario, onFollow }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1d21] rounded-3xl p-6 w-full max-w-md border border-gray-200 dark:border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg text-gray-900 dark:text-white">Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-gray-500 text-sm">User ID: {userId}</p>
      </div>
    </div>
  );
};

export default ProfileVisitModal;
