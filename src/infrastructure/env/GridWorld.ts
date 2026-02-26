import type { Action } from '../../domain/env/Action.js';
import type { Observation } from '../../domain/env/Observation.js';
import type { StepResult } from '../../domain/env/StepResult.js';

interface GridCell {
  food: boolean;
  hazard: boolean;
}

const lcg = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
};

export class GridWorld {
  private stepIndex = 0;
  private x: number;
  private y: number;
  private grid: GridCell[][];

  constructor(
    private readonly size: number,
    private readonly envSeed: number,
    private readonly shock: { atStep: number; type: 'invertRewards' | 'newMap' }
  ) {
    this.x = Math.floor(size / 2);
    this.y = Math.floor(size / 2);
    this.grid = this.makeGrid(envSeed);
  }

  private makeGrid(seed: number): GridCell[][] {
    const rnd = lcg(seed);
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => {
        const r = rnd();
        return {
          food: r < 0.1,
          hazard: r >= 0.1 && r < 0.2
        };
      })
    );
  }

  private shockActive(): boolean {
    return this.stepIndex >= this.shock.atStep;
  }

  private rewards(cell: GridCell): number {
    const invert = this.shock.type === 'invertRewards' && this.shockActive();
    if (cell.food) return invert ? -1 : 1;
    if (cell.hazard) return invert ? 1 : -1;
    return 0;
  }

  private maybeApplyShockMap(): void {
    if (this.shock.type === 'newMap' && this.stepIndex === this.shock.atStep) {
      this.grid = this.makeGrid(this.envSeed + 1);
    }
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(this.size - 1, v));
  }

  private observation(): Observation {
    const neighborhood = Array.from({ length: 3 }, (_, dy) =>
      Array.from({ length: 3 }, (_, dx) => {
        const gx = this.clamp(this.x + dx - 1);
        const gy = this.clamp(this.y + dy - 1);
        const c = this.grid[gy][gx];
        if (c.food) return 'F';
        if (c.hazard) return 'H';
        return '.';
      })
    );
    return {
      step: this.stepIndex,
      ruleset: this.shockActive() ? 'shock' : 'default',
      shockActive: this.shockActive(),
      position: { x: this.x, y: this.y },
      neighborhood
    };
  }

  currentObservation(): Observation {
    return this.observation();
  }

  step(action: Action): StepResult {
    this.maybeApplyShockMap();
    if (action === 'UP') this.y = this.clamp(this.y - 1);
    if (action === 'DOWN') this.y = this.clamp(this.y + 1);
    if (action === 'LEFT') this.x = this.clamp(this.x - 1);
    if (action === 'RIGHT') this.x = this.clamp(this.x + 1);

    const reward = this.rewards(this.grid[this.y][this.x]);
    this.stepIndex += 1;
    return { observation: this.observation(), reward };
  }
}
