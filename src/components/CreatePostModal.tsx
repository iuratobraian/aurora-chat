// src/components/CreatePostModal.tsx
import React, { useState, useRef, useCallback } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getSesion } from "../services/authBase";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
type PostTarget =
  | { type: "public" }
  | { type: "community"; communityId: string; communityName: string }
  | { type: "subcommunity"; subcommunityId: string; subcommunityName: string };

type PostType = "text" | "image" | "link" | "poll" | "signal" | "chart";

interface PollOption {
  text: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: PostTarget; // undefined = feed público
  onSuccess?: (postId: string) => void;
}

// ─────────────────────────────────────────────
// CATEGORÍAS
// ─────────────────────────────────────────────
const CATEGORIAS = [
  { value: "general", label: "General" },
  { value: "analisis", label: "Análisis" },
  { value: "educacion", label: "Educación" },
  { value: "noticias", label: "Noticias" },
  { value: "setup", label: "Setup" },
  { value: "estrategia", label: "Estrategia" },
  { value: "pregunta", label: "Pregunta" },
  { value: "logro", label: "Logro" },
];

const PARES_COMUNES = [
  "XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "BTCUSDT",
  "ETHUSDT", "US30", "NAS100", "USDCAD", "AUDUSD",
];

const SENTIMENTS = [
  { value: "bullish", label: "📈 Alcista", color: "text-green-400" },
  { value: "bearish", label: "📉 Bajista", color: "text-red-400" },
  { value: "neutral", label: "➡️ Neutral", color: "text-gray-400" },
];

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess,
}) => {
  const convex = useConvex();
  const user = getSesion();

  // Estado principal
  const [postType, setPostType] = useState<PostType>("text");
  const [contenido, setContenido] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [par, setPar] = useState("");
  const [sentiment, setSentiment] = useState("neutral");
  const [imagenUrl, setImagenUrl] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [zonaOperativa, setZonaOperativa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Estado encuesta
  const [pollPregunta, setPollPregunta] = useState("");
  const [pollOpciones, setPollOpciones] = useState<PollOption[]>([
    { text: "" },
    { text: "" },
  ]);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollDuration, setPollDuration] = useState("24"); // horas

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 2000;

  // ─── RESET ───
  const resetForm = useCallback(() => {
    setPostType("text");
    setContenido("");
    setTitulo("");
    setCategoria("general");
    setPar("");
    setSentiment("neutral");
    setImagenUrl("");
    setTradingViewUrl("");
    setTags([]);
    setTagInput("");
    setZonaOperativa("");
    setPollPregunta("");
    setPollOpciones([{ text: "" }, { text: "" }]);
    setError(null);
    setCharCount(0);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ─── TAGS ───
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // ─── POLL OPCIONES ───
  const addPollOption = () => {
    if (pollOpciones.length < 6) {
      setPollOpciones([...pollOpciones, { text: "" }]);
    }
  };

  const updatePollOption = (i: number, text: string) => {
    const updated = [...pollOpciones];
    updated[i] = { text };
    setPollOpciones(updated);
  };

  const removePollOption = (i: number) => {
    if (pollOpciones.length > 2) {
      setPollOpciones(pollOpciones.filter((_, idx) => idx !== i));
    }
  };

  // ─── VALIDAR ───
  const validate = (): string | null => {
    if (!user) return "Necesitás iniciar sesión";

    if (postType === "poll") {
      if (!pollPregunta.trim()) return "Escribí la pregunta de la encuesta";
      const validOpts = pollOpciones.filter((o) => o.text.trim());
      if (validOpts.length < 2) return "Necesitás al menos 2 opciones";
      return null;
    }

    if (!contenido.trim()) return "Escribí algo para publicar";
    if (contenido.length > MAX_CHARS) return `Máximo ${MAX_CHARS} caracteres`;

    if (postType === "image" && !imagenUrl.trim()) return "Agregá una URL de imagen";
    if (postType === "chart" && !tradingViewUrl.trim())
      return "Agregá la URL del gráfico de TradingView";
    if (postType === "link") {
      try {
        new URL(contenido.trim());
      } catch {
        return "El contenido debe ser una URL válida";
      }
    }

    return null;
  };

  // ─── SUBMIT ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const encuesta =
        postType === "poll"
          ? {
              pregunta: pollPregunta,
              opciones: pollOpciones.map((o) => o.text).filter((t) => t.trim()),
              multipleChoice: pollMultiple,
              endsAt: Date.now() + parseInt(pollDuration) * 3600000,
            }
          : undefined;

      const baseArgs = {
        userId: user!._id as any,
        titulo: titulo.trim() || undefined,
        contenido: postType === "poll" ? pollPregunta : contenido.trim(),
        tipo: postType,
        par: par || undefined,
        categoria,
        imagenUrl: imagenUrl.trim() || undefined,
        tradingViewUrl: tradingViewUrl.trim() || undefined,
        tags: tags.length ? tags : undefined,
        zonaOperativa: zonaOperativa.trim() || undefined,
        sentiment,
        encuesta,
        esAnuncio: false,
      };

      let result: { success: boolean; postId: string };

      // All post types use the same createPost mutation
      result = await convex.mutation(api.posts.createPost, {
        ...baseArgs,
        communityId: target?.type === "community" ? target.communityId : undefined,
        subcommunityId: target?.type === "subcommunity" ? target.subcommunityId : undefined,
      } as any);

      if (result.success) {
        onSuccess?.(result.postId);
        handleClose();
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("NOT_A_MEMBER")) {
        setError("No sos miembro de esta comunidad");
      } else if (msg.includes("MEMBERSHIP_PENDING")) {
        setError("Tu membresía está pendiente de aprobación");
      } else if (msg.includes("RATE_LIMIT_EXCEEDED")) {
        setError("Publicaste demasiado seguido. Esperá un rato");
      } else if (msg.includes("USER_BLOCKED")) {
        setError("Tu cuenta está suspendida");
      } else {
        setError("Error al publicar. Intentá de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ─── TARGET LABEL ───
  const targetLabel =
    !target || target.type === "public"
      ? "Feed público"
      : target.type === "community"
      ? target.communityName
      : target.subcommunityName;

  const targetIcon =
    !target || target.type === "public"
      ? "public"
      : target.type === "community"
      ? "groups"
      : "group";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#1a1a2e] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#1a1a2e] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-xl">{targetIcon}</span>
            <div>
              <h3 className="text-sm font-black text-white">Nueva publicación</h3>
              <p className="text-xs text-gray-400">{targetLabel}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo de post */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(
              [
                { v: "text", icon: "article", label: "Texto" },
                { v: "image", icon: "image", label: "Imagen" },
                { v: "chart", icon: "candlestick_chart", label: "Gráfico" },
                { v: "poll", icon: "poll", label: "Encuesta" },
                { v: "link", icon: "link", label: "Link" },
                { v: "signal", icon: "signal_cellular_alt", label: "Señal" },
              ] as { v: PostType; icon: string; label: string }[]
            ).map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setPostType(t.v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  postType === t.v
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Título (opcional) */}
          {(postType === "text" || postType === "signal" || postType === "chart") && (
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título (opcional)"
              maxLength={120}
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-2.5 px-4 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          )}

          {/* Contenido principal */}
          {postType !== "poll" && (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={contenido}
                onChange={(e) => {
                  setContenido(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder={
                  postType === "image"
                    ? "Describí la imagen..."
                    : postType === "link"
                    ? "Pegá una URL..."
                    : postType === "chart"
                    ? "Describí tu análisis..."
                    : postType === "signal"
                    ? "Detalles de la señal..."
                    : "¿Qué querés compartir con los traders?"
                }
                rows={postType === "text" ? 5 : 3}
                maxLength={MAX_CHARS}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-3 px-4 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <span
                className={`absolute bottom-3 right-3 text-xs ${
                  charCount > MAX_CHARS * 0.9 ? "text-red-400" : "text-gray-600"
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          )}

          {/* IMAGEN URL */}
          {postType === "image" && (
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="URL de la imagen (https://...)"
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-2.5 px-4 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          )}

          {/* CHART URL */}
          {postType === "chart" && (
            <input
              type="url"
              value={tradingViewUrl}
              onChange={(e) => setTradingViewUrl(e.target.value)}
              placeholder="URL del gráfico de TradingView"
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-2.5 px-4 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          )}

          {/* ENCUESTA */}
          {postType === "poll" && (
            <div className="space-y-3">
              <textarea
                value={pollPregunta}
                onChange={(e) => setPollPregunta(e.target.value)}
                placeholder="¿Cuál es tu pregunta para la comunidad?"
                rows={2}
                maxLength={200}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-3 px-4 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <div className="space-y-2">
                {pollOpciones.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      placeholder={`Opción ${i + 1}`}
                      maxLength={80}
                      className="flex-1 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm py-2 px-3 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    {pollOpciones.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(i)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">remove_circle</span>
                      </button>
                    )}
                  </div>
                ))}
                {pollOpciones.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Agregar opción
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pollMultiple}
                    onChange={(e) => setPollMultiple(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-400">Respuesta múltiple</span>
                </label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(e.target.value)}
                  className="rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs px-2 py-1"
                >
                  <option value="1">1 hora</option>
                  <option value="6">6 horas</option>
                  <option value="12">12 horas</option>
                  <option value="24">24 horas</option>
                  <option value="48">48 horas</option>
                  <option value="168">1 semana</option>
                </select>
              </div>
            </div>
          )}

          {/* Metadata: Par, Categoría, Sentiment */}
          <div className="grid grid-cols-3 gap-2">
            {/* Par */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Par</label>
              <input
                list="pares-list"
                value={par}
                onChange={(e) => setPar(e.target.value.toUpperCase())}
                placeholder="XAUUSD"
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-xs py-2 px-3 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <datalist id="pares-list">
                {PARES_COMUNES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs py-2 px-2"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sentiment */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sentimiento</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs py-2 px-2"
              >
                {SENTIMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tags (máx. 5)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Escribí y presioná Enter"
                maxLength={20}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-xs py-2 px-3 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold disabled:opacity-40"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer acciones */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="material-symbols-outlined text-sm">info</span>
              Publicando en{" "}
              <span className="text-gray-300 font-bold">{targetLabel}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Publicar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
