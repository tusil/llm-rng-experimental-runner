import type { Observation } from './Observation.js';

export interface StepResult {
  observation: Observation;
  reward: number;
}
