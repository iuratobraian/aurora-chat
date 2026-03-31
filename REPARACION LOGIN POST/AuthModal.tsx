// src/components/AuthModal.tsx
import React, { useState, useCallback } from "react";
import { useConvex } from "convex/react";
import { loginUser, registerUser, UserSession } from "../services/authService";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession) => void;
  initialMode?: "login" | "register";
}

type Mode = "login" | "register";

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}) => {
  const convex = useConvex();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos registro
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regUsuario, setRegUsuario] = useState("");
  const [regReferral, setRegReferral] = useState(
    () => new URLSearchParams(window.location.search).get("ref") || ""
  );
  const [showPassword, setShowPassword] = useState(false);

  const resetFields = useCallback(() => {
    setError(null);
    setLoginEmail("");
    setLoginPassword("");
    setRegNombre("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegUsuario("");
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  // ─── SUBMIT LOGIN ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser(convex, loginEmail, loginPassword);
      resetFields();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // ─── SUBMIT REGISTRO ───
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (regPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(convex, {
        email: regEmail,
        password: regPassword,
        nombre: regNombre,
        usuario: regUsuario || undefined,
        referralCode: regReferral || undefined,
      });
      resetFields();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a2e] shadow-2xl overflow-hidden">
        {/* Header degradado */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-blue-600/20 to-purple-600/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-xl">
                {mode === "login" ? "login" : "person_add"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
              </h2>
              <p className="text-xs text-gray-400">
                {mode === "login"
                  ? "Ingresá con tu cuenta de TradeHub"
                  : "Unite a la comunidad de traders"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mode === m
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <div className="px-6 py-6">
          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* ─── FORM LOGIN ─── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="tu@email.com"
                icon="mail"
                required
              />
              <InputField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="••••••••"
                icon="lock"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                }
              />
              <SubmitButton loading={loading} label="Iniciar sesión" />
            </form>
          )}

          {/* ─── FORM REGISTRO ─── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Nombre"
                  type="text"
                  value={regNombre}
                  onChange={setRegNombre}
                  placeholder="Juan García"
                  icon="person"
                  required
                />
                <InputField
                  label="Usuario"
                  type="text"
                  value={regUsuario}
                  onChange={setRegUsuario}
                  placeholder="juantrader"
                  icon="alternate_email"
                />
              </div>
              <InputField
                label="Email"
                type="email"
                value={regEmail}
                onChange={setRegEmail}
                placeholder="tu@email.com"
                icon="mail"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={setRegPassword}
                  placeholder="••••••••"
                  icon="lock"
                  required
                />
                <InputField
                  label="Confirmar"
                  type={showPassword ? "text" : "password"}
                  value={regConfirm}
                  onChange={setRegConfirm}
                  placeholder="••••••••"
                  icon="lock_reset"
                  required
                />
              </div>
              <InputField
                label="Código de referido (opcional)"
                type="text"
                value={regReferral}
                onChange={setRegReferral}
                placeholder="ABC123"
                icon="card_giftcard"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
                {showPassword ? "Ocultar" : "Mostrar"} contraseñas
              </button>

              <SubmitButton loading={loading} label="Crear cuenta gratis" />

              <p className="text-xs text-center text-gray-500">
                Al registrarte aceptás los{" "}
                <a href="/legal" className="text-blue-400 hover:underline">
                  Términos y Condiciones
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  rightIcon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required,
  rightIcon,
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-2.5 pl-9 pr-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
      )}
    </div>
  </div>
);

interface SubmitButtonProps {
  loading: boolean;
  label: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Procesando...
      </>
    ) : (
      label
    )}
  </button>
);

export default AuthModal;
