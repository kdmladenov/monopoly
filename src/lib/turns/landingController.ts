import {
  BoardSquare,
  LandingEffectPayload,
  Player,
  SquareType,
} from '@/lib/game.types';
import { calculatePropertyRent, calculateTransportationRent } from '@/lib/utils/rent';
import { getRandomLottery } from '@/lib/utils/lottery';

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
          effect: { playerId: currentPlayer.id, effect: 'none' },
          message: `${currentPlayer.name} is at Start.`,
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
      case 'lottery':
      case 'casino':
        {
          const option = getRandomLottery();
          const effectType = option.amount >= 0 ? 
            (special.type === 'lottery' ? 'lotteryWin' : 'casinoWin') : 
            (special.type === 'lottery' ? 'lotteryLoss' : 'casinoLoss');
          
          return {
            kind: 'special',
            effect: {
              playerId: currentPlayer.id,
              effect: effectType,
              amount: Math.abs(option.amount),
            },
            message: `${currentPlayer.name}: ${option.message} (${option.amount >= 0 ? '+' : ''}${option.amount}¤)`,
          };
        }
      case 'freeParking':
      case 'jail':
        return {
          kind: 'special',
          effect: { playerId: currentPlayer.id, effect: 'none' },
          message: `${currentPlayer.name} is visiting ${special.name}.`,
        };
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
    if (!transportation.ownerId) {
      return {
        kind: 'buy-property',
        propertyPosition: square.position,
        propertyPrice: transportation.price,
        propertyName: transportation.name,
        message: `${currentPlayer.name} landed on ${transportation.name}.`,
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

    if (!property.ownerId) {
      return {
        kind: 'buy-property',
        propertyPosition: square.position,
        propertyPrice: property.price,
        propertyName: property.name,
        message: `${currentPlayer.name} landed on ${property.name}.`,
      };
    }
  }

  return { kind: 'none' };
}
