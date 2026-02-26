import type { Action } from '../../domain/env/Action.js';

export interface PolicyInput {
  allowedActions: readonly Action[];
  observationText: string;
  memoryText: string;
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
}

export interface PolicyResult {
  action: Action;
  rawText: string;
  latencyMs: number;
  tokensUsed?: number;
  usedFallback?: boolean;
  fallbackReason?: 'timeout' | 'invalid_output' | 'http_error';
}

export interface PolicyPort {
  chooseAction(input: PolicyInput): Promise<PolicyResult>;
}
