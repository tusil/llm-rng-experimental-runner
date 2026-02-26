export interface RunSummary {
  runId: string;
  runIndex: number;
  totalReward: number;
  meanRewardPreShock: number;
  meanRewardPostShock: number;
  recoveryStepsTo90pct: number | null;
  actionHistogram: Record<string, number>;
  rewardMovingAverage: number[];
  divergenceSeries: number[];
  meanDivergence: number;
  errorCounts: {
    timeouts: number;
    invalidOutputs: number;
    fallbacks: number;
  };
}
