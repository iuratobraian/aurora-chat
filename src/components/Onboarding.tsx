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
  const [hasBiometrics, setHasBiometrics] = useState(!!localStorage.getItem('aurora_biometric_enabled'));
  const [isScanning, setIsScanning] = useState(false);
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

    setIsScanning(true);
    setError(null);

    try {
      // Try real WebAuthn if available
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const options: any = {
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: "required"
          }
        };
        
        await navigator.credentials.get(options);
      } else {
        // Fallback for browsers without WebAuthn
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const existingUser = await convex.query(api.users.getUserByEmail, { email: lastUser.email });
      if (existingUser) {
        setUser(existingUser);
      } else {
        setError("Usuario no encontrado");
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setError("Error en autenticación biométrica");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleRegisterBiometrics = async () => {
    if (!window.PublicKeyCredential) return;
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userID = new Uint8Array(16);
      window.crypto.getRandomValues(userID);

      const options: any = {
        publicKey: {
          challenge,
          rp: { name: "Aurora Chat" },
          user: { id: userID, name: email, displayName: name },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { userVerification: "required" },
          timeout: 60000
        }
      };

      await navigator.credentials.create(options);
      localStorage.setItem('aurora_biometric_enabled', 'true');
      setHasBiometrics(true);
    } catch (err) {
      console.error("Biometric registration failed", err);
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
    <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center p-4 safe-area-pt safe-area-pb selection:bg-primary/30">
      <div className="w-full max-w-md glass-panel rounded-[2rem] p-8 md:p-10 space-y-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Dynamic decorative elements */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="text-center space-y-4 relative">
          <div className="w-20 h-20 bg-white/[0.03] rounded-[2rem] flex items-center justify-center border border-white/10 mx-auto mb-6 shadow-inner group hover:border-primary/50 transition-all duration-500">
            <span className="material-symbols-outlined text-4xl text-white/40 group-hover:text-primary group-hover:scale-110 transition-all">smart_toy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-[-0.05em] uppercase italic">Aurora</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black opacity-60">Neural Messaging System</p>
        </div>

        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 relative z-10 backdrop-blur-md">
          <button 
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isRegistering ? 'bg-white text-black shadow-xl scale-100' : 'text-gray-500 hover:text-white scale-95'}`}
          >
            Acceder
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isRegistering ? 'bg-white text-black shadow-xl scale-100' : 'text-gray-500 hover:text-white scale-95'}`}
          >
            Registrar
          </button>
        </div>

        <form onSubmit={isRegistering ? handleRegister : (e) => { e.preventDefault(); handleLogin(); }} className="space-y-6 relative">
          {isRegistering && (
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-white/[0.02] group-hover:border-primary/50 transition-all duration-500 shadow-inner">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <Camera className="text-white/10 group-hover:text-primary/40 transition-colors" size={40} />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload}
                />
              </div>
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Identidad Visual</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email corporativo"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-5 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                required
              />
            </div>
            
            {isRegistering && (
              <>
                <div className="relative group">
                  <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Alias de red"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-5 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                    required
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-5 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                    required
                  />
                </div>
              </>
            )}

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Llave de acceso"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-5 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] text-center uppercase font-black tracking-[0.2em] animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl hover:bg-gray-100 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Inyectar Datos' : 'Autenticar')}
            </button>

            {!isRegistering && hasBiometrics && (
               <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full bg-primary/10 text-primary py-5 rounded-2xl font-black text-[11px] transition-all border border-primary/20 flex items-center justify-center gap-3 uppercase tracking-[0.3em] hover:bg-primary/20 active:scale-[0.98] shadow-lg shadow-primary/5"
               >
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                  Biometría
               </button>
            )}
          </div>

          {!isRegistering && !hasBiometrics && localStorage.getItem('aurora_last_user') && (
            <button
              type="button"
              onClick={handleRegisterBiometrics}
              className="w-full bg-white/[0.01] hover:bg-white/[0.04] text-gray-600 py-3 rounded-xl font-black text-[8px] transition-all flex items-center justify-center gap-2 uppercase tracking-[0.3em] border border-white/5"
            >
               <span className="material-symbols-outlined text-sm">fingerprint</span>
               Activar Acceso Biométrico
            </button>
          )}
        </form>

        <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.5em] font-black relative opacity-40">
          Aurora Neural • v1.0.0
        </p>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black/95 z-[500] backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
               <span className="material-symbols-outlined text-7xl text-white/20 animate-pulse">fingerprint</span>
            </div>
            <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-10" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2s_infinite]" />
          </div>
          <h3 className="text-white font-black text-xs uppercase tracking-[0.4em] mt-16 animate-pulse">Verificando Neuronas</h3>
          <p className="text-gray-500 text-[9px] uppercase mt-4 tracking-[0.2em] font-bold">Escaneo de seguridad en curso</p>
        </div>
      )}
    </div>
  );
}
