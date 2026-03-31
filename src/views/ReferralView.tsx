import React from 'react';
import { Usuario } from '../types';
import { ReferralPanel } from '../components/ReferralPanel';

interface ReferralViewProps {
  usuario: Usuario | null;
  onLoginRequest: () => void;
}

const ReferralView: React.FC<ReferralViewProps> = ({ usuario, onLoginRequest }) => {
  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700 p-4">
      <ReferralPanel usuario={usuario} onLoginRequest={onLoginRequest} />
    </div>
  );
};

export default ReferralView;
