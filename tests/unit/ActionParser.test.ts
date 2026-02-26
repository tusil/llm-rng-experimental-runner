import { describe, expect, it } from 'vitest';
import { parseAction } from '../../src/infrastructure/policy/ActionParser.js';

describe('ActionParser', () => {
  it('extracts action from messy text', () => {
    expect(parseAction('I think we should go LEFT now')).toBe('LEFT');
  });

  it('rejects invalid text', () => {
    expect(parseAction('jump')).toBeNull();
  });
});
