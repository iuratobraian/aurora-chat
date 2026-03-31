import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icon } from './icons/Icon';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBackToLogin?: () => void;
}

export function ForgotPasswordModal({ onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendResetEmail = useAction(api.emailVerification.sendPasswordResetEmailAction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendResetEmail({ email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="close" className="text-2xl" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Icon name="lock_reset" className="text-white text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-gray-400 text-sm">
                No te preocupes, te enviaremos instrucciones para restablecerla
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email de tu cuenta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="email" className="text-gray-500 text-xl" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <Icon name="error" className="text-lg" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Icon name="send" className="text-xl" />
                    Enviar Email de Reset
                  </>
                )}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <button
                onClick={onBackToLogin}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Volver al login
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-400 text-xs text-center">
                🔒 El email expirará en 24 horas por seguridad. 
                Si no recibes el email, revisa tu carpeta de spam.
              </p>
            </div>
          </>
        ) : (
          /* Success Message */
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <Icon name="check_circle" className="text-white text-5xl" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Email enviado!
            </h2>
            <p className="text-gray-400 mb-6">
              Hemos enviado instrucciones de restablecimiento a:
              <br />
              <span className="text-primary font-semibold">{email}</span>
            </p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Icon name="info" className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
                <div className="text-green-400 text-sm space-y-2">
                  <p>1. Revisa tu bandeja de entrada</p>
                  <p>2. Haz click en el enlace del email</p>
                  <p>3. Crea tu nueva contraseña</p>
                  <p className="text-xs opacity-75">⏱️ El enlace expira en 24 horas</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Entendido
              </button>
              
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-white/5 border border-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/10 transition-all"
              >
                Enviar a otro email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
