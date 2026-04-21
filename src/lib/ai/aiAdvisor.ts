import { AIDifficulty, AIStyle, BoardSquare, Player, SquareType } from '@/lib/game.types';
import { BotDecisionMaker } from './BotDecisionMaker';
import { BuildingStrategy } from './BuildingStrategy';

export type AIDecision =
  | { action: 'buy' | 'pass'; confidence: number }
  | { action: 'build'; propertyPosition: number; confidence: number }
  | { action: 'sell'; propertyPosition: number; confidence: number }
  | { action: 'mortgage'; propertyPosition: number; confidence: number }
  | { action: 'unmortgage'; propertyPosition: number; confidence: number };

export class AIAdvisor {
  private decisionMaker: BotDecisionMaker;
  private buildingStrategy: BuildingStrategy;

  constructor() {
    this.decisionMaker = new BotDecisionMaker();
    this.buildingStrategy = new BuildingStrategy();
  }

  decidePurchase(player: Player, square: BoardSquare, board: BoardSquare[]): AIDecision {
    // Mock gameState for legacy support in advisor
    const gameState: any = { board, players: [player] }; 
    const shouldBuy = this.decisionMaker.shouldBuyProperty(square, player, gameState);
    
    return {
      action: shouldBuy ? 'buy' : 'pass',
      confidence: shouldBuy ? 0.9 : 0.6
    };
  }

  decideBuilding(player: Player, board: BoardSquare[]): AIDecision | null {
    const gameState: any = { board, players: [player] };
    const actions = this.buildingStrategy.selectBuildingActions(player, gameState);
    
    const buildAction = actions.find(a => a.type === 'build');
    if (!buildAction) return null;

    return {
      action: 'build',
      propertyPosition: buildAction.propertyPosition,
      confidence: 0.8
    };
  }

  decideEmergencyMove(player: Player, board: BoardSquare[]): AIDecision | null {
    // Basic emergency logic: sell houses first, then mortgage
    const owned = board.filter(s => s.property?.ownerId === player.id);
    
    const sellCandidate = owned.find(s => (s.property?.houses ?? 0) > 0);
    if (sellCandidate) {
      return { action: 'sell', propertyPosition: sellCandidate.position, confidence: 0.9 };
    }

    const mortgageCandidate = owned.find(s => s.property && !s.property.isMortgaged);
    if (mortgageCandidate) {
      return { action: 'mortgage', propertyPosition: mortgageCandidate.position, confidence: 0.8 };
    }

    return null;
  }

  decidePropertyAction(player: Player, board: BoardSquare[]): AIDecision | null {
    const buildDecision = this.decideBuilding(player, board);
    if (buildDecision) return buildDecision;

    // Only unmortgage if we have lots of cash
    const mortgageCandidate = board.find(s => s.property?.ownerId === player.id && s.property.isMortgaged);
    if (mortgageCandidate && player.money > 10000) {
       return { action: 'unmortgage', propertyPosition: mortgageCandidate.position, confidence: 0.5 };
    }

    return null;
  }
}
