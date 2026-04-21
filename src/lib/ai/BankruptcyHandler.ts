import { BoardSquare, GameState, Player } from '../game.types';
import { BuildingStrategy } from './BuildingStrategy';
import { MortgageStrategy } from './MortgageStrategy';

export interface SurvivalAction {
  type: 'sell_house' | 'mortgage';
  propertyPosition: number;
}

export class BankruptcyHandler {
  private mortgageStrategy: MortgageStrategy;
  private buildingStrategy: BuildingStrategy;

  constructor() {
    this.mortgageStrategy = new MortgageStrategy();
    this.buildingStrategy = new BuildingStrategy();
  }

  createSurvivalPlan(debt: number, player: Player, gameState: GameState): { canSurvive: boolean, actions: SurvivalAction[] } {
    let raised = player.money;
    const actions: SurvivalAction[] = [];

    if (raised >= debt) return { canSurvive: true, actions: [] };

    // 1. Sell houses
    // Work on a deep copy of properties for planning to avoid state mutation
    const planningBoard = JSON.parse(JSON.stringify(gameState.board)) as BoardSquare[];
    const ownedWithHouses = planningBoard.filter(s => s.property?.ownerId === player.id && s.property.houses > 0);
    
    const sortedForSelling = [...ownedWithHouses].sort((a, b) => b.property!.houses - a.property!.houses);

    for (const square of sortedForSelling) {
      if (raised >= debt) break;
      const prop = square.property!;
      while (prop.houses > 0 && raised < debt) {
        actions.push({ type: 'sell_house', propertyPosition: square.position });
        raised += Math.floor(prop.housePrice / 2);
        prop.houses--; // Temp modify for loop
      }
    }

    if (raised >= debt) return { canSurvive: true, actions };

    // 2. Mortgage properties
    const mortgageable = this.mortgageStrategy.selectPropertiesToMortgage(debt - raised, player, gameState);
    for (const square of mortgageable) {
      if (raised >= debt) break;
      const val = square.property?.mortgageValue || square.transportation?.mortgageValue || 0;
      actions.push({ type: 'mortgage', propertyPosition: square.position });
      raised += val;
    }

    return {
      canSurvive: raised >= debt,
      actions: raised >= debt ? actions : []
    };
  }
}
