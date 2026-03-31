const BLOCKED_WORDS = [
  "spam", "insulto", "tonto", "idiota", "estupido", "mierda", "joder", "puta", 
  "marica", "pendejo", "cabron", "coño", "verga", "chupapi", "sexo", "porno",
  "xxx", "bitcoin scam", "estafa", "robo", "hacker", "hack", "virus", "malware",
  "free money", "ganar dinero rapido", "inversion segura", "trading garantia",
  "marijuana", "weed", "drugs", "cocaine", "coca", "fentanyl",
  "kill", "hate", "racist", "nazi", "terrorist", "bomb",
  "onlyfans", "telegram hack", "whatsapp hack", "instagram hack"
];

const SUSPICIOUS_URLS = [
  "bit.ly", "tinyurl", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly",
  "trading-signals.com", "crypto-gains.io", "fx-alerts.com"
];

const SCAM_PATTERNS = [
  /dm\s*me/i, /whatsapp\s*\d/i, /tel:\s*\d/i, /send\s*(me\s*)?dm/i,
  /contact\s*(me|us)/i, /link\s*in\s*(bio|bio)/i, / DM /i,
  /free\s*(btc|eth|bitcoin|signal)/i, /100%\s*win/i, /guaranteed\s*profit/i,
  /no\s*risk/i, /invest\s*\d+\s*dollars/i
];

const SPAM_PATTERNS_SHORT = [
  /bit\.ly/i,
  /tinyurl/i,
  /t\.co/i,
  /goo\.gl/i,
  /discord\.gg/i,
  /telegram\.me/i,
];

const MAX_LINKS = 3;
const MAX_MENTION = 5;

export interface SimpleModerationResult {
  isAllowed: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
}

export const moderateMessage = (
  content: string,
  mentions: string[] = []
): SimpleModerationResult => {
  for (const pattern of SPAM_PATTERNS_SHORT) {
    if (pattern.test(content)) {
      return {
        isAllowed: false,
        reason: 'Enlaces acortados no permitidos',
        severity: 'medium',
      };
    }
  }

  const links = content.match(/https?:\/\/[^\s]+/gi) || [];
  if (links.length > MAX_LINKS) {
    return {
      isAllowed: false,
      reason: `Máximo ${MAX_LINKS} enlaces permitidos`,
      severity: 'medium',
    };
  }

  if (mentions.length > MAX_MENTION) {
    return {
      isAllowed: false,
      reason: `Máximo ${MAX_MENTION} menciones permitidas`,
      severity: 'low',
    };
  }

  const blockedWords = containsBlockedWords(content);
  if (blockedWords.length > 0) {
    return {
      isAllowed: false,
      reason: 'Contenido no permitido',
      severity: 'high',
    };
  }

  return { isAllowed: true, severity: 'low' };
};

export const DEFAULT_BLOCKED_WORDS = BLOCKED_WORDS;

export interface ModerationResult {
  clean: boolean;
  blockedWords: string[];
  suspiciousUrls: string[];
  scamPatterns: string[];
  censored: string;
  spamScore: number;
  capsPercentage: number;
}

export function containsBlockedWords(text: string): string[] {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.filter(word => lowerText.includes(word.toLowerCase()));
}

export function detectSuspiciousUrls(text: string): string[] {
  const lowerText = text.toLowerCase();
  return SUSPICIOUS_URLS.filter(url => lowerText.includes(url.toLowerCase()));
}

export function detectScamPatterns(text: string): string[] {
  return SCAM_PATTERNS.filter(pattern => pattern.test(text)).map(p => p.source);
}

export function calculateSpamScore(text: string): number {
  let score = 0;
  
  if (/(.)\1{4,}/i.test(text)) score += 20;
  if (/\b[A-Z]{5,}\b/.test(text)) score += 15;
  if (/!{3,}/.test(text)) score += 10;
  if (/\?{3,}/.test(text)) score += 10;
  if (text.length < 3 && !text.includes(' ')) score += 25;
  if (/^\s*$/.test(text)) score += 30;
  
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 5 && uniqueWords.size / words.length < 0.3) score += 30;
  
  return Math.min(score, 100);
}

export function calculateCapsPercentage(text: string): number {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return 0;
  const caps = letters.replace(/[^A-Z]/g, '').length;
  return (caps / letters.length) * 100;
}

export function filterMessage(text: string): ModerationResult {
  const blockedWords = containsBlockedWords(text);
  const suspiciousUrls = detectSuspiciousUrls(text);
  const scamPatterns = detectScamPatterns(text);
  const spamScore = calculateSpamScore(text);
  const capsPercentage = calculateCapsPercentage(text);
  
  let censored = text;
  
  for (const word of blockedWords) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    censored = censored.replace(regex, '*'.repeat(word.length));
  }
  
  for (const url of suspiciousUrls) {
    const regex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    censored = censored.replace(regex, '[enlace eliminado]');
  }
  
  return {
    clean: blockedWords.length === 0 && suspiciousUrls.length === 0 && spamScore < 50 && capsPercentage < 70,
    blockedWords,
    suspiciousUrls,
    scamPatterns,
    censored,
    spamScore,
    capsPercentage,
  };
}

export function getModerationAction(result: ModerationResult): "block" | "flag" | "allow" {
  const severeWords = ["estafa", "robo", "hacker", "hack", "virus", "malware", "free money", "trading garantia", "estupido", "idiota"];
  const hasSevere = result.blockedWords.some(w => severeWords.includes(w.toLowerCase()));
  
  if (hasSevere) return "flag";
  if (result.blockedWords.length > 0) return "flag";
  if (result.suspiciousUrls.length > 0) return "flag";
  if (result.scamPatterns.length > 0) return "flag";
  if (result.spamScore >= 70) return "flag";
  if (result.capsPercentage >= 80) return "flag";
  if (result.blockedWords.length > 0) return "flag";
  return "allow";
}

export function getModerationWarning(result: ModerationResult): string | null {
  if (result.spamScore >= 70) {
    return "Tu mensaje parece spam. Por favor, evita repetir caracteres o escribir todo en mayúsculas.";
  }
  if (result.capsPercentage >= 80) {
    return "¡Cuidado! Escribir todo en mayúsculas puede interpretarse como gritar. Intenta usar mayúsculas y minúsculas.";
  }
  if (result.scamPatterns.length > 0) {
    return "Tu mensaje contiene patrones similares a estafas conocidas. Por favor, no promuevas servicios externos no verificados.";
  }
  if (result.suspiciousUrls.length > 0) {
    return "Has incluido enlaces externos. Por tu seguridad, evita hacer clic en enlaces desconocidos.";
  }
  if (result.blockedWords.length > 0) {
    return "Tu mensaje contiene lenguaje inapropiado. Por favor, mantengamos el respeto en la sala.";
  }
  return null;
}

export function reportUser(userId: string, reason: string, content: string) {

}
