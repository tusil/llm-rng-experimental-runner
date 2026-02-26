import type { MemoryItem } from '../../domain/agent/MemoryItem.js';
import type { RngPort } from '../ports/RngPort.js';

export class MemoryService {
  constructor(private readonly rng: RngPort) {}

  selectMemory(memory: readonly MemoryItem[], kRecent: number, explorationProb: number): MemoryItem[] {
    const recent = memory.slice(Math.max(0, memory.length - kRecent));
    const older = memory.slice(0, Math.max(0, memory.length - kRecent));
    const picked = [...recent];

    if (older.length > 0 && this.rng.nextFloat01() < explorationProb) {
      picked.push(this.rng.pickOne(older));
    }

    return picked;
  }

  toText(items: readonly MemoryItem[]): string {
    if (items.length === 0) {
      return 'No prior memory.';
    }
    return items.map((m) => `#${m.step} ${m.summary} (a=${m.action}, r=${m.reward})`).join('\n');
  }
}
