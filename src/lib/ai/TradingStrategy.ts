import { AIStyle, BoardSquare, Player, SquareType } from '../game.types';
import { PERSONALITY_CONFIGS, PersonalityConfig } from './BotPersonalityConfigs';
import { PropertyEvaluator } from './PropertyEvaluator';

export interface TradeOffer {
  from: string;
  to: string;
  offering: { money: number; propertyIds: string[] };
  requesting: { money: number; propertyIds: string[] };
}

export class TradingStrategy {
  private evaluator: PropertyEvaluator;

  constructor() {
    this.evaluator = new PropertyEvaluator();
  }

  evaluateTrade(offer: TradeOffer, player: Player, gameState: GameState): { accept: boolean; reason: string } {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || AIStyle.BALANCED];
    
    // Calculate value of what we're giving
    let givingValue = offer.requesting.money;
    offer.requesting.propertyIds.forEach(id => {
      const square = gameState.board.find(s => s.property?.id === id || s.transportation?.name === id);
      if (square) {
        givingValue += this.evaluator.calculatePropertyValue(square, player, gameState, personality);
      }
    });

    // Calculate value of what we're receiving
    let receivingValue = offer.offering.money;
    offer.offering.propertyIds.forEach(id => {
      const square = gameState.board.find(s => s.property?.id === id || s.transportation?.name === id);
      if (square) {
        receivingValue += this.evaluator.calculatePropertyValue(square, player, gameState, personality);
      }
    });

    const ratio = receivingValue / (givingValue || 1);
    const threshold = personality.tradeValueMultiplier;

    if (ratio >= threshold) {
      return { accept: true, reason: 'Favorable trade value' };
    }

    return { accept: false, reason: 'Insufficient value' };
  }

  // Simple proposal logic: check if we can complete a monopoly
  proposeTrade(player: Player, gameState: GameState): TradeOffer | null {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || 'balanced'];
    if (Math.random() > personality.tradeWillingness) return null;

    // Logic to find a needed property and construct an offer
    // This is simplified for current implementation
    return null; 
  }
}
