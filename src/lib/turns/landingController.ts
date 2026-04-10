import {
  BoardSquare,
  LandingEffectPayload,
  Player,
  SquareType,
} from '@/lib/game.types';
import { calculatePropertyRent, calculateTransportationRent } from '@/lib/utils/rent';

export type LandingIntent =
  | { kind: 'none' }
| {
    kind: 'buy-property';
    propertyPosition: number;
    propertyPrice: number;
    propertyName: string;
    message: string;
  }
  | { kind: 'pay-rent'; toPlayerId: string; amount: number; message: string }
  | { kind: 'special'; effect: LandingEffectPayload; message: string };

export function getLandingIntent(
  square: BoardSquare | undefined,
  board: BoardSquare[],
  currentPlayer: Player
): LandingIntent {
  if (!square) {
    return { kind: 'none' };
  }

  if (square.type === SquareType.SPECIAL && square.special) {
    const special = square.special;
    switch (special.type) {
      case 'start':
        return {
          kind: 'special',
          effect: { playerId: currentPlayer.id, effect: 'start' },
          message: `${currentPlayer.name} collected a passing bonus.`,
        };
      case 'tax':
        return {
          kind: 'special',
          effect: {
            playerId: currentPlayer.id,
            effect: 'tax',
            amount: special.amount,
          },
          message: `${currentPlayer.name} paid tax.`,
        };
      case 'goToJail':
        return {
          kind: 'special',
          effect: {
            playerId: currentPlayer.id,
            effect: 'goToJail',
            jailPosition: board.findIndex((item) => item.special?.type === 'jail'),
          },
          message: `${currentPlayer.name} was sent to jail.`,
        };
      case 'casino':
        {
          const win = Math.random() > 0.5;
          return {
            kind: 'special',
            effect: {
              playerId: currentPlayer.id,
              effect: win ? 'casinoWin' : 'casinoLoss',
              amount: win ? 2000 : 1500,
            },
            message: `${currentPlayer.name} visited the casino.`,
          };
        }
      case 'lottery':
        {
          const win = Math.random() > 0.6;
          return {
            kind: 'special',
            effect: {
              playerId: currentPlayer.id,
              effect: win ? 'lotteryWin' : 'lotteryLoss',
              amount: win ? 3500 : 500,
            },
            message: `${currentPlayer.name} tried their luck in the lottery.`,
          };
        }
      default:
        return { kind: 'none' };
    }
  }

  if (square.type === SquareType.TRANSPORTATION && square.transportation) {
    const transportation = square.transportation;
    if (transportation.ownerId && transportation.ownerId !== currentPlayer.id) {
      const amount = calculateTransportationRent(transportation, board, transportation.ownerId);
      return {
        kind: 'pay-rent',
        toPlayerId: transportation.ownerId,
        amount,
        message: `${currentPlayer.name} paid route rent of ¤${amount}.`,
      };
    }
    return { kind: 'none' };
  }

  if (square.type === SquareType.PROPERTY && square.property) {
    const property = square.property;
    if (property.ownerId && property.ownerId !== currentPlayer.id) {
      const amount = calculatePropertyRent(property, board);
      return {
        kind: 'pay-rent',
        toPlayerId: property.ownerId,
        amount,
        message: `${currentPlayer.name} paid ¤${amount} rent to ${property.ownerId}.`,
      };
    }

    return {
      kind: 'buy-property',
      propertyPosition: square.position,
      propertyPrice: property.price,
      propertyName: property.name,
      message: `${currentPlayer.name} bought ${property.name}.`,
    };
  }

  return { kind: 'none' };
}
