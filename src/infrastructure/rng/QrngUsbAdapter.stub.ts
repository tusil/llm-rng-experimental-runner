import type { RngPort } from '../../application/ports/RngPort.js';

export class QrngUsbAdapterStub implements RngPort {
  nextUint32(): number {
    throw new Error('QRNG USB adapter not implemented yet. TODO: integrate hardware driver.');
  }

  nextFloat01(): number {
    throw new Error('QRNG USB adapter not implemented yet. TODO: integrate hardware driver.');
  }

  pickOne<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    throw new Error('QRNG USB adapter not implemented yet. TODO: integrate hardware driver.');
  }
}
