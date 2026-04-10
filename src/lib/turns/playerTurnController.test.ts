import { describe, expect, it } from 'vitest';
import { GamePhase, Player, PlayerType } from '@/lib/game.types';
import {
  canDeclareBankruptcy,
  getPlayerStatus,
  getPlayerTurnHint,
  shouldSkipMovement,
} from './playerTurnController';

const player: Player = {
  id: 'player_1',
  name: 'Player 1',
  type: PlayerType.HUMAN,
  avatar: 'lion',
  color: '#f97316',
  money: 0,
  position: 0,
  isInJail: true,
  jailTurns: 2,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 0,
};

describe('player turn controller', () => {
  it('detects jailed players who should skip movement', () => {
    expect(shouldSkipMovement(player, GamePhase.PLAYING)).toBe(true);
    expect(shouldSkipMovement({ ...player, isInJail: false }, GamePhase.PLAYING)).toBe(false);
    expect(shouldSkipMovement(player, GamePhase.ENDED)).toBe(false);
  });

  it('allows bankruptcy only in play for broke non-bankrupt players', () => {
    expect(canDeclareBankruptcy(player, GamePhase.PLAYING)).toBe(true);
    expect(canDeclareBankruptcy({ ...player, money: 100 }, GamePhase.PLAYING)).toBe(false);
    expect(canDeclareBankruptcy({ ...player, isBankrupt: true }, GamePhase.PLAYING)).toBe(false);
    expect(canDeclareBankruptcy(player, GamePhase.ENDED)).toBe(false);
  });

  it('describes the player status', () => {
    expect(getPlayerStatus(undefined)).toBe('No active player.');
    expect(getPlayerStatus({ ...player, isBankrupt: true, isInJail: false })).toBe('Player 1 is bankrupt.');
    expect(getPlayerStatus(player)).toBe('Player 1 is in jail for 2 more turns.');
    expect(getPlayerStatus({ ...player, isInJail: false, money: 1200 })).toBe('Player 1 is ready to roll.');
  });

  it('describes player turn hints', () => {
    expect(getPlayerTurnHint(undefined)).toBeNull();
    expect(getPlayerTurnHint({ ...player, isInJail: true })).toBe(
      'Jail status active: roll to reduce the timer.'
    );
    expect(getPlayerTurnHint({ ...player, consecutiveDoubles: 2, isInJail: false })).toBe(
      'Doubles streak: 2/3.'
    );
    expect(getPlayerTurnHint({ ...player, consecutiveDoubles: 0, isInJail: false })).toBeNull();
  });
});
