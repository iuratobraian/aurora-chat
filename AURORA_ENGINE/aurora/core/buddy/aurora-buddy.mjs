/**
 * aurora-buddy.mjs - Buddy Companion: Tamagotchi Engagement
 *
 * 18 especies + gacha + ASCII art + personality stats.
 */

const SPECIES = [
  { name: 'Tengu', rarity: 'legendary', ascii: '👺' },
  { name: 'Fennec', rarity: 'rare', ascii: '🦊' },
  { name: 'Capybara', rarity: 'common', ascii: '🦫' },
  { name: 'Phoenix', rarity: 'legendary', ascii: '🔥' },
  { name: 'Dragon', rarity: 'legendary', ascii: '🐉' },
  { name: 'Cat', rarity: 'common', ascii: '🐱' },
  { name: 'Owl', rarity: 'rare', ascii: '🦉' },
  { name: 'Fox', rarity: 'common', ascii: '🦊' },
  { name: 'Wolf', rarity: 'rare', ascii: '🐺' },
  { name: 'Eagle', rarity: 'rare', ascii: '🦅' },
  { name: 'Panda', rarity: 'common', ascii: '🐼' },
  { name: 'Tiger', rarity: 'rare', ascii: '🐯' },
  { name: 'Unicorn', rarity: 'legendary', ascii: '🦄' },
  { name: 'Dolphin', rarity: 'common', ascii: '🐬' },
  { name: 'Hawk', rarity: 'rare', ascii: '🦅' },
  { name: 'Bear', rarity: 'common', ascii: '🐻' },
  { name: 'Raven', rarity: 'rare', ascii: '🐦‍⬛' },
  { name: 'Celestial', rarity: 'legendary', ascii: '✨' },
];

// Simple Mulberry32 PRNG for deterministic gacha
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function rollGacha(seed) {
  const rng = mulberry32(seed || Date.now());
  const roll = rng();

  // Rarity weights
  let pool;
  if (roll < 0.05) pool = SPECIES.filter(s => s.rarity === 'legendary');
  else if (roll < 0.30) pool = SPECIES.filter(s => s.rarity === 'rare');
  else pool = SPECIES.filter(s => s.rarity === 'common');

  if (pool.length === 0) pool = SPECIES; // fallback
  return pool[Math.floor(rng() * pool.length)];
}

function getMood(level, tasksCompleted) {
  if (level < 3) return 'curious';
  if (level < 7) return 'helpful';
  if (level < 15) return 'confident';
  return 'wise';
}

export class AuroraBuddy {
  constructor(options = {}) {
    this.userId = options.userId || 'default';
    this.seed = options.seed || Date.now();
    this.buddy = null;
    this.level = 1;
    this.xp = 0;
    this.tasksCompleted = 0;
  }

  async summon() {
    this.buddy = rollGacha(this.seed + this.userId.length);
    this.mood = getMood(this.level, this.tasksCompleted);
    return {
      success: true,
      buddy: this.buddy,
      mood: this.mood,
      level: this.level,
      ascii: this.buddy.ascii,
    };
  }

  completeTask() {
    this.tasksCompleted++;
    this.xp += 10;
    if (this.xp >= this.level * 50) {
      this.level++;
      this.xp = 0;
      this.mood = getMood(this.level, this.tasksCompleted);
      return { leveledUp: true, level: this.level, mood: this.mood };
    }
    return { leveledUp: false, xp: this.xp, nextLevel: this.level * 50 };
  }

  getMood() { return this.mood || 'curious'; }
  getAscii() { return this.buddy ? this.buddy.ascii : '?'; }

  getSchema() {
    return {
      name: 'buddy',
      description: 'Tamagotchi-style companion. 18 species, gacha summon, mood system, level up.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['summon', 'complete_task', 'status'] },
          userId: { type: 'string' },
          seed: { type: 'number' },
        },
        required: ['action'],
      },
    };
  }
}
