import { readFileSync } from 'node:fs';
import type { RngPort } from '../../application/ports/RngPort.js';

export class FileRngAdapter implements RngPort {
  private offset = 0;

  constructor(private readonly bytes: Buffer) {
    if (bytes.length < 4) {
      throw new Error('File RNG requires at least 4 bytes');
    }
  }

  static fromPath(path: string): FileRngAdapter {
    return new FileRngAdapter(readFileSync(path));
  }

  nextUint32(): number {
    if (this.offset + 4 > this.bytes.length) this.offset = 0;
    const value = this.bytes.readUInt32BE(this.offset);
    this.offset += 4;
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
