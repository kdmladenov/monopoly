import { BoardSquare, GameState, Player, SquareType } from '../game.types';
import { PERSONALITY_CONFIGS, PersonalityConfig } from './BotPersonalityConfigs';
import { PropertyEvaluator } from './PropertyEvaluator';

export class BotDecisionMaker {
  private evaluator: PropertyEvaluator;

  constructor() {
    this.evaluator = new PropertyEvaluator();
  }

  shouldBuyProperty(
    square: BoardSquare,
    player: Player,
    gameState: GameState
  ): boolean {
    const personality = this.getPersonality(player);
    const details = square.property || square.transportation;
    if (!details) return false;

    // Check affordance
    const cashAfter = player.money - details.price;
    if (cashAfter < personality.minCashReserve) return false;

    // Evaluate value
    const propertyValue = this.evaluator.calculatePropertyValue(square, player, gameState, personality);
    const valueRatio = propertyValue / details.price;

    if (valueRatio < personality.propertyBuyThreshold) return false;

    // Consider game phase
    const phase = this.getGamePhase(gameState);
    if (phase === 'EARLY') return true;
    if (phase === 'MID') return valueRatio >= 1.0;
    return valueRatio >= 1.3;
  }

  calculateAuctionBid(
    square: BoardSquare,
    currentBid: number,
    player: Player,
    gameState: GameState
  ): number | null {
    const personality = this.getPersonality(player);
    const details = square.property || square.transportation;
    if (!details) return null;

    const propertyValue = this.evaluator.calculatePropertyValue(square, player, gameState, personality);
    const maxBid = Math.floor(propertyValue * personality.auctionMaxBidRatio);
    
    const availableCash = player.money - personality.minCashReserve;
    const affordableMax = Math.min(maxBid, availableCash);

    if (currentBid >= affordableMax) return null;

    // Typical increment logic
    const increment = this.calculateBidIncrement(currentBid, affordableMax, personality);
    const newBid = currentBid + increment;

    return newBid <= affordableMax ? newBid : null;
  }

  private calculateBidIncrement(current: number, max: number, personality: PersonalityConfig): number {
    const room = max - current;
    if (personality.riskTolerance > 0.7) {
      return Math.min(Math.floor(room * 0.3), 500) || 100;
    }
    if (personality.riskTolerance < 0.4) {
      return 100;
    }
    return Math.floor(room * 0.15) || 100;
  }

  private getGamePhase(gameState: GameState): 'EARLY' | 'MID' | 'LATE' {
    const total = gameState.board.filter(s => s.type !== SquareType.SPECIAL).length;
    const owned = gameState.players.reduce((sum, p) => sum + p.ownedProperties.length, 0);
    const ratio = owned / total;

    if (ratio < 0.5) return 'EARLY';
    if (ratio < 0.85) return 'MID';
    return 'LATE';
  }

  private getPersonality(player: Player): PersonalityConfig {
    return PERSONALITY_CONFIGS[player.aiStyle || 'balanced'];
  }
}
