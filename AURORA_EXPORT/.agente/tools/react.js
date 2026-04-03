/**
 * AURORA Tools - React + UI
 * 
 * Herramientas específicas para React
 */

// Patterns de uso común - copiar y pegar según necesidad

export const REACT_HOOKS = {
  useQuery: 'const data = useQuery(api.module.function, { args });',
  useMutation: 'const mutation = useMutation(api.module.function);',
  useToast: "const { showToast } = useToast();"
};

export const REACT_PATTERNS = {
  loadingState: `
const [loading, setLoading] = useState(false);
{loading ? <Spinner /> : <Content />}`
};

export const UI_PATTERNS = {
  toast: {
    success: "showToast('success', 'Mensaje')",
    error: "showToast('error', err.message)",
    warning: "showToast('warning', 'Advertencia')",
    info: "showToast('info', 'Información')"
  }
};
