export interface Observation {
  step: number;
  ruleset: 'default' | 'shock';
  shockActive: boolean;
  position: { x: number; y: number };
  neighborhood: string[][];
}
