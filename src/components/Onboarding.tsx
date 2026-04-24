import { useState } from 'react';
import { api } from '../api';
import { useUserStore } from '../store';
import { User, Mail, AtSign, Loader2 } from 'lucide-react';
import { useConvex, useMutation } from 'convex/react';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const setUser = useUserStore(state => state.setUser);
  const createUser = useMutation(api.users.createUser);
  const convex = useConvex();

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const existingUser = await convex.query(api.users.getUserByEmail, { email });
      if (existingUser) {
        if (existingUser.password && existingUser.password !== password) {
          setError("Contraseña incorrecta");
          setLoading(false);
          return;
        }
        // If user exists but has no password, allow entry (they can set it later in profile)
        setUser(existingUser);
      } else {
        setError("Usuario no encontrado. Por favor regístrate.");
      }

    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !name || !password) return;
    setLoading(true);
    setError(null);
    try {
      const userId = await createUser({ email, username, name, password });
      const newUser = { _id: userId, email, username, name, password, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` };
      setUser(newUser as any);
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-[#0f1115] z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />
        
        <div className="text-center space-y-2 relative">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">smart_toy</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido a Aurora</h1>
          <p className="text-gray-400 text-sm">Crea tu perfil personalizado para empezar</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 relative z-10">
          <button 
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!isRegistering ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isRegistering ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={isRegistering ? handleRegister : (e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 relative">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-gray-600"
                required
              />
            </div>
            
            {isRegistering && (
              <>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nombre de usuario (@usuario)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-gray-600"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-gray-600"
                    required
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-gray-600"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>


        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest relative">
          Aurora Chat • Standalone Edition
        </p>
      </div>
    </div>
  );
}
