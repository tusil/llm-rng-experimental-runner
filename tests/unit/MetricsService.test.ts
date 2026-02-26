import { describe, expect, it } from 'vitest';
import { MetricsService } from '../../src/application/services/MetricsService.js';

describe('MetricsService', () => {
  it('recovery time computed', () => {
    const svc = new MetricsService();
    const rewards = [...Array(100).fill(1), ...Array(20).fill(0), ...Array(40).fill(1)];
    const recovery = svc.recoveryStepsTo90pct(rewards, 100, 10);
    expect(recovery).not.toBeNull();
  });

  it('js divergence 0 for identical distributions', () => {
    const svc = new MetricsService();
    expect(svc.jsDivergence([0.5, 0.5], [0.5, 0.5])).toBeCloseTo(0, 8);
  });
});
