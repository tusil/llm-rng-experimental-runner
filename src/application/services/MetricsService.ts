import { ACTIONS, type Action } from '../../domain/env/Action.js';

export class MetricsService {
  movingAverage(values: readonly number[], window: number): number[] {
    return values.map((_, i) => {
      const start = Math.max(0, i - window + 1);
      const slice = values.slice(start, i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
  }

  recoveryStepsTo90pct(rewards: readonly number[], shockAt: number, window = 50): number | null {
    const preStart = Math.max(0, shockAt - 100);
    const pre = rewards.slice(preStart, shockAt);
    if (pre.length === 0) return null;
    const baseline = pre.reduce((a, b) => a + b, 0) / pre.length;
    const target = baseline * 0.9;
    const ma = this.movingAverage(rewards, window);
    for (let i = shockAt; i < ma.length; i += 1) {
      if (ma[i] >= target) {
        return i - shockAt;
      }
    }
    return null;
  }

  jsDivergence(p: readonly number[], q: readonly number[]): number {
    const m = p.map((v, i) => 0.5 * (v + q[i]));
    const kl = (a: readonly number[], b: readonly number[]) => a.reduce((sum, av, i) => {
      if (av === 0) return sum;
      return sum + av * Math.log2(av / Math.max(b[i], 1e-12));
    }, 0);
    return 0.5 * kl(p, m) + 0.5 * kl(q, m);
  }

  actionDivergenceSeries(actions: readonly Action[], window = 50): { series: number[]; mean: number } {
    const windows: number[][] = [];
    for (let i = 0; i < actions.length; i += window) {
      const segment = actions.slice(i, i + window);
      if (segment.length === 0) continue;
      const hist = ACTIONS.map((a) => segment.filter((s) => s === a).length / segment.length);
      windows.push(hist);
    }
    if (windows.length === 0) return { series: [], mean: 0 };
    const base = windows[0];
    const series = windows.map((w) => this.jsDivergence(base, w));
    const mean = series.reduce((a, b) => a + b, 0) / series.length;
    return { series, mean };
  }
}
