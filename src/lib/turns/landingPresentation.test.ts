import { describe, expect, it } from 'vitest';
import { getLandingOutcomeMessage } from './landingPresentation';

describe('landing presentation', () => {
  it('describes rent and special outcomes', () => {
    expect(
      getLandingOutcomeMessage({
        kind: 'pay-rent',
        amount: 150,
        toPlayerId: 'player_2',
        message: 'Player 1 paid rent.',
      })
    ).toBe('Rent has been paid automatically for this landing.');

    expect(
      getLandingOutcomeMessage({
        kind: 'special',
        message: 'Player 1 paid tax.',
        effect: {
          playerId: 'player_1',
          effect: 'tax',
          amount: 200,
        },
      })
    ).toBe('Player 1 paid tax.');
  });

  it('returns null for non-outcome states', () => {
    expect(getLandingOutcomeMessage(null)).toBeNull();
    expect(getLandingOutcomeMessage({ kind: 'buy-property', propertyPosition: 4, message: 'Buy.' })).toBeNull();
    expect(getLandingOutcomeMessage({ kind: 'none' })).toBeNull();
  });
});
