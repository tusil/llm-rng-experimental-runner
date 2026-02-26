export interface RngPort {
  nextUint32(): number;
  nextFloat01(): number;
  pickOne<T>(items: readonly T[]): T;
}
