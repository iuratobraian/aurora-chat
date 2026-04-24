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
    const key = getChannelKey(channelId);
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || '[Error: Fallo de Encriptación]';
  } catch (e) {
    return '[Mensaje Encriptado]';
  }
}

