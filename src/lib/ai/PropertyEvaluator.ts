import { BoardSquare, GameState, Player, PropertyDetails, SquareType } from '../game.types';
import { PersonalityConfig } from './BotPersonalityConfigs';

export class PropertyEvaluator {
  calculatePropertyValue(
    square: BoardSquare,
    player: Player,
    gameState: GameState,
    personality: PersonalityConfig
  ): number {
    if (!square.property && !square.transportation) return 0;

    let value = 0;
    const details = square.property || square.transportation!;
    const price = details.price;

    // Base value: purchase price
    value += price;

    if (square.type === SquareType.PROPERTY && square.property) {
      // Monopoly completion and blocking value
      value += this.getMonopolyCompletionValue(square.property, player, gameState);
      value += this.getMonopolyBlockingValue(square.property, player, gameState);
      
      // ROI value (expected rent income)
      value += this.getROIValue(square.property, gameState);
    } else if (square.type === SquareType.TRANSPORTATION && square.transportation) {
      // Strategic value (railroads)
      value += this.getStrategicValue(square, player, gameState);
    }

    // Apply personality modifiers based on price range
    if (price < 1500) {
      value *= 1 + (personality.riskTolerance * 0.2);
    } else if (price > 4000) {
      value *= 1 + ((1 - personality.riskTolerance) * 0.2);
    }

    return value;
  }

  private getMonopolyCompletionValue(
    property: PropertyDetails,
    player: Player,
    gameState: GameState
  ): number {
    const color = property.color;
    if (!color) return 0;

    const group = gameState.board.filter(
      s => s.type === SquareType.PROPERTY && s.property?.color === color
    );
    const totalInGroup = group.length;
    const ownedByPlayer = group.filter(s => s.property?.ownerId === player.id).length;

    if (ownedByPlayer === totalInGroup - 1) {
      return property.price * 2.5; // Huge value if completes monopoly
    } else if (ownedByPlayer === totalInGroup - 2 && totalInGroup >= 3) {
      return property.price * 1.2;
    } else if (ownedByPlayer > 0) {
      return property.price * 0.5;
    }

    return 0;
  }

  private getMonopolyBlockingValue(
    property: PropertyDetails,
    player: Player,
    gameState: GameState
  ): number {
    let blockingValue = 0;
    const color = property.color;
    if (!color) return 0;

    const group = gameState.board.filter(
      s => s.type === SquareType.PROPERTY && s.property?.color === color
    );
    const totalInGroup = group.length;

    for (const opponent of gameState.players) {
      if (opponent.id === player.id) continue;

      const ownedByOpponent = group.filter(s => s.property?.ownerId === opponent.id).length;
      if (ownedByOpponent === totalInGroup - 1) {
        blockingValue += property.price * 1.5;
      }
    }

    return blockingValue;
  }

  private getROIValue(property: PropertyDetails, gameState: GameState): number {
    // Basic ROI calculation based on base rent
    const expectedTurns = 25;
    const baseRent = property.rentStructure.base;
    const expectedReturn = baseRent * (gameState.players.length - 1) * expectedTurns;
    return expectedReturn * 0.3;
  }

  private getStrategicValue(
    square: BoardSquare,
    player: Player,
    gameState: GameState
  ): number {
    if (square.type === SquareType.TRANSPORTATION && square.transportation) {
      const ownedRailroads = gameState.board.filter(
        s => s.type === SquareType.TRANSPORTATION && s.transportation?.ownerId === player.id
      ).length;
      return square.transportation.price * (0.2 * ownedRailroads);
    }
    return 0;
  }
}
