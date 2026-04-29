import CryptoJS from 'crypto-js';

// En un entorno real, esta clave debería ser única por canal o derivada de una frase secreta
// Llave maestra interna (No expuesta directamente)
const INTERNAL_SECRET = 'au-r0-ra-ch-4t-pr0t0c0l-2026-v2';

function getChannelKey(channelId: string): string {
  // Derivamos una clave única por canal para que una filtración no afecte al resto
  return CryptoJS.SHA256(INTERNAL_SECRET + channelId).toString();
}

export function encryptMessage(text: string, channelId: string): string {
  if (!text || !channelId) return '';
  const key = getChannelKey(channelId);
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decryptMessage(cipherText: string, channelId: string): string {
  if (!cipherText || !channelId) return '';
  
  try {
    // 1. Intentamos con la nueva llave de canal (Más segura)
    const key = getChannelKey(channelId);
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (originalText) return originalText;
    
    // 2. Fallback: Intentamos con la llave global antigua (Para mensajes previos)
    const OLD_KEY = 'aurora-chat-secret-v1-secure-key';
    const oldBytes = CryptoJS.AES.decrypt(cipherText, OLD_KEY);
    const oldText = oldBytes.toString(CryptoJS.enc.Utf8);
    if (oldText) return oldText;

    return '[Error: Fallo de Encriptación]';
  } catch (e) {
    return '[Mensaje Encriptado]';
  }
}


