export const ACTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'] as const;
export type Action = (typeof ACTIONS)[number];
