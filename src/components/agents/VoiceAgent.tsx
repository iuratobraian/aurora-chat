import React, { useState } from 'react';

export const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setResponse('Speech recognition no soportada en este navegador');
      return;
    }
    setIsListening(!isListening);
    if (!isListening) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setTranscript(transcript);
      };
      recognition.start();
    }
  };

  const quickCommands = [
    { label: 'Precio Bitcoin', cmd: '¿Cuál es el precio de Bitcoin?' },
    { label: 'Últimas noticias', cmd: 'Dame las últimas noticias de trading' },
    { label: 'Análisis', cmd: 'Analiza EUR/USD' },
    { label: 'Señales', cmd: '¿Hay alguna señal hoy?' },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-center mb-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary/20'}`}>
          <button onClick={toggleListening} className="text-3xl">
            {isListening ? '🎤' : '🎙️'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          {isListening ? 'Escuchando...' : 'Toca para hablar'}
        </p>
      </div>

      {transcript && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400">Dijiste:</p>
          <p className="text-white">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="mb-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
          <p className="text-xs text-green-400">Respuesta:</p>
          <p className="text-white">{response}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {quickCommands.map(cmd => (
          <button key={cmd.label} onClick={() => setTranscript(cmd.cmd)} className="p-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceAgent;