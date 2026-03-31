import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icon } from '../components/icons/Icon';

export function ResetPasswordView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPassword = useMutation(api.emailVerification.resetPassword);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setError('Token no válido');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: formData.password,
      });
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
              <Icon name="error" className="text-white text-5xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Token no válido
          </h2>
          <p className="text-gray-400 mb-6">
            El enlace de restablecimiento no es válido o ha expirado
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Icon name="lock_reset" className="text-white text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Restablecer Contraseña
              </h2>
              <p className="text-gray-400 text-sm">
                Crea una nueva contraseña segura para tu cuenta
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="lock" className="text-gray-500 text-xl" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="lock" className="text-gray-500 text-xl" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
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
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <Icon name="check_circle" className="text-xl" />
                    Restablecer Contraseña
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="security" className="text-primary text-xl flex-shrink-0 mt-0.5" />
                <div className="text-gray-400 text-xs space-y-1">
                  <p>🔒 Tu contraseña se guarda encriptada con scrypt</p>
                  <p>⏱️ Este enlace expirará después de usarse</p>
                  <p>🛡️ No compartas tu contraseña con nadie</p>
                </div>
              </div>
            </div>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Volver al login
              </button>
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
              ¡Contraseña restablecida!
            </h2>
            <p className="text-gray-400 mb-6">
              Tu contraseña ha sido actualizada exitosamente
            </p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-400 text-sm">
                🎉 Serás redirigido al login en 3 segundos...
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all"
            >
              Ir al Login ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordView;
