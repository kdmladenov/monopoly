import { AIDifficulty, AIStyle, BoardSquare, Player, SquareType } from '@/lib/game.types';
import { calculatePropertyRent } from '@/lib/utils/rent';

export type AIDecision =
  | { action: 'buy' | 'pass'; confidence: number }
  | { action: 'build'; propertyPosition: number; confidence: number }
  | { action: 'sell'; propertyPosition: number; confidence: number }
  | { action: 'mortgage'; propertyPosition: number; confidence: number }
  | { action: 'unmortgage'; propertyPosition: number; confidence: number };

export class AIAdvisor {
  decidePurchase(player: Player, square: BoardSquare, board: BoardSquare[]): AIDecision {
    if (square.type !== SquareType.PROPERTY || !square.property || square.property.ownerId) {
      return { action: 'pass', confidence: 0.2 };
    }

    const property = square.property;
    const rent = calculatePropertyRent(property, board);
    const affordabilityRatio = player.money / property.price;
    const style = this.getAIStyle(player);
    const reserve = this.getCashReserve(style);

    if (player.money - property.price < reserve) {
      return { action: 'pass', confidence: 0.7 };
    }

    if (style === AIStyle.CAUTIOUS) {
      return affordabilityRatio > 2
        ? { action: 'buy', confidence: 0.55 }
        : { action: 'pass', confidence: 0.65 };
    }

    if (style === AIStyle.BALANCED) {
      return rent >= property.price * 0.2 || affordabilityRatio > 1.5
        ? { action: 'buy', confidence: 0.7 }
        : { action: 'pass', confidence: 0.6 };
    }

    return rent >= property.price * 0.15 || affordabilityRatio > 1.2
      ? { action: 'buy', confidence: 0.85 }
      : { action: 'pass', confidence: 0.65 };
  }

  decideBuilding(player: Player, board: BoardSquare[]): AIDecision | null {
    const ownedProperties = board.filter(
      (square) => square.type === SquareType.PROPERTY && square.property?.ownerId === player.id
    );

    const candidate = ownedProperties.find((square) => {
      const property = square.property!;
      if (property.houses >= 5 || player.money < property.housePrice) {
        return false;
      }

      const sameColorProperties = board.filter(
        (item) => item.type === SquareType.PROPERTY && item.property?.color === property.color
      );

      return (
        sameColorProperties.length > 0 &&
        sameColorProperties.every((item) => item.property?.ownerId === player.id) &&
        property.houses <= Math.min(...sameColorProperties.map((item) => item.property?.houses ?? 0))
      );
    });

    if (!candidate?.property) {
      return null;
    }

    return {
      action: 'build',
      propertyPosition: candidate.position,
      confidence: this.getAIStyle(player) === AIStyle.AGGRESSIVE ? 0.9 : 0.7,
    };
  }

  decideEmergencyMove(player: Player, board: BoardSquare[]): AIDecision | null {
    const ownedProperties = board.filter(
      (square) => square.type === SquareType.PROPERTY && square.property?.ownerId === player.id
    );

    const sellCandidate = ownedProperties.find((square) => {
      const property = square.property;
      return Boolean(property && property.houses > 0);
    });

    if (sellCandidate?.property) {
      return {
        action: 'sell',
        propertyPosition: sellCandidate.position,
        confidence: 0.75,
      };
    }

    const mortgageCandidate = ownedProperties.find((square) => square.property && !square.property.isMortgaged);
    if (!mortgageCandidate?.property) {
      return null;
    }

    if (player.money >= mortgageCandidate.property.mortgageValue) {
      return {
        action: 'mortgage',
        propertyPosition: mortgageCandidate.position,
        confidence: 0.6,
      };
    }

    return null;
  }

  decidePropertyAction(player: Player, board: BoardSquare[]): AIDecision | null {
    const buildDecision = this.decideBuilding(player, board);
    const emergencyDecision = this.decideEmergencyMove(player, board);

    if (buildDecision && emergencyDecision) {
      const style = this.getAIStyle(player);

      if (buildDecision.action === 'build') {
        const buildCost = this.getBuildCost(player, board, buildDecision.propertyPosition);
        const reserve = this.getCashReserve(style);
        if (buildCost !== null && player.money - buildCost < reserve) {
          return emergencyDecision;
        }
      }

      if (style === AIStyle.CAUTIOUS) {
        return emergencyDecision;
      }

      return buildDecision;
    }

    return buildDecision ?? emergencyDecision;
  }

  private getBuildCost(player: Player, board: BoardSquare[], propertyPosition: number): number | null {
    const square = board.find((item) => item.position === propertyPosition);
    const property = square?.property;

    if (!property || property.ownerId !== player.id) {
      return null;
    }

    return property.housePrice;
  }

  private getCashReserve(style?: AIStyle): number {
    switch (style) {
      case AIStyle.CAUTIOUS:
        return 3000;
      case AIStyle.BALANCED:
        return 2000;
      case AIStyle.AGGRESSIVE:
      default:
        return 1000;
    }
  }

  private getAIStyle(player: Player): AIStyle {
    if (player.aiStyle) {
      return player.aiStyle;
    }

    switch (player.aiDifficulty) {
      case AIDifficulty.BEGINNER:
        return AIStyle.CAUTIOUS;
      case AIDifficulty.INTERMEDIATE:
        return AIStyle.BALANCED;
      case AIDifficulty.ADVANCED:
      default:
        return AIStyle.AGGRESSIVE;
    }
  }
}
