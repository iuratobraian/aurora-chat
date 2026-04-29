/**
 * aurora-computer.mjs - ComputerUse: Screen/Input Control
 *
 * Screenshot + click/type/coordinate + browser automation.
 */

export class AuroraComputer {
  constructor() { this.history = []; }

  async screenshot() {
    return { success: false, error: 'Screenshot requires display server. Use remote-browser skill instead.' };
  }

  async click(x, y) {
    this.history.push({ action: 'click', x, y, at: Date.now() });
    return { success: false, error: 'Click requires display server' };
  }

  async type(text) {
    this.history.push({ action: 'type', text, at: Date.now() });
    return { success: false, error: 'Type requires display server' };
  }

  async navigate(url) {
    this.history.push({ action: 'navigate', url, at: Date.now() });
    return { success: false, error: 'Navigation requires browser instance' };
  }

  getHistory() { return this.history; }

  getSchema() {
    return {
      name: 'computer_use',
      description: 'Screen and input control (screenshot, click, type, navigate). Requires display server or remote browser.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['screenshot', 'click', 'type', 'navigate'] },
          x: { type: 'number' },
          y: { type: 'number' },
          text: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['action'],
      },
    };
  }
}
