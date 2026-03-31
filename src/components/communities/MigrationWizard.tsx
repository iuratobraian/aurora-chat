import { useState } from 'react';

type Platform = 'discord' | 'telegram' | 'whatsapp' | null;
type Step = 'select' | 'configure' | 'import' | 'complete';

interface MigrationConfig {
  platform: Platform;
  channelName: string;
  botToken?: string;
  apiKey?: string;
  groupId?: string;
  importMembers: boolean;
  importHistory: boolean;
  preserveRoles: boolean;
}

const platformIcons: Record<string, string> = {
  discord: '🎮',
  telegram: '✈️',
  whatsapp: '💬',
};

const platformColors: Record<string, string> = {
  discord: '#5865F2',
  telegram: '#0088cc',
  whatsapp: '#25D366',
};

export default function MigrationWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [config, setConfig] = useState<MigrationConfig>({
    platform: null,
    channelName: '',
    botToken: '',
    apiKey: '',
    groupId: '',
    importMembers: true,
    importHistory: false,
    preserveRoles: true,
  });
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const resetWizard = () => {
    setStep('select');
    setConfig({
      platform: null,
      channelName: '',
      botToken: '',
      apiKey: '',
      groupId: '',
      importMembers: true,
      importHistory: false,
      preserveRoles: true,
    });
    setIsMigrating(false);
    setMigrationProgress(0);
  };

  const handlePlatformSelect = (platform: Platform) => {
    setConfig({ ...config, platform });
    setStep('configure');
  };

  const startMigration = async () => {
    setIsMigrating(true);
    setMigrationProgress(0);
    
    const progressInterval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setMigrationProgress(100);
      setStep('complete');
    }, 8000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 rounded-xl bg-[#1c1b1b] border border-[#494454]/20 hover:border-[#4cd7f6]/50 transition-all duration-300 flex items-center gap-4 group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d0bcff] to-[#a078ff] flex items-center justify-center text-xl">
          📦
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-[#e5e2e1] group-hover:text-[#d0bcff] transition-colors">
            Wizard de Migración
          </h3>
          <p className="text-sm text-[#a0a0a0]">
            Importa tu comunidad desde Discord, Telegram o WhatsApp
          </p>
        </div>
        <span className="text-[#4cd7f6]">→</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#201f1f] rounded-2xl border border-[#494454]/20 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-[#494454]/20 bg-[#1c1b1b]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#e5e2e1] tracking-tight">
                Wizard de Migración
              </h2>
              <p className="text-sm text-[#a0a0a0] mt-1">
                {step === 'select' && 'Selecciona la plataforma de origen'}
                {step === 'configure' && 'Configura la conexión'}
                {step === 'import' && 'Importando datos...'}
                {step === 'complete' && '¡Migración completada!'}
              </p>
            </div>
            <button
              onClick={() => { setIsOpen(false); resetWizard(); }}
              className="w-8 h-8 rounded-full bg-[#3a3939]/80 flex items-center justify-center text-[#a0a0a0] hover:text-[#e5e2e1] hover:bg-[#494454]/50 transition-all"
            >
              ✕
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-1 bg-[#131313] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#d0bcff] to-[#a078ff] transition-all duration-500"
              style={{ 
                width: step === 'select' ? '25%' : 
                       step === 'configure' ? '50%' : 
                       step === 'import' ? '75%' : '100%' 
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {/* Step 1: Select Platform */}
          {step === 'select' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-[#a0a0a0] mb-6">
                Selecciona la plataforma desde donde quieres migrar tu comunidad.
              </p>
              
              <div className="grid gap-4">
                {(['discord', 'telegram', 'whatsapp'] as Platform[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className="w-full p-5 rounded-xl bg-[#1c1b1b] border border-[#494454]/20 hover:border-[#494454]/50 hover:bg-[#252530] transition-all duration-300 flex items-center gap-4 group text-left"
                  >
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${platformColors[platform!]}20` }}
                    >
                      {platformIcons[platform!]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#e5e2e1] group-hover:text-[#d0bcff] transition-colors capitalize">
                        {platform}
                      </h3>
                      <p className="text-sm text-[#a0a0a0]">
                        {platform === 'discord' && 'Importa canales, roles y miembros desde tu servidor'}
                        {platform === 'telegram' && 'Migra grupos, miembros e historial de chat'}
                        {platform === 'whatsapp' && 'Transfiere grupos y contactos rápidamente'}
                      </p>
                    </div>
                    <span className="text-[#4cd7f6] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 'configure' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => setStep('select')}
                className="text-sm text-[#4cd7f6] hover:text-[#d0bcff] transition-colors flex items-center gap-2"
              >
                ← Volver
              </button>

              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${platformColors[config.platform!]}15` }}>
                <span className="text-3xl">{platformIcons[config.platform!]}</span>
                <div>
                  <h3 className="font-semibold text-[#e5e2e1]">Configurar {config.platform}</h3>
                  <p className="text-sm text-[#a0a0a0]">Ingresa las credenciales de tu {config.platform}</p>
                </div>
              </div>

              <div className="space-y-4">
                {config.platform === 'discord' && (
                  <>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-2">Token del Bot</label>
                      <input
                        type="password"
                        value={config.botToken}
                        onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                        placeholder="MTIz...xyz"
                        className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all font-mono"
                      />
                      <p className="text-xs text-[#606060] mt-2">
                        Necesitas un bot con permisos de Administrador en tu servidor
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-2">ID del Servidor</label>
                      <input
                        type="text"
                        value={config.groupId}
                        onChange={(e) => setConfig({ ...config, groupId: e.target.value })}
                        placeholder="123456789012345678"
                        className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all font-mono"
                      />
                    </div>
                  </>
                )}

                {config.platform === 'telegram' && (
                  <>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-2">API ID</label>
                      <input
                        type="text"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder="12345"
                        className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-2">API Hash</label>
                      <input
                        type="password"
                        value={config.botToken}
                        onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                        placeholder="abcdef123456..."
                        className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-2">ID del Grupo</label>
                      <input
                        type="text"
                        value={config.groupId}
                        onChange={(e) => setConfig({ ...config, groupId: e.target.value })}
                        placeholder="-1001234567890"
                        className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all font-mono"
                      />
                    </div>
                  </>
                )}

                {config.platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm text-[#a0a0a0] mb-2">Número de teléfono</label>
                    <input
                      type="text"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="+52 1 234 567 8900"
                      className="w-full px-4 py-3 rounded-xl bg-[#131313] border border-[#494454]/30 text-[#e5e2e1] placeholder-[#606060] focus:border-[#4cd7f6] focus:shadow-[0_0_0_2px_rgba(76,215,246,0.2)] outline-none transition-all"
                    />
                    <p className="text-xs text-[#606060] mt-2">
                      Vincula tu WhatsApp con la API de TradePortal
                    </p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-4 border-t border-[#494454]/20">
                <h4 className="text-sm font-medium text-[#e5e2e1]">Opciones de importación</h4>
                
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#131313] cursor-pointer hover:bg-[#1c1b1b] transition-colors">
                  <input
                    type="checkbox"
                    checked={config.importMembers}
                    onChange={(e) => setConfig({ ...config, importMembers: e.target.checked })}
                    className="w-5 h-5 rounded bg-[#3a3939] border border-[#494454]/50 text-[#d0bcff] focus:ring-[#d0bcff] focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-[#e5e2e1]">Importar miembros</span>
                    <p className="text-xs text-[#a0a0a0]">Todos los usuarios serán notificados</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#131313] cursor-pointer hover:bg-[#1c1b1b] transition-colors">
                  <input
                    type="checkbox"
                    checked={config.importHistory}
                    onChange={(e) => setConfig({ ...config, importHistory: e.target.checked })}
                    className="w-5 h-5 rounded bg-[#3a3939] border border-[#494454]/50 text-[#d0bcff] focus:ring-[#d0bcff] focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-[#e5e2e1]">Importar historial</span>
                    <p className="text-xs text-[#a0a0a0]">Los últimos 10,000 mensajes</p>
                  </div>
                </label>

                {config.platform === 'discord' && (
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#131313] cursor-pointer hover:bg-[#1c1b1b] transition-colors">
                    <input
                      type="checkbox"
                      checked={config.preserveRoles}
                      onChange={(e) => setConfig({ ...config, preserveRoles: e.target.checked })}
                      className="w-5 h-5 rounded bg-[#3a3939] border border-[#494454]/50 text-[#d0bcff] focus:ring-[#d0bcff] focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-[#e5e2e1]">Preservar roles</span>
                      <p className="text-xs text-[#a0a0a0]">Los roles se mapearán a permisos de comunidad</p>
                    </div>
                  </label>
                )}
              </div>

              <button
                onClick={() => { setStep('import'); startMigration(); }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#050505] font-semibold hover:opacity-90 transition-opacity"
              >
                Iniciar Migración
              </button>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'import' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#d0bcff]/20 to-[#a078ff]/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d0bcff] border-t-transparent animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-[#e5e2e1]">Migrando datos...</h3>
                <p className="text-[#a0a0a0] mt-2">Esto puede tomar unos minutos</p>
              </div>

              <div className="space-y-3">
                <MigrationTask label="Conectando con API..." completed={migrationProgress > 10} active={migrationProgress <= 10} />
                <MigrationTask label="Exportando miembros..." completed={migrationProgress > 30} active={migrationProgress > 10 && migrationProgress <= 30} />
                <MigrationTask label="Importando historial..." completed={migrationProgress > 60} active={migrationProgress > 30 && migrationProgress <= 60} />
                <MigrationTask label="Configurando permisos..." completed={migrationProgress > 80} active={migrationProgress > 60 && migrationProgress <= 80} />
                <MigrationTask label="Finalizando..." completed={migrationProgress >= 100} active={migrationProgress > 80 && migrationProgress < 100} />
              </div>

              <div className="h-2 bg-[#131313] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d0bcff] to-[#a078ff] transition-all duration-300"
                  style={{ width: `${Math.min(migrationProgress, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-[#a0a0a0]">{Math.round(Math.min(migrationProgress, 100))}% completado</p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 fade-in duration-300">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#d0bcff]/20 to-[#a078ff]/20 flex items-center justify-center text-4xl">
                ✨
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#e5e2e1]">¡Migración exitosa!</h3>
                <p className="text-[#a0a0a0] mt-2">Tu comunidad ha sido importada correctamente</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-[#131313] rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d0bcff]">127</p>
                  <p className="text-xs text-[#a0a0a0]">Miembros</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d0bcff]">8</p>
                  <p className="text-xs text-[#a0a0a0]">Canales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#d0bcff]">3</p>
                  <p className="text-xs text-[#a0a0a0]">Roles</p>
                </div>
              </div>

              <button
                onClick={() => { setIsOpen(false); resetWizard(); }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#050505] font-semibold hover:opacity-90 transition-opacity"
              >
                Ver mi comunidad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MigrationTask({ label, completed, active }: { label: string; completed: boolean; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-[#1c1b1b]' : 'bg-[#131313]'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
        completed ? 'bg-[#d0bcff] text-[#050505]' : 
        active ? 'bg-[#494454]/50 border-2 border-[#d0bcff]/50' : 
        'bg-[#3a3939]/50'
      }`}>
        {completed ? '✓' : active ? '' : '○'}
      </div>
      <span className={completed || active ? 'text-[#e5e2e1]' : 'text-[#606060]'}>{label}</span>
    </div>
  );
}
