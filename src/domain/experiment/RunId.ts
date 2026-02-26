export type RunId = string;

export const buildRunId = (index: number): RunId => `run-${index.toString().padStart(4, '0')}`;
