import type { ClockPort } from '../../application/ports/ClockPort.js';

export class SystemClockAdapter implements ClockPort {
  nowMs(): number {
    return Date.now();
  }
}
