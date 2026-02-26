import type { RunSummary } from '../../domain/experiment/RunSummary.js';

export interface StepEvent {
  runId: string;
  runIndex: number;
  mode: {
    rng: string;
    policy: string;
  };
  envSeed: number;
  step: number;
  ruleset: string;
  shockActive: boolean;
  pos: { x: number; y: number };
  actionProposed: string;
  actionFinal: string;
  usedEpsilonOverride: boolean;
  usedFallback: boolean;
  reward: number;
  cumulativeReward: number;
  memoryUsedIds: string[];
  policyLatencyMs: number;
  observationHash?: string;
}

export interface LoggerPort {
  logStep(stepEvent: StepEvent): Promise<void>;
  logRunSummary(runSummary: RunSummary): Promise<void>;
}
