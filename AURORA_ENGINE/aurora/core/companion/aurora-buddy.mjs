#!/usr/bin/env node
/**
 * aurora-buddy.mjs - Buddy Companion System
 * 
 * Tamagotchi-style engagement companion:
 * - 18 species with rarity (Common → Legendary)
 * - Gacha system (deterministic per user)
 * - ASCII art animations
 * - Personality stats
 * - Mood system
 * - Level up based on activity
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Buddy Pattern
 */

import crypto from 'node:crypto';

const BUDDY_CONFIG = {
  // 18 species by rarity
  species: {
    common: {
      chance: 0.60,
      list: ['Pebblecrab', 'Dustbunny', 'Mossfrog', 'Twigling', 'Dewdrop', 'Puddlefish']
    },
    uncommon: {
      chance: 0.25,
      list: ['Cloudferret', 'Gustowl', 'Bramblebear', 'Thornfox']
    },
    rare: {
      chance: 0.10,
      list: ['Crystaldrake', 'Deepstag', 'Lavapup']
    },
    epic: {
      chance: 0.04,
      list: ['Stormwyrm', 'Voidcat', 'Aetherling']
    },
    legendary: {
      chance: 0.01,
      list: ['Cosmoshale', 'Nebulynx']
    }
  },

  // Personality stats range
  stats: {
    min: 0,
    max: 100,
    labels: ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK']
  },

  // ASCII art dimensions
  ascii: {
    width: 12,
    height: 5
  },

  // Shiny chance (independent)
  shinyChance: 0.01,

  // Salt for deterministic gacha
  salt: 'aurora-buddy-2026-gacha-salt'
};

// ASCII art templates (simplified)
const ASCII_TEMPLATES = {
  Pebblecrab: [
    '  ╭───╮     ',
    '  │◕ ◕│     ',
    ' ╭┴───┴╮    ',
    ' │ crab│    ',
    ' ╰─────╯    '
  ],
  Dustbunny: [
    '  ╭─────╮   ',
    '  │· · │   ',
    ' ╭┴─────┴╮  ',
    ' │ fluff │  ',
    ' ╰───────╯  '
  ],
  Mossfrog: [
    '  ╭─╮ ╭─╮   ',
    '  │◕ │◕ │   ',
    ' ╭┴─────┴╮  ',
    ' │ frog  │  ',
    ' ╰───────╯  '
  ],
  // ... more templates would be here
  default: [
    '  ╭─────╮   ',
    '  │◕ ◕ │   ',
    ' ╭┴─────┴╮  ',
    ' │ buddy │  ',
    ' ╰───────╯  '
  ]
};

