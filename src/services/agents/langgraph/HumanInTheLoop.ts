import type { AgentType } from '../agentOrchestrator';
import type { LangGraphState } from './types';

export type ReviewDecision = 'approve' | 'reject' | 'revise' | 'escalate';

export interface ReviewRequest {
  id: string;
  taskId: string;
  agentType: AgentType;
  state: LangGraphState;
  createdAt: number;
  requestedBy: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'revised' | 'escalated';
  dueAt?: number;
}

export interface ReviewFeedback {
  id: string;
  requestId: string;
  reviewerId: string;
  decision: ReviewDecision;
  comments: string;
  suggestedChanges?: string;
  reviewedAt: number;
  metadata?: Record<string, unknown>;
}

export interface HumanInTheLoopConfig {
  autoExpireMinutes: number;
  maxConcurrentReviews: number;
  escalationThreshold: number;
  requireComments: boolean;
  notifyOnSubmission: boolean;
}

const DEFAULT_HITL_CONFIG: HumanInTheLoopConfig = {
  autoExpireMinutes: 60,
  maxConcurrentReviews: 10,
  escalationThreshold: 3,
  requireComments: false,
  notifyOnSubmission: true
};

type ReviewListener = (request: ReviewRequest, feedback?: ReviewFeedback) => void;

export class HumanInTheLoop {
  private config: HumanInTheLoopConfig;
  private reviewRequests: Map<string, ReviewRequest> = new Map();
  private feedbackHistory: Map<string, ReviewFeedback[]> = new Map();
  private listeners: Set<ReviewListener> = new Set();
  private pendingCallbacks: Map<string, (feedback: ReviewFeedback) => void> = new Map();

  constructor(config: Partial<HumanInTheLoopConfig> = {}) {
    this.config = { ...DEFAULT_HITL_CONFIG, ...config };
  }

  createReviewRequest(
    taskId: string,
    agentType: AgentType,
    state: LangGraphState,
    requestedBy: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): ReviewRequest {
    if (this.getPendingCount() >= this.config.maxConcurrentReviews) {
      throw new Error('Maximum concurrent reviews reached');
    }

    const request: ReviewRequest = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      agentType,
      state,
      createdAt: Date.now(),
      requestedBy,
      priority,
      status: 'pending',
      dueAt: Date.now() + this.config.autoExpireMinutes * 60 * 1000
    };

    this.reviewRequests.set(request.id, request);
    this.feedbackHistory.set(request.id, []);

    this.notifyListeners(request);

    return request;
  }

  getReviewRequest(requestId: string): ReviewRequest | null {
    return this.reviewRequests.get(requestId) || null;
  }

  getPendingReviews(): ReviewRequest[] {
    const now = Date.now();
    return Array.from(this.reviewRequests.values())
      .filter(r => r.status === 'pending' || r.status === 'in_review')
      .filter(r => !r.dueAt || r.dueAt > now)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  startReview(requestId: string, reviewerId: string): ReviewRequest | null {
    const request = this.reviewRequests.get(requestId);
    if (!request || request.status !== 'pending') return null;

    request.status = 'in_review';
    this.notifyListeners(request);

    return request;
  }

  submitFeedback(
    requestId: string,
    reviewerId: string,
    decision: ReviewDecision,
    comments: string,
    suggestedChanges?: string,
    metadata?: Record<string, unknown>
  ): ReviewFeedback | null {
    const request = this.reviewRequests.get(requestId);
    if (!request) return null;

    if (this.config.requireComments && !comments.trim()) {
      throw new Error('Comments are required');
    }

    const feedback: ReviewFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requestId,
      reviewerId,
      decision,
      comments,
      suggestedChanges,
      reviewedAt: Date.now(),
      metadata
    };

    const history = this.feedbackHistory.get(requestId) || [];
    history.push(feedback);
    this.feedbackHistory.set(requestId, history);

    switch (decision) {
      case 'approve':
        request.status = 'approved';
        break;
      case 'reject':
        request.status = 'rejected';
        break;
      case 'revise':
        request.status = 'revised';
        break;
      case 'escalate':
        request.status = 'escalated';
        break;
    }

    this.notifyListeners(request, feedback);

    const callback = this.pendingCallbacks.get(requestId);
    if (callback) {
      callback(feedback);
      this.pendingCallbacks.delete(requestId);
    }

    return feedback;
  }

  async waitForReview(
    requestId: string,
    timeoutMs: number = 300000
  ): Promise<ReviewFeedback> {
    const request = this.reviewRequests.get(requestId);
    if (!request) {
      throw new Error(`Review request ${requestId} not found`);
    }

    if (request.status !== 'pending' && request.status !== 'in_review') {
      const history = this.feedbackHistory.get(requestId);
      if (history && history.length > 0) {
        return history[history.length - 1];
      }
      throw new Error('No feedback available');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCallbacks.delete(requestId);
        reject(new Error('Review timeout'));
      }, timeoutMs);

      this.pendingCallbacks.set(requestId, (feedback) => {
        clearTimeout(timeout);
        resolve(feedback);
      });
    });
  }

  getFeedbackHistory(requestId: string): ReviewFeedback[] {
    return this.feedbackHistory.get(requestId) || [];
  }

  getReviewStats(): {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    revised: number;
    escalated: number;
    avgReviewTimeMs: number;
  } {
    const requests = Array.from(this.reviewRequests.values());
    const feedback = Array.from(this.feedbackHistory.values()).flat();

    const stats = {
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
      revised: 0,
      escalated: 0,
      avgReviewTimeMs: 0
    };

    requests.forEach(r => {
      if (r.status in stats) {
        stats[r.status as keyof typeof stats]++;
      }
    });

    if (feedback.length > 0) {
      const totalTime = feedback.reduce((sum, f) => {
        const request = this.reviewRequests.get(f.requestId);
        return sum + (f.reviewedAt - (request?.createdAt || 0));
      }, 0);
      stats.avgReviewTimeMs = totalTime / feedback.length;
    }

    return stats;
  }

  addListener(listener: ReviewListener): void {
    this.listeners.add(listener);
  }

  removeListener(listener: ReviewListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(request: ReviewRequest, feedback?: ReviewFeedback): void {
    this.listeners.forEach(listener => {
      try {
        listener(request, feedback);
      } catch (error) {
        console.error('Review listener error:', error);
      }
    });
  }

  private getPendingCount(): number {
    return Array.from(this.reviewRequests.values())
      .filter(r => r.status === 'pending' || r.status === 'in_review')
      .length;
  }

  cancelRequest(requestId: string): boolean {
    const request = this.reviewRequests.get(requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = 'rejected';
    this.notifyListeners(request);

    return true;
  }

  escalateRequest(requestId: string, reason: string): ReviewRequest | null {
    const request = this.reviewRequests.get(requestId);
    if (!request) return null;

    request.status = 'escalated';
    this.notifyListeners(request);

    return request;
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, request] of this.reviewRequests.entries()) {
      if (request.dueAt && request.dueAt < now && request.status === 'pending') {
        request.status = 'rejected';
        cleaned++;
      }
    }

    return cleaned;
  }

  clear(): void {
    this.reviewRequests.clear();
    this.feedbackHistory.clear();
    this.pendingCallbacks.clear();
  }

  updateConfig(config: Partial<HumanInTheLoopConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const humanInTheLoop = new HumanInTheLoop();
