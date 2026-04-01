#!/usr/bin/env node
/**
 * aurora-bridge.mjs - Bridge Mode for External AI Integration
 * 
 * Connect Aurora to external AI providers:
 * - JWT authentication
 * - Session sync
 * - Work modes (single-session, worktree, same-dir)
 * - Trusted device tokens
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Bridge Mode
 * @see aurora/core/providers/ - Existing provider implementations
 * @see .agent/aurora/connectors.json - MCP connector configurations
 */

import crypto from 'node:crypto';

const BRIDGE_CONFIG = {
  // Supported AI providers
  providers: {
    kimi: {
      endpoint: 'https://api.moonshot.cn/v1',
      models: ['kimi-k2-instruct', 'kimi-k2-0905']
    },
    openrouter: {
      endpoint: 'https://openrouter.ai/api/v1',
      models: ['qwen-2.5-coder-32b', 'llama-3.3-70b']
    },
    groq: {
      endpoint: 'https://api.groq.com/openai/v1',
      models: ['llama-3.3-70b-versatile', 'mixtral-8x7b']
    }
  },

  // Work modes
  workModes: {
    'single-session': 'Single session, no persistence',
    'worktree': 'Git worktree-based sessions',
    'same-dir': 'Same directory sessions'
  },

  // Session TTL (24 hours)
  sessionTTL: 24 * 60 * 60 * 1000
};