export class AuroraBuddy {
  constructor(userId, options = {}) {
    this.config = { ...BUDDY_CONFIG, ...options };
    this.userId = userId || 'anonymous';
    this.seed = this.hashUserId();
    this.buddy = null;
    this.activityLog = [];
    
    // Initialize buddy
    this.initialize();
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'buddy',
      description: 'Tamagotchi-style companion for developer engagement',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['reveal', 'status', 'feed', 'play', 'stats', 'activity'],
          description: 'Buddy operation'
        },
        userId: {
          type: 'string',
          description: 'User ID for deterministic gacha'
        },
        action: {
          type: 'string',
          description: 'Action to perform (feed, play, etc.)'
        }
      },
      returns: {
        buddy: 'object',
        ascii: 'string',
        mood: 'string'
      }
    };
  }

  /**
   * Initialize buddy
   */
  async initialize() {
    this.buddy = {
      species: this.rollSpecies(),
      shiny: this.rollShiny(),
      personality: this.generatePersonality(),
      level: 1,
      xp: 0,
      mood: 'neutral',
      hunger: 50,
      happiness: 50,
      createdAt: new Date().toISOString(),
      lastInteraction: null,
      ascii: this.renderAscii()
    };

    console.log('\n🥚 AURORA BUDDY - Companion System\n');
    console.log('Your buddy has been generated!\n');
    console.log(`Species: ${this.buddy.species}`);
    console.log(`Shiny: ${this.buddy.shiny ? '✨ YES!' : 'No'}`);
    console.log(`Level: ${this.buddy.level}\n`);
  }

  /**
   * Hash user ID for deterministic gacha
   */
  hashUserId() {
    const data = `${this.userId}-${this.config.salt}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Deterministic PRNG (Mulberry32)
   */
  mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  /**
   * Roll species (deterministic)
   */
  rollSpecies() {
    const seed = parseInt(this.seed.substring(0, 8), 16);
    const rand = this.mulberry32(seed)();
    
    const { species } = this.config;
    
    if (rand < species.common.chance) {
      const speciesRand = this.mulberry32(seed + 1)();
      const index = Math.floor(speciesRand * species.common.list.length);
      return species.common.list[index];
    } else if (rand < species.common.chance + species.uncommon.chance) {
      const speciesRand = this.mulberry32(seed + 2)();
      const index = Math.floor(speciesRand * species.uncommon.list.length);
      return species.uncommon.list[index];
    } else if (rand < species.common.chance + species.uncommon.chance + species.rare.chance) {
      const speciesRand = this.mulberry32(seed + 3)();
      const index = Math.floor(speciesRand * species.rare.list.length);
      return species.rare.list[index];
    } else if (rand < species.common.chance + species.uncommon.chance + species.rare.chance + species.epic.chance) {
      const speciesRand = this.mulberry32(seed + 4)();
      const index = Math.floor(speciesRand * species.epic.list.length);
      return species.epic.list[index];
    } else {
      const speciesRand = this.mulberry32(seed + 5)();
      const index = Math.floor(speciesRand * species.legendary.list.length);
      return species.legendary.list[index];
    }
  }

  /**
   * Roll shiny (independent)
   */
  rollShiny() {
    const seed = parseInt(this.seed.substring(8, 16), 16);
    const rand = this.mulberry32(seed)();
    return rand < this.config.shinyChance;
  }

  /**
   * Generate personality stats
   */
  generatePersonality() {
    const personality = {};
    const { stats } = this.config;
    
    for (let i = 0; i < stats.labels.length; i++) {
      const seed = parseInt(this.seed.substring(i * 2, i * 2 + 8), 16);
      const rand = this.mulberry32(seed)();
      const value = Math.floor(rand * (stats.max - stats.min + 1)) + stats.min;
      personality[stats.labels[i]] = value;
    }
    
    return personality;
  }

  /**
   * Render ASCII art
   */
  renderAscii() {
    const template = ASCII_TEMPLATES[this.buddy?.species] || ASCII_TEMPLATES.default;
    return template.join('\n');
  }

  /**
   * Get buddy status
   */
  getStatus() {
    if (!this.buddy) {
      return { error: 'Buddy not initialized' };
    }

    return {
      species: this.buddy.species,
      shiny: this.buddy.shiny,
      level: this.buddy.level,
      xp: this.buddy.xp,
      mood: this.buddy.mood,
      hunger: this.buddy.hunger,
      happiness: this.buddy.happiness,
      personality: this.buddy.personality,
      ascii: this.renderAscii()
    };
  }

  /**
   * Feed buddy
   */
  async feed(foodType = 'normal') {
    if (!this.buddy) return { error: 'Buddy not initialized' };

    const foodValues = {
      normal: { hunger: -20, happiness: +5 },
      favorite: { hunger: -30, happiness: +15 },
      treat: { hunger: -15, happiness: +25 }
    };

    const food = foodValues[foodType] || foodValues.normal;
    
    this.buddy.hunger = Math.max(0, this.buddy.hunger + food.hunger);
    this.buddy.happiness = Math.min(100, this.buddy.happiness + food.happiness);
    this.buddy.lastInteraction = new Date().toISOString();
    this.buddy.mood = this.calculateMood();

    this.logActivity('feed', { foodType });

    console.log(`\n🍖 Fed ${foodType} food\n`);
    console.log(`Hunger: ${this.buddy.hunger}/100`);
    console.log(`Happiness: ${this.buddy.happiness}/100`);
    console.log(`Mood: ${this.buddy.mood}\n`);

    return {
      success: true,
      hunger: this.buddy.hunger,
      happiness: this.buddy.happiness,
      mood: this.buddy.mood
    };
  }

  /**
   * Play with buddy
   */
  async play(activity = 'chat') {
    if (!this.buddy) return { error: 'Buddy not initialized' };

    const activityValues = {
      chat: { happiness: +10, xp: +5 },
      code: { happiness: +15, xp: +15 },
      debug: { happiness: +5, xp: +20 },
      celebrate: { happiness: +25, xp: +10 }
    };

    const activityData = activityValues[activity] || activityValues.chat;
    
    this.buddy.happiness = Math.min(100, this.buddy.happiness + activityData.happiness);
    this.buddy.xp += activityData.xp;
    this.buddy.lastInteraction = new Date().toISOString();
    this.buddy.mood = this.calculateMood();

    // Check level up
    const leveledUp = this.checkLevelUp();

    this.logActivity('play', { activity });

    console.log(`\n🎮 Played: ${activity}\n`);
    console.log(`Happiness: ${this.buddy.happiness}/100`);
    console.log(`XP: ${this.buddy.xp}`);
    if (leveledUp) {
      console.log(`🎉 LEVEL UP! Now level ${this.buddy.level}\n`);
    }

    return {
      success: true,
      happiness: this.buddy.happiness,
      xp: this.buddy.xp,
      leveledUp
    };
  }

  /**
   * Calculate mood based on stats
   */
  calculateMood() {
    const { buddy } = this;
    
    if (buddy.hunger > 80) return 'hungry';
    if (buddy.happiness > 80) return 'happy';
    if (buddy.happiness < 30) return 'sad';
    if (buddy.hunger < 30) return 'full';
    if (buddy.personality.CHAOS > 70) return 'mischievous';
    if (buddy.personality.WISDOM > 70) return 'wise';
    
    return 'neutral';
  }

  /**
   * Check level up
   */
  checkLevelUp() {
    const xpNeeded = this.buddy.level * 100;
    
    if (this.buddy.xp >= xpNeeded) {
      this.buddy.level++;
      this.buddy.xp = 0;
      return true;
    }
    
    return false;
  }

  /**
   * Log activity
   */
  logActivity(type, data) {
    this.activityLog.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Keep last 50 activities
    if (this.activityLog.length > 50) {
      this.activityLog.shift();
    }
  }

  /**
   * Get activity log
   */
  getActivityLog(limit = 10) {
    return this.activityLog.slice(-limit);
  }

  /**
   * React to user action
   */
  reactToAction(action) {
    if (!this.buddy) return;

    const reactions = {
      'commit': { happiness: +10, xp: +10, message: '🎉 Good commit!' },
      'test_pass': { happiness: +15, xp: +15, message: '✅ Tests passing!' },
      'test_fail': { happiness: -5, xp: +5, message: '❌ Tests failing...' },
      'error': { happiness: -10, xp: +5, message: '⚠️  Error detected' },
      'milestone': { happiness: +25, xp: +25, message: '🏆 Milestone reached!' }
    };

    const reaction = reactions[action] || { happiness: 0, xp: 5, message: '👍' };
    
    this.buddy.happiness = Math.max(0, Math.min(100, this.buddy.happiness + reaction.happiness));
    this.buddy.xp += reaction.xp;
    this.buddy.mood = this.calculateMood();

    console.log(`\n${reaction.message}\n`);
    console.log(`Buddy mood: ${this.buddy.mood}\n`);

    this.logActivity('react', { action, reaction });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let buddyInstance = null;

export function getBuddy(userId) {
  if (!buddyInstance || (userId && buddyInstance.userId !== userId)) {
    buddyInstance = new AuroraBuddy(userId);
  }
  return buddyInstance;
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];
  const userId = args[1] || 'demo-user';

  if (!operation) {
    console.log('AuroraBuddy - Tamagotchi-style companion\n');
    console.log('Usage: node aurora-buddy.mjs <operation> [userId]');
    console.log('\nOperations:');
    console.log('  reveal [userId]     - Reveal your buddy');
    console.log('  status [userId]     - Show buddy status');
    console.log('  feed [userId] [food] - Feed buddy');
    console.log('  play [userId] [act]  - Play with buddy');
    console.log('  stats [userId]      - Show personality stats\n');
    process.exit(0);
  }

  const buddy = getBuddy(userId);

  console.log(`🥚 AuroraBuddy: ${operation} (user: ${userId})\n`);

  switch (operation) {
    case 'reveal':
      console.log('Your buddy:\n');
      console.log(buddy.renderAscii());
      console.log(`\nSpecies: ${buddy.buddy.species}`);
      console.log(`Shiny: ${buddy.buddy.shiny ? '✨ YES!' : 'No'}`);
      console.log(`Personality: ${JSON.stringify(buddy.buddy.personality, null, 2)}\n`);
      break;

    case 'status':
      const status = buddy.getStatus();
      console.log('Buddy Status:\n');
      console.log(`Species: ${status.species}`);
      console.log(`Level: ${status.level}`);
      console.log(`XP: ${status.xp}`);
      console.log(`Mood: ${status.mood}`);
      console.log(`Hunger: ${status.hunger}/100`);
      console.log(`Happiness: ${status.happiness}/100`);
      console.log(`\n${status.ascii}\n`);
      break;

    case 'feed':
      const food = args[2] || 'normal';
      buddy.feed(food);
      break;

    case 'play':
      const activity = args[2] || 'chat';
      buddy.play(activity);
      break;

    case 'stats':
      console.log('Personality Stats:\n');
      for (const [stat, value] of Object.entries(buddy.buddy.personality)) {
        const bar = '█'.repeat(Math.floor(value / 10));
        console.log(`${stat.padEnd(12)} ${bar} ${value}`);
      }
      console.log('\n');
      break;

    default:
      console.log('Unknown operation');
      process.exit(1);
  }

  process.exit(0);
}
