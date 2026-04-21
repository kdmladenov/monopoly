import { BoardSquare, GameState, Player, SquareType } from '../game.types';
import { PERSONALITY_CONFIGS, PersonalityConfig } from './BotPersonalityConfigs';

export class MortgageStrategy {
  selectPropertiesToMortgage(
    amountNeeded: number,
    player: Player,
    gameState: GameState
  ): BoardSquare[] {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || AIStyle.BALANCED];
    
    // Filter properties owned by player that are not mortgaged and have no houses
    const eligible = gameState.board.filter(s => {
      const prop = s.property || s.transportation;
      return prop && 
             prop.ownerId === player.id && 
             !prop.isMortgaged && 
             (!s.property || s.property.houses === 0);
    });

    // Rank properties (lower score = mortgage first)
    const ranked = [...eligible].sort((a, b) => {
      return this.calculateMortgageResistance(a, player, gameState) - 
             this.calculateMortgageResistance(b, player, gameState);
    });

    const toMortgage: BoardSquare[] = [];
    let raised = 0;

    for (const square of ranked) {
      if (raised >= amountNeeded) break;
      const val = square.property?.mortgageValue || square.transportation?.mortgageValue || 0;
      toMortgage.push(square);
      raised += val;
    }

    return toMortgage;
  }

  shouldUnmortgageProperty(
    square: BoardSquare,
    player: Player,
    gameState: GameState
  ): boolean {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || 'balanced'];
    const prop = square.property || square.transportation;
    if (!prop || !prop.isMortgaged) return false;

    const unmortgageCost = Math.ceil(prop.mortgageValue * 1.1);
    
    // Check affordance
    if (player.money - unmortgageCost < personality.minCashReserve) {
      return false;
    }

    // Strategic value
    const value = this.calculateUnmortgageValue(square, player, gameState);
    const threshold = 100 - (personality.unmortgagePriority * 50);

    return value > threshold;
  }

  private calculateMortgageResistance(square: BoardSquare, player: Player, gameState: GameState): number {
    let score = 0;
    const prop = square.property || square.transportation!;

    // Monopoly status
    if (this.isPartOfMonopoly(square, player, gameState)) {
      score += 1000;
    }

    // Near monopoly
    const groupCount = this.countInGroup(square, player, gameState);
    score += groupCount * 200;

    // Price weight
    score += prop.price * 0.5;

    return score;
  }

  private calculateUnmortgageValue(square: BoardSquare, player: Player, gameState: GameState): number {
    let value = 0;
    const prop = square.property || square.transportation!;

    if (this.unmortgageCompletesMonopoly(square, player, gameState)) {
      value += 500;
    }

    value += prop.price * 0.2;
    return value;
  }

  private isPartOfMonopoly(square: BoardSquare, player: Player, gameState: GameState): boolean {
    if (square.type !== SquareType.PROPERTY || !square.property?.color) return false;
    const color = square.property.color;
    const group = gameState.board.filter(s => s.property?.color === color);
    return group.every(s => s.property?.ownerId === player.id);
  }

  private countInGroup(square: BoardSquare, player: Player, gameState: GameState): number {
    if (square.type === SquareType.PROPERTY && square.property?.color) {
      return gameState.board.filter(s => s.property?.color === square.property!.color && s.property.ownerId === player.id).length;
    }
    if (square.type === SquareType.TRANSPORTATION) {
      return gameState.board.filter(s => s.type === SquareType.TRANSPORTATION && s.transportation?.ownerId === player.id).length;
    }
    return 0;
  }

  private unmortgageCompletesMonopoly(square: BoardSquare, player: Player, gameState: GameState): boolean {
     // If we unmortgage this, does it restore a complete active monopoly?
     return this.isPartOfMonopoly(square, player, gameState);
  }
}
