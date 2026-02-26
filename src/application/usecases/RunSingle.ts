import { createHash } from 'node:crypto';
import { ACTIONS, type Action } from '../../domain/env/Action.js';
import type { MemoryItem } from '../../domain/agent/MemoryItem.js';
import type { RunConfig } from '../../domain/experiment/RunConfig.js';
import type { RunSummary } from '../../domain/experiment/RunSummary.js';
import type { GridWorld } from '../../infrastructure/env/GridWorld.js';
import type { LoggerPort } from '../ports/LoggerPort.js';
import type { PolicyPort } from '../ports/PolicyPort.js';
import type { RngPort } from '../ports/RngPort.js';
import { MemoryService } from '../services/MemoryService.js';
import { MetricsService } from '../services/MetricsService.js';
import { PromptService } from '../services/PromptService.js';

export class RunSingle {
  constructor(
    private readonly deps: {
      config: RunConfig;
      rng: RngPort;
      policy: PolicyPort;
      logger: LoggerPort;
      envFactory: (seed: number) => GridWorld;
      memoryService: MemoryService;
      promptService: PromptService;
      metricsService: MetricsService;
    }
  ) {}

  async execute(runId: string, runIndex: number): Promise<RunSummary> {
    const cfg = this.deps.config;
    const env = this.deps.envFactory(cfg.env.envSeed + runIndex);
    const memory: MemoryItem[] = [];
    const rewards: number[] = [];
    const actions: Action[] = [];
    let cumulativeReward = 0;
    const errorCounts = { timeouts: 0, invalidOutputs: 0, fallbacks: 0 };

    const stepProgressEvery = Math.max(1, Math.min(100, Math.floor(cfg.stepsPerRun / 10) || 1));

    for (let step = 0; step < cfg.stepsPerRun; step += 1) {
      const observation = env.currentObservation();
      const memItems = this.deps.memoryService.selectMemory(
        memory,
        cfg.agent.memory.kRecent,
        cfg.agent.memory.explorationProb
      );
      const observationText = this.deps.promptService.observationToText(observation);
      const memoryText = this.deps.memoryService.toText(memItems);
      const proposal = await this.deps.policy.chooseAction({
        allowedActions: ACTIONS,
        observationText,
        memoryText,
        temperature: cfg.policy.temperature,
        maxOutputTokens: cfg.policy.maxOutputTokens,
        timeoutMs: cfg.policy.timeoutMs
      });
      let finalAction = proposal.action;
      let usedEpsilonOverride = false;

      if (this.deps.rng.nextFloat01() < cfg.agent.epsilon) {
        finalAction = this.deps.rng.pickOne(ACTIONS);
        usedEpsilonOverride = true;
      }

      const result = env.step(finalAction);
      cumulativeReward += result.reward;
      rewards.push(result.reward);
      actions.push(finalAction);

      memory.push({
        id: `${runId}-${step}`,
        step,
        action: finalAction,
        reward: result.reward,
        summary: `At (${result.observation.position.x},${result.observation.position.y}) got reward ${result.reward}`
      });

      if (proposal.usedFallback) {
        errorCounts.fallbacks += 1;
        if (proposal.fallbackReason === 'timeout') errorCounts.timeouts += 1;
        if (proposal.fallbackReason === 'invalid_output') errorCounts.invalidOutputs += 1;
      }

      await this.deps.logger.logStep({
        runId,
        runIndex,
        mode: { rng: cfg.rng.driver, policy: cfg.policy.driver },
        envSeed: cfg.env.envSeed + runIndex,
        step,
        ruleset: result.observation.ruleset,
        shockActive: result.observation.shockActive,
        pos: result.observation.position,
        actionProposed: proposal.action,
        actionFinal: finalAction,
        usedEpsilonOverride,
        usedFallback: Boolean(proposal.usedFallback),
        reward: result.reward,
        cumulativeReward,
        memoryUsedIds: memItems.map((m) => m.id),
        policyLatencyMs: proposal.latencyMs,
        observationHash: createHash('sha1').update(observationText).digest('hex')
      });

      if ((step + 1) % stepProgressEvery === 0 || step === cfg.stepsPerRun - 1) {
        const pct = Math.round(((step + 1) / cfg.stepsPerRun) * 100);
        console.log(
          `[progress] run=${runId} step=${step + 1}/${cfg.stepsPerRun} (${pct}%) reward=${cumulativeReward.toFixed(2)}`
        );
      }
    }

    const ma = this.deps.metricsService.movingAverage(rewards, 50);
    const recovery = this.deps.metricsService.recoveryStepsTo90pct(rewards, cfg.shock.atStep, 50);
    const div = this.deps.metricsService.actionDivergenceSeries(actions, 50);
    const pre = rewards.slice(Math.max(0, cfg.shock.atStep - 100), cfg.shock.atStep);
    const post = rewards.slice(cfg.shock.atStep);
    const hist = Object.fromEntries(ACTIONS.map((a) => [a, actions.filter((x) => x === a).length]));

    const summary: RunSummary = {
      runId,
      runIndex,
      totalReward: cumulativeReward,
      meanRewardPreShock: pre.length ? pre.reduce((a, b) => a + b, 0) / pre.length : 0,
      meanRewardPostShock: post.length ? post.reduce((a, b) => a + b, 0) / post.length : 0,
      recoveryStepsTo90pct: recovery,
      actionHistogram: hist,
      rewardMovingAverage: ma,
      divergenceSeries: div.series,
      meanDivergence: div.mean,
      errorCounts
    };

    await this.deps.logger.logRunSummary(summary);
    return summary;
  }
}
