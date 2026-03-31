/**
 * Event Bus for TradeShare
 * Decoupled communication between components and services
 */

type EventCallback = (data: any) => void;

class EventBus {
  private events: { [key: string]: EventCallback[] } = {};

  /**
   * Subscribe to an event
   * @param event - Name of the event
   * @param callback - Function to execute when event is emitted
   * @returns Unsubscribe function
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Emit an event
   * @param event - Name of the event
   * @param data - Optional data to pass to callbacks
   */
  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event bus callback for event "${event}":`, error);
        }
      });
    }
    
    // Also dispatch as a native CustomEvent for cross-framework/legacy support
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(`tradeshare:${event}`, { detail: data });
      window.dispatchEvent(customEvent);
    }
  }

  /**
   * Unsubscribe from an event
   * @param event - Name of the event
   * @param callback - Callback to remove
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Clear all subscribers for an event
   * @param event - Name of the event
   */
  clear(event: string): void {
    if (this.events[event]) {
      delete this.events[event];
    }
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Common Event Names Constants
export const APP_EVENTS = {
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_REGISTER: 'auth:register',
  NOTIFICATION_RECEIVED: 'notification:received',
  POST_CREATED: 'post:created',
  POST_DELETED: 'post:deleted',
  COMMUNITY_JOINED: 'community:joined',
  PAYMENT_SUCCESS: 'payment:success',
  THEME_CHANGED: 'theme:changed',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  SIGNAL_NEW: 'signal:new',
  SIGNAL_UPDATE: 'signal:update',
};

export default eventBus;
