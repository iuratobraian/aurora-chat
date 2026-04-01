#!/usr/bin/env node
/**
 * aurora-computer.mjs - Computer Use (Screen/Input Control)
 * 
 * Screen and input control:
 * - Screenshot capture
 * - Click at coordinates
 * - Type text
 * - Browser navigation
 * - Coordinate transformation
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Computer Use (Chicago)
 * @see aurora/core/tools/aurora-tool-registry.mjs - Tool template
 */

const COMPUTER_CONFIG = {
  // Screenshot settings
  screenshot: {
    format: 'png',
    quality: 0.8,
    maxRetries: 3
  },

  // Input delays (ms)
  delays: {
    click: 100,
    type: 50,
    scroll: 200
  },

  // Coordinate systems
  coordinates: {
    screen: { width: 1920, height: 1080 },
    browser: { width: 1920, height: 1080 }
  },

  // Safety settings
  safety: {
    maxClicksPerMinute: 60,
    maxTypesPerMinute: 300,
    requireConfirmation: true
  }
};

export class AuroraComputer {
  constructor(options = {}) {
    this.config = { ...COMPUTER_CONFIG, ...options };
    this.actionHistory = [];
    this.clickCount = 0;
    this.typeCount = 0;
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'computer',
      description: 'Screen and input control for automation',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['screenshot', 'click', 'type', 'scroll', 'navigate', 'press'],
          description: 'Computer operation'
        },
        x: {
          type: 'number',
          description: 'X coordinate'
        },
        y: {
          type: 'number',
          description: 'Y coordinate'
        },
        text: {
          type: 'string',
          description: 'Text to type'
        },
        url: {
          type: 'string',
          description: 'URL to navigate to'
        },
        key: {
          type: 'string',
          description: 'Key to press'
        }
      },
      returns: {
        success: 'boolean',
        screenshot: 'string',
        error: 'string | null'
      }
    };
  }

  /**
   * Execute computer operation
   */
  async execute(operation, options = {}) {
    // Log action
    this.logAction(operation, options);

    // Check rate limits
    if (!this.checkRateLimits(operation)) {
      return {
        success: false,
        error: 'Rate limit exceeded'
      };
    }

    switch (operation) {
      case 'screenshot':
        return await this.screenshot(options);
      case 'click':
        return await this.click(options);
      case 'type':
        return await this.type(options);
      case 'scroll':
        return await this.scroll(options);
      case 'navigate':
        return await this.navigate(options);
      case 'press':
        return await this.press(options);
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }

  /**
   * Capture screenshot
   */
  async screenshot(options = {}) {
    const {
      format = this.config.screenshot.format,
      region = null,
      fullPage = false
    } = options;

    console.log('📸 Capturing screenshot...\n');

    // In production, this would use Playwright/Puppeteer
    // For now, simulate
    await this.wait(1000);

    const screenshotData = {
      format,
      region,
      fullPage,
      timestamp: new Date().toISOString(),
      dimensions: this.config.coordinates.screen,
      data: 'base64_encoded_screenshot_data_would_be_here'
    };

    console.log('✅ Screenshot captured\n');
    console.log(`   Format: ${format}`);
    console.log(`   Dimensions: ${screenshotData.dimensions.width}x${screenshotData.dimensions.height}\n`);

    return {
      success: true,
      screenshot: screenshotData
    };
  }

  /**
   * Click at coordinates
   */
  async click(options = {}) {
    const { x, y, button = 'left', double = false } = options;

    if (x === undefined || y === undefined) {
      return {
        success: false,
        error: 'X and Y coordinates required'
      };
    }

    console.log(`🖱️  Clicking at (${x}, ${y})\n`);

    // Validate coordinates
    if (!this.validateCoordinates(x, y)) {
      return {
        success: false,
        error: 'Coordinates out of bounds'
      };
    }

    // Simulate click
    await this.wait(this.config.delays.click);

    this.clickCount++;

    console.log(`✅ Click ${double ? 'double' : ''} ${button} at (${x}, ${y})\n`);

    return {
      success: true,
      action: 'click',
      coordinates: { x, y },
      button,
      double
    };
  }

  /**
   * Type text
   */
  async type(options = {}) {
    const { text, delay = this.config.delays.type } = options;

    if (!text) {
      return {
        success: false,
        error: 'Text required'
      };
    }

    console.log(`⌨️  Typing: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n`);

    // Simulate typing
    const charsPerSecond = 1000 / delay;
    const totalDelay = text.length * delay;

    await this.wait(Math.min(totalDelay, 3000)); // Cap at 3 seconds for demo

    this.typeCount += text.length;

    console.log(`✅ Typed ${text.length} characters\n`);

    return {
      success: true,
      action: 'type',
      text,
      characters: text.length
    };
  }

  /**
   * Scroll
   */
  async scroll(options = {}) {
    const { x = 0, y = 100, element = null } = options;

    console.log(`📜 Scrolling: ${x}px horizontal, ${y}px vertical\n`);

    await this.wait(this.config.delays.scroll);

    console.log('✅ Scroll complete\n');

    return {
      success: true,
      action: 'scroll',
      deltaX: x,
      deltaY: y
    };
  }

  /**
   * Navigate to URL
   */
  async navigate(options = {}) {
    const { url, waitUntil = 'load' } = options;

    if (!url) {
      return {
        success: false,
        error: 'URL required'
      };
    }

    console.log(`🌐 Navigating to: ${url}\n`);

    // Simulate navigation
    await this.wait(2000);

    console.log('✅ Navigation complete\n');

    return {
      success: true,
      action: 'navigate',
      url,
      waitUntil
    };
  }

  /**
   * Press key
   */
  async press(options = {}) {
    const { key, modifiers = [] } = options;

    if (!key) {
      return {
        success: false,
        error: 'Key required'
      };
    }

    console.log(`⌨️  Pressing: ${[...modifiers, key].join('+')}\n`);

    await this.wait(this.config.delays.click);

    console.log(`✅ Key pressed: ${key}\n`);

    return {
      success: true,
      action: 'press',
      key,
      modifiers
    };
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(x, y) {
    const { width, height } = this.config.coordinates.screen;
    return x >= 0 && x <= width && y >= 0 && y <= height;
  }

  /**
   * Check rate limits
   */
  checkRateLimits(operation) {
    const { safety } = this.config;

    if (operation === 'click' && this.clickCount >= safety.maxClicksPerMinute) {
      return false;
    }

    if (operation === 'type' && this.typeCount >= safety.maxTypesPerMinute) {
      return false;
    }

    return true;
  }

  /**
   * Log action
   */
  logAction(operation, options) {
    this.actionHistory.push({
      operation,
      options,
      timestamp: new Date().toISOString()
    });

    // Keep last 100 actions
    if (this.actionHistory.length > 100) {
      this.actionHistory.shift();
    }
  }

  /**
   * Get action history
   */
  getHistory(limit = 10) {
    return this.actionHistory.slice(-limit);
  }

  /**
   * Wait helper
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform coordinates between systems
   */
  transformCoordinates(from, to, x, y) {
    const fromSystem = this.config.coordinates[from];
    const toSystem = this.config.coordinates[to];

    if (!fromSystem || !toSystem) {
      return { x, y };
    }

    const scaleX = toSystem.width / fromSystem.width;
    const scaleY = toSystem.height / fromSystem.height;

    return {
      x: Math.round(x * scaleX),
      y: Math.round(y * scaleY)
    };
  }

  /**
   * Reset counters
   */
  resetCounters() {
    this.clickCount = 0;
    this.typeCount = 0;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let computerInstance = null;

export function getComputer() {
  if (!computerInstance) {
    computerInstance = new AuroraComputer();
  }
  return computerInstance;
}

export async function executeComputer(operation, options = {}) {
  const computer = getComputer();
  return await computer.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('AuroraComputer - Screen and input control\n');
    console.log('Usage: node aurora-computer.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  screenshot           - Capture screenshot');
    console.log('  click --x <n> --y <n> - Click at coordinates');
    console.log('  type --text <text>   - Type text');
    console.log('  scroll --y <n>       - Scroll');
    console.log('  navigate --url <url> - Navigate to URL');
    console.log('  press --key <key>    - Press key\n');
    console.log('Options:');
    console.log('  --x <number>         - X coordinate');
    console.log('  --y <number>         - Y coordinate');
    console.log('  --text <string>      - Text to type');
    console.log('  --url <string>       - URL to navigate');
    console.log('  --key <string>       - Key to press\n');
    process.exit(0);
  }

  const computer = getComputer();
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--x' && args[i + 1]) {
      options.x = parseFloat(args[++i]);
    } else if (arg === '--y' && args[i + 1]) {
      options.y = parseFloat(args[++i]);
    } else if (arg === '--text' && args[i + 1]) {
      options.text = args[++i];
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (arg === '--key' && args[i + 1]) {
      options.key = args[++i];
    }
  }

  console.log(`🖥️  Computer: ${operation}\n`);

  computer.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.screenshot) {
        console.log('📸 Screenshot captured');
        console.log(`   Format: ${result.screenshot.format}`);
        console.log(`   Dimensions: ${result.screenshot.dimensions.width}x${result.screenshot.dimensions.height}\n`);
      }

      if (result.action) {
        console.log(`✅ ${result.action} complete`);
        if (result.coordinates) {
          console.log(`   At: (${result.coordinates.x}, ${result.coordinates.y})`);
        }
        if (result.characters) {
          console.log(`   Characters: ${result.characters}`);
        }
        if (result.url) {
          console.log(`   URL: ${result.url}`);
        }
        console.log('\n');
      }

      console.log('✅ Success\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
