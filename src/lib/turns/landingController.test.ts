import { describe, expect, it, vi } from 'vitest';
import { getLandingIntent } from './landingController';
import { BoardSquare, ContinentId, Player, PlayerType, SquareType } from '@/lib/game.types';
import { BoardGenerator } from '@/lib/services/BoardGenerator';

const player: Player = {
  id: 'player_1',
  name: 'Player 1',
  type: PlayerType.HUMAN,
  avatar: 'lion',
  color: '#f97316',
  money: 10000,
  position: 0,
  isInJail: false,
  jailTurns: 0,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 0,
};

describe('landing controller', () => {
  const board = new BoardGenerator().generateBoard(ContinentId.EUROPE);

  it('returns a buy intent for unowned properties', () => {
    const square = board.find((item) => item.type === SquareType.PROPERTY && item.property?.ownerId === null);
    const intent = getLandingIntent(square, board, player);

    expect(intent.kind).toBe('buy-property');
  });

  it('returns a rent intent for owned properties', () => {
    const square = board.find((item) => item.type === SquareType.PROPERTY && item.property?.ownerId === null);
    if (!square || !square.property) {
      throw new Error('No property square available');
    }
    const ownedSquare: BoardSquare = {
      ...square,
      property: { ...square.property, ownerId: 'owner-1' },
    };

    const intent = getLandingIntent(ownedSquare, board, player);

    expect(intent.kind).toBe('pay-rent');
  });

  it('returns a special intent for tax squares', () => {
    const taxSquare = board.find((item) => item.special?.type === 'tax');
    const intent = getLandingIntent(taxSquare, board, player);

    expect(intent.kind).toBe('special');
    if (intent.kind === 'special') {
      expect(intent.effect.effect).toBe('tax');
    }
  });

  it('returns deterministic special intents for casino and lottery when random is controlled', () => {
    const casinoSquare = board.find((item) => item.special?.type === 'casino');
    const lotterySquare = board.find((item) => item.special?.type === 'lottery');

    const randomSpy = vi.spyOn(Math, 'random');

    randomSpy.mockReturnValueOnce(0.9);
    const casinoIntent = getLandingIntent(casinoSquare, board, player);
    expect(casinoIntent.kind).toBe('special');
    if (casinoIntent.kind === 'special') {
      expect(casinoIntent.effect.effect).toBe('casinoWin');
      expect(casinoIntent.effect.amount).toBe(2000);
    }

    randomSpy.mockReturnValueOnce(0.1);
    const lotteryIntent = getLandingIntent(lotterySquare, board, player);
    expect(lotteryIntent.kind).toBe('special');
    if (lotteryIntent.kind === 'special') {
      expect(lotteryIntent.effect.effect).toBe('lotteryLoss');
      expect(lotteryIntent.effect.amount).toBe(500);
    }

    randomSpy.mockRestore();
  });
});
