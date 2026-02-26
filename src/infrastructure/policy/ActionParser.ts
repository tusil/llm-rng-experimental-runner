import { ACTIONS, type Action } from '../../domain/env/Action.js';

export const parseAction = (text: string): Action | null => {
  const m = text.toUpperCase().match(/\b(UP|DOWN|LEFT|RIGHT|STAY)\b/);
  if (!m) return null;
  const candidate = m[1] as Action;
  return ACTIONS.includes(candidate) ? candidate : null;
};
