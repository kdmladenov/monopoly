import { describe, expect, it } from 'vitest';
import { GamePhase, TurnPhase } from '@/lib/game.types';
import { canEndTurn, canRoll, getDoubleTurnHint, getTurnHint } from './turnController';

describe('turn controller', () => {
  it('describes the current turn state', () => {
    expect(getTurnHint(TurnPhase.ROLL_DICE, GamePhase.PLAYING)).toBe('Roll to move.');
    expect(getTurnHint(TurnPhase.ACTION, GamePhase.PLAYING)).toBe('Resolve the landing and then end the turn.');
    expect(getTurnHint(TurnPhase.END_TURN, GamePhase.PLAYING)).toBe('Turn is ready to end.');
    expect(getTurnHint(TurnPhase.MOVE, GamePhase.PLAYING)).toBe('Turn is in progress.');
    expect(getTurnHint(TurnPhase.ROLL_DICE, GamePhase.ENDED)).toBe('Game over.');
  });

  it('guards the available controls', () => {
    expect(canRoll(TurnPhase.ROLL_DICE, GamePhase.PLAYING)).toBe(true);
    expect(canRoll(TurnPhase.ACTION, GamePhase.PLAYING)).toBe(false);
    expect(canRoll(TurnPhase.ROLL_DICE, GamePhase.ENDED)).toBe(false);

    expect(canEndTurn(TurnPhase.END_TURN)).toBe(true);
    expect(canEndTurn(TurnPhase.ACTION)).toBe(false);
  });

  it('describes double turns', () => {
    expect(getDoubleTurnHint(null)).toBeNull();
    expect(getDoubleTurnHint({ die1: 2, die2: 2, total: 4, isDouble: true })).toBe(
      'Doubles rolled: you keep the turn.'
    );
  });
});
