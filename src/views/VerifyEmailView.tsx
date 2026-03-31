import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Icon } from '../components/icons/Icon';

export function VerifyEmailView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyEmail = useMutation(api.emailVerification.verifyEmail);
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token no encontrado en la URL');
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail({ token });
        setStatus('success');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.message || 'Error al verificar el email');
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="verified" className="text-primary text-2xl" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verificando tu email</h2>
            <p className="text-gray-400">
              Un momento, estamos confirmando tu cuenta...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <Icon name="check_circle" className="text-white text-5xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Email verificado con éxito!
            </h2>
            <p className="text-gray-400 mb-6">
              Tu cuenta ha sido activada. Bienvenido a TradeShare!
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

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <Icon name="error" className="text-white text-5xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Error de verificación
            </h2>
            <p className="text-gray-400 mb-4">
              {error || 'Ha ocurrido un error al verificar tu email'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/registro')}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Volver al registro
              </button>
              
              <button
                onClick={() => navigate('/contacto')}
                className="w-full bg-white/5 border border-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/10 transition-all"
              >
                Contactar soporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default VerifyEmailView;
