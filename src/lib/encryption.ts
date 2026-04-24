import CryptoJS from 'crypto-js';

// En un entorno real, esta clave debería ser única por canal o derivada de una frase secreta
const MASTER_KEY = 'aurora-chat-secret-v1-secure-key';

export function encryptMessage(text: string): string {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, MASTER_KEY).toString();
}

export function decryptMessage(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, MASTER_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || '[Error al desencriptar]';
  } catch (e) {
    return '[Mensaje Encriptado]';
  }
}
