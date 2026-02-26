import type { Observation } from '../../domain/env/Observation.js';

export class PromptService {
  observationToText(observation: Observation): string {
    const rows = observation.neighborhood.map((row) => row.join(' ')).join('\n');
    return [
      `Step: ${observation.step}`,
      `Ruleset: ${observation.ruleset}`,
      `Shock active: ${observation.shockActive}`,
      `Position: (${observation.position.x},${observation.position.y})`,
      'Neighborhood:',
      rows
    ].join('\n');
  }
}
