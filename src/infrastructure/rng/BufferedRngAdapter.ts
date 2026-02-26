import type { RngPort } from '../../application/ports/RngPort.js';

export class BufferedRngAdapter implements RngPort {
  private buffer: number[] = [];

  constructor(private readonly inner: RngPort, private readonly bufferWords = 256) {}

  private refill(): void {
    this.buffer = [];
    for (let i = 0; i < this.bufferWords; i += 1) {
      this.buffer.push(this.inner.nextUint32());
    }
  }

  nextUint32(): number {
    if (this.buffer.length === 0) this.refill();
    const value = this.buffer.pop();
    if (value === undefined) throw new Error('buffer unexpectedly empty');
    return value;
  }

  nextFloat01(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  pickOne<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    return items[this.nextUint32() % items.length];
  }
}
