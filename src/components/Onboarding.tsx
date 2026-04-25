import { useState } from 'react';
import { api } from '../api';
import { useUserStore } from '../store';
import { User, Mail, AtSign, Loader2, Lock, Camera } from 'lucide-react';
import { useConvex, useMutation } from 'convex/react';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(!!localStorage.getItem('aurora_last_user'));
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  
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
        localStorage.setItem('aurora_last_user', JSON.stringify({ email: existingUser.email, name: existingUser.name }));
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

  const handleBiometricLogin = async () => {
    const lastUser = JSON.parse(localStorage.getItem('aurora_last_user') || '{}');
    if (!lastUser.email) return;

    setLoading(true);
    try {
      // Mock biometric check (in Capacitor would be NativeBiometric.verifyIdentity)
      if (window.confirm(`¿Deseas iniciar sesión como ${lastUser.name} usando biometría?`)) {
        const existingUser = await convex.query(api.users.getUserByEmail, { email: lastUser.email });
        if (existingUser) {
          setUser(existingUser);
        } else {
          setError("Usuario no encontrado");
        }
      }
    } catch (err) {
      setError("Error en autenticación biométrica");
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
      const userId = await createUser({ email, username, name, password, avatar: avatar || undefined });
      const newUser = { _id: userId, email, username, name, password, avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` };
      setUser(newUser as any);
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] rounded-xl border border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
        
        <div className="text-center space-y-2 relative">
          <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-white/50">smart_toy</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Aurora Chat</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Standalone Premium Client</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 relative z-10">
          <button 
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!isRegistering ? 'bg-white text-black' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${isRegistering ? 'bg-white text-black' : 'text-gray-500'}`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={isRegistering ? handleRegister : (e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 relative">
          {isRegistering && (
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-white/5 group-hover:border-primary/50 transition-colors">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <Camera className="text-white/20" size={32} />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload}
                />
              </div>
              <span className="text-[9px] text-gray-500 uppercase font-black">Sube tu foto de perfil</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-12 py-4 text-white text-sm outline-none focus:border-white transition-all placeholder:text-gray-700"
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
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-12 py-4 text-white text-sm outline-none focus:border-white transition-all placeholder:text-gray-700"
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
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-12 py-4 text-white text-sm outline-none focus:border-white transition-all placeholder:text-gray-700"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-12 py-4 text-white text-sm outline-none focus:border-white transition-all placeholder:text-gray-700"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] text-center uppercase font-black tracking-widest">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>

          {!isRegistering && hasBiometrics && (
             <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-500 py-4 rounded-lg font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
             >
                <span className="material-symbols-outlined text-sm">fingerprint</span>
                Entrar con Biometría
             </button>
          )}

        </form>



        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest relative">
          Aurora Chat • Standalone Edition
        </p>
      </div>
    </div>
  );
}
