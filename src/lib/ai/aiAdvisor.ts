import { AIDifficulty, AIStyle, BoardSquare, Player, SquareType } from '@/lib/game.types';
import { BotDecisionMaker } from './BotDecisionMaker';
import { BuildingStrategy } from './BuildingStrategy';
import { MortgageStrategy } from './MortgageStrategy';
import { JailStrategy } from './JailStrategy';
import { BankruptcyHandler, SurvivalAction } from './BankruptcyHandler';
import { TradingStrategy, TradeOffer } from './TradingStrategy';

export type AIDecision =
  | { action: 'buy' | 'pass'; confidence: number }
  | { action: 'build'; propertyPosition: number; confidence: number }
  | { action: 'sell'; propertyPosition: number; confidence: number }
  | { action: 'mortgage'; propertyPosition: number; confidence: number }
  | { action: 'unmortgage'; propertyPosition: number; confidence: number }
  | { action: 'pay_jail_fine' | 'roll_jail'; confidence: number }
  | { action: 'accept_trade' | 'reject_trade'; reason: string };

export class AIAdvisor {
  private decisionMaker: BotDecisionMaker;
  private buildingStrategy: BuildingStrategy;
  private mortgageStrategy: MortgageStrategy;
  private jailStrategy: JailStrategy;
  private bankruptcyHandler: BankruptcyHandler;
  private tradingStrategy: TradingStrategy;

  constructor() {
    this.decisionMaker = new BotDecisionMaker();
    this.buildingStrategy = new BuildingStrategy();
    this.mortgageStrategy = new MortgageStrategy();
    this.jailStrategy = new JailStrategy();
    this.bankruptcyHandler = new BankruptcyHandler();
    this.tradingStrategy = new TradingStrategy();
  }

  decidePurchase(player: Player, square: BoardSquare, board: BoardSquare[]): AIDecision {
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

  decideJail(player: Player, board: BoardSquare[]): AIDecision {
    const gameState: any = { board, players: [player] };
    const shouldPay = this.jailStrategy.shouldPayJailFine(player, gameState);
    return {
      action: shouldPay ? 'pay_jail_fine' : 'roll_jail',
      confidence: 0.8
    };
  }

  decideTrade(offer: TradeOffer, player: Player, board: BoardSquare[]): AIDecision {
    const gameState: any = { board, players: [player] };
    const result = this.tradingStrategy.evaluateTrade(offer, player, gameState);
    return {
      action: result.accept ? 'accept_trade' : 'reject_trade',
      reason: result.reason,
      confidence: 0.9
    };
  }

  decideSurvival(debt: number, player: Player, board: BoardSquare[]): SurvivalAction[] {
    const gameState: any = { board, players: [player] };
    const result = this.bankruptcyHandler.createSurvivalPlan(debt, player, gameState);
    return result.canSurvive ? result.actions : [];
  }

  decidePropertyAction(player: Player, board: BoardSquare[]): AIDecision | null {
    const buildDecision = this.decideBuilding(player, board);
    if (buildDecision) return buildDecision;

    // Check for unmortgage opportunities
    const gameState: any = { board, players: [player] };
    const mortgaged = board.find(s => {
      const p = s.property || s.transportation;
      return p?.ownerId === player.id && p.isMortgaged && this.mortgageStrategy.shouldUnmortgageProperty(s, player, gameState);
    });

    if (mortgaged) {
      return { action: 'unmortgage', propertyPosition: mortgaged.position, confidence: 0.7 };
    }

    return null;
  }

  decideEmergencyMove(player: Player, board: BoardSquare[]): AIDecision | null {
     // This is usually called when money is low. Handled by decideSurvival in newer logic,
     // but kept for compatibility.
     const plan = this.decideSurvival(0, player, board); // Raising 0 just finds candidates? No.
     // For legacy compatibility, simple candidate search:
     const owned = board.filter(s => s.property?.ownerId === player.id);
     const sellCandidate = owned.find(s => (s.property?.houses ?? 0) > 0);
     if (sellCandidate) return { action: 'sell', propertyPosition: sellCandidate.position, confidence: 0.9 };
     
     const mortgageCandidate = owned.find(s => s.property && !s.property.isMortgaged);
     if (mortgageCandidate) return { action: 'mortgage', propertyPosition: mortgageCandidate.position, confidence: 0.8 };

     return null;
  }
}
