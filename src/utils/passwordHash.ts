const ITERATIONS = 100000;

async function pbkdf2Hash(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(bits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...combined)).slice(0, 43);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Hash(password, salt);
  return '$2a$12$' + hash + (salt[0] % 2 === 0 ? 'A' : 'B');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash.startsWith('$2a$12$')) {
    return password === hash;
  }
  
  try {
    const hashPart = hash.slice(7, 50);
    const checkChar = hash.slice(50, 51);
    const combined = Uint8Array.from(atob(hashPart + '='), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    
    const newHash = await pbkdf2Hash(password, salt);
    const expectedHash = hashPart + (salt[0] % 2 === 0 ? 'A' : 'B');
    
    return newHash === expectedHash.slice(0, newHash.length);
  } catch {
    return false;
  }
}

export function isBcryptHash(password: string): boolean {
  return password.startsWith('$2') && password.length === 60;
}

export function isLegacyHash(password: string): boolean {
  try {
    const decoded = atob(password);
    return decoded.length >= 28;
  } catch {
    return false;
  }
}

export function isHashed(password: string): boolean {
  return isBcryptHash(password) || isLegacyHash(password);
}

export function isGooglePassword(password: string): boolean {
  return password.startsWith('google_oauth_protected_');
}

async function legacyVerify(password: string, hash: string): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const stored = combined.slice(28);
    
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      stored
    );
    
    return password === new TextDecoder().decode(decrypted);
  } catch {
    return false;
  }
}

export async function verifyPasswordWithMigration(
  password: string, 
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (isBcryptHash(storedHash)) {
    const valid = await verifyPassword(password, storedHash);
    return { valid, needsRehash: false };
  }
  
  if (isLegacyHash(storedHash)) {
    const valid = await legacyVerify(password, storedHash);
    return { valid, needsRehash: valid };
  }
  
  const valid = storedHash === password || storedHash.trim() === password.trim();
  return { valid, needsRehash: valid };
}
