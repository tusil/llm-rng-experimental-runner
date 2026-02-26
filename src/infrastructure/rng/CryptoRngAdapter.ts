import { randomBytes } from 'node:crypto';
import type { RngPort } from '../../application/ports/RngPort.js';

export class CryptoRngAdapter implements RngPort {
  nextUint32(): number {
    return randomBytes(4).readUInt32BE(0);
  }

  nextFloat01(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  pickOne<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    const idx = this.nextUint32() % items.length;
    return items[idx];
  }
}
