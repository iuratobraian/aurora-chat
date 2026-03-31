import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Props {
  userId: string;
  onClose?: () => void;
}

const SubcommunityInvites: React.FC<Props> = ({ userId, onClose }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const invites = useQuery(api.subcommunityInvites.getPendingInvites, { userId }) as any[] | undefined;
  const acceptInvite = useMutation(api.subcommunityInvites.acceptInvite);
  const declineInvite = useMutation(api.subcommunityInvites.declineInvite);

  const handleAccept = async (inviteId: string) => {
    setProcessing(inviteId);
    try {
      await acceptInvite({ inviteId: inviteId as any, userId });
    } catch (err) {
      console.error('Error accepting invite:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessing(inviteId);
    try {
      await declineInvite({ inviteId: inviteId as any, userId });
    } catch (err) {
      console.error('Error declining invite:', err);
    } finally {
      setProcessing(null);
    }
  };

  if (!invites || invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-400">mail</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Invitaciones Pendientes ({invites.length})
        </h3>
      </div>

      {invites.map((invite: any) => (
        <div
          key={invite._id}
          className="glass rounded-xl border border-violet-500/20 p-4 bg-violet-500/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {invite.subcommunity?.name || 'Subcomunidad'}
              </h4>
              <p className="text-xs text-white/50 mt-1 line-clamp-2">
                {invite.subcommunity?.description || 'Invitación a subcomunidad privada'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
                <span>{invite.subcommunity?.currentMembers || 0} miembros</span>
                {invite.expiresAt && (
                  <span>
                    Expira: {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAccept(invite._id)}
                disabled={processing === invite._id}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {processing === invite._id ? '...' : 'Aceptar'}
              </button>
              <button
                onClick={() => handleDecline(invite._id)}
                disabled={processing === invite._id}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubcommunityInvites;