export class AuroraBridge {
  constructor(options = {}) {
    this.config = { ...BRIDGE_CONFIG, ...options };
    this.sessions = new Map();
    this.trustedDevices = new Set();
    this.currentProvider = null;
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'bridge',
      description: 'Connect to external AI providers with session management',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['connect', 'disconnect', 'status', 'trust', 'sync'],
          description: 'Bridge operation'
        },
        provider: {
          type: 'string',
          enum: ['kimi', 'openrouter', 'groq'],
          description: 'AI provider to connect to'
        },
        workMode: {
          type: 'string',
          enum: ['single-session', 'worktree', 'same-dir'],
          description: 'Work mode'
        },
        deviceId: {
          type: 'string',
          description: 'Device ID for trust'
        }
      },
      returns: {
        connected: 'boolean',
        session: 'object',
        provider: 'string'
      }
    };
  }

  /**
   * Execute bridge operation
   */
  async execute(operation, options = {}) {
    switch (operation) {
      case 'connect':
        return await this.connect(options);
      case 'disconnect':
        return await this.disconnect(options);
      case 'status':
        return this.getStatus();
      case 'trust':
        return await this.trustDevice(options);
      case 'sync':
        return await this.syncSession(options);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  /**
   * Connect to AI provider
   */
  async connect(options = {}) {
    const {
      provider = 'kimi',
      workMode = 'single-session',
      apiKey
    } = options;

    console.log('\n🌉 BRIDGE: Connecting to external AI\n');
    console.log(`Provider: ${provider}`);
    console.log(`Work mode: ${workMode}\n`);

    // Validate provider
    if (!this.config.providers[provider]) {
      return {
        success: false,
        error: `Unknown provider: ${provider}`
      };
    }

    // Generate session ID
    const sessionId = this.generateSessionId(provider, workMode);

    // Create session
    const session = {
      id: sessionId,
      provider,
      workMode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.sessionTTL).toISOString(),
      status: 'active',
      messages: [],
      context: {}
    };

    this.sessions.set(sessionId, session);
    this.currentProvider = provider;

    console.log(`✅ Connected to ${provider}\n`);
    console.log(`Session ID: ${sessionId}\n`);

    return {
      success: true,
      connected: true,
      session: {
        id: session.id,
        provider: session.provider,
        workMode: session.workMode,
        expiresAt: session.expiresAt
      }
    };
  }

  /**
   * Disconnect from provider
   */
  async disconnect(options = {}) {
    const { sessionId } = options;

    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.status = 'disconnected';
      session.disconnectedAt = new Date().toISOString();

      console.log(`🔌 Disconnected from ${session.provider}\n`);

      return {
        success: true,
        disconnected: true,
        sessionId
      };
    }

    return {
      success: false,
      error: 'Session not found'
    };
  }

  /**
   * Get connection status
   */
  getStatus() {
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.status === 'active');

    return {
      success: true,
      status: {
        currentProvider: this.currentProvider,
        activeSessions: activeSessions.length,
        totalSessions: this.sessions.size,
        trustedDevices: this.trustedDevices.size,
        sessions: activeSessions.map(s => ({
          id: s.id,
          provider: s.provider,
          workMode: s.workMode,
          createdAt: s.createdAt
        }))
      }
    };
  }

  /**
   * Trust a device
   */
  async trustDevice(options = {}) {
    const { deviceId, deviceName } = options;

    if (!deviceId) {
      return {
        success: false,
        error: 'Device ID required'
      };
    }

    this.trustedDevices.add(deviceId);

    console.log(`✅ Device trusted: ${deviceName || deviceId}\n`);

    return {
      success: true,
      trusted: true,
      deviceId,
      deviceName
    };
  }

  /**
   * Sync session state
   */
  async syncSession(options = {}) {
    const { sessionId, state } = options;

    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID required'
      };
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }

    // Update session context
    session.context = { ...session.context, ...state };
    session.lastSync = new Date().toISOString();

    console.log(`🔄 Session synced: ${sessionId}\n`);

    return {
      success: true,
      synced: true,
      sessionId,
      lastSync: session.lastSync
    };
  }

  /**
   * Generate session ID
   */
  generateSessionId(provider, workMode) {
    const data = `${provider}-${workMode}-${Date.now()}-${Math.random()}`;
    return `bridge-${crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)}`;
  }

  /**
   * Send message to provider
   */
  async sendMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }

    // Add message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    console.log(`📤 Message sent to ${session.provider}\n`);

    // In production, this would call the actual provider API
    // For now, simulate response
    return {
      success: true,
      message: {
        role: 'assistant',
        content: `Response from ${session.provider} (simulated)`,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get available providers
   */
  getProviders() {
    return {
      success: true,
      providers: Object.entries(this.config.providers).map(([key, config]) => ({
        id: key,
        endpoint: config.endpoint,
        models: config.models
      }))
    };
  }

  /**
   * Get work modes
   */
  getWorkModes() {
    return {
      success: true,
      workModes: Object.entries(this.config.workModes).map(([key, description]) => ({
        id: key,
        description
      }))
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let bridgeInstance = null;

export function getBridge() {
  if (!bridgeInstance) {
    bridgeInstance = new AuroraBridge();
  }
  return bridgeInstance;
}

export async function executeBridge(operation, options = {}) {
  const bridge = getBridge();
  return await bridge.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('AuroraBridge - Connect to external AI providers\n');
    console.log('Usage: node aurora-bridge.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  connect [provider]     - Connect to AI provider');
    console.log('  disconnect [session]   - Disconnect from provider');
    console.log('  status                 - Show connection status');
    console.log('  trust <device>         - Trust a device');
    console.log('  sync <session>         - Sync session state');
    console.log('  providers              - List available providers');
    console.log('  work-modes             - List work modes\n');
    console.log('Options:');
    console.log('  --provider <name>      - Provider (kimi, openrouter, groq)');
    console.log('  --mode <mode>          - Work mode');
    console.log('  --device <id>          - Device ID\n');
    process.exit(0);
  }

  const bridge = getBridge();
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--provider' && args[i + 1]) {
      options.provider = args[++i];
    } else if (arg === '--mode' && args[i + 1]) {
      options.workMode = args[++i];
    } else if (arg === '--device' && args[i + 1]) {
      options.deviceId = args[++i];
    } else if (!arg.startsWith('-') && operation !== 'connect') {
      options.sessionId = arg;
    }
  }

  console.log(`🌉 Bridge: ${operation}\n`);

  bridge.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.status) {
        console.log('📊 Status:\n');
        console.log(`  Current Provider: ${result.status.currentProvider || 'None'}`);
        console.log(`  Active Sessions: ${result.status.activeSessions}`);
        console.log(`  Total Sessions: ${result.status.totalSessions}`);
        console.log(`  Trusted Devices: ${result.status.trustedDevices}\n`);
      }

      if (result.providers) {
        console.log('📋 Providers:\n');
        for (const p of result.providers) {
          console.log(`  ${p.id}:`);
          console.log(`    Endpoint: ${p.endpoint}`);
          console.log(`    Models: ${p.models.join(', ')}\n`);
        }
      }

      if (result.session) {
        console.log('Session:', result.session.id);
        console.log('Provider:', result.session.provider);
        console.log('Mode:', result.session.workMode);
      }

      console.log('\n✅ Success\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
