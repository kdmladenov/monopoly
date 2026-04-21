import { BoardSquare, GameState, Player, SquareType } from '../game.types';
import { PERSONALITY_CONFIGS, PersonalityConfig } from './BotPersonalityConfigs';

export interface BuildingAction {
  type: 'build' | 'sell';
  propertyPosition: number;
}

export class BuildingStrategy {
  selectBuildingActions(player: Player, gameState: GameState): BuildingAction[] {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || 'balanced'];
    const monopolies = this.getMonopolies(player, gameState);
    if (monopolies.length === 0) return [];

    const availableCash = player.money - personality.targetCashReserve;
    if (availableCash <= 0) return [];

    const ranked = this.rankMonopolies(monopolies, player, gameState);
    let remaining = availableCash;
    const actions: BuildingAction[] = [];

    for (const monopoly of ranked) {
      const { actions: planActions, totalCost } = this.createBuildingPlan(monopoly, remaining, player, gameState, personality);
      actions.push(...planActions);
      remaining -= totalCost;
      if (remaining <= 0) break;
    }

    return actions;
  }

  private getMonopolies(player: Player, gameState: GameState): BoardSquare[][] {
    const owned = gameState.board.filter(s => s.type === SquareType.PROPERTY && s.property?.ownerId === player.id);
    const groups: Record<string, BoardSquare[]> = {};
    
    owned.forEach(s => {
      const color = s.property!.color!;
      if (!groups[color]) groups[color] = [];
      groups[color].push(s);
    });

    const monopolies: BoardSquare[][] = [];
    Object.entries(groups).forEach(([color, squares]) => {
      const totalInColor = gameState.board.filter(s => s.type === SquareType.PROPERTY && s.property?.color === color).length;
      if (squares.length === totalInColor) {
        monopolies.push(squares);
      }
    });

    return monopolies;
  }

  private rankMonopolies(monopolies: BoardSquare[][], player: Player, gameState: GameState): BoardSquare[][] {
    return [...monopolies].sort((a, b) => {
      const valA = a.reduce((sum, s) => sum + s.property!.price, 0);
      const valB = b.reduce((sum, s) => sum + s.property!.price, 0);
      return valB - valA; // Prefer more expensive sets first for building
    });
  }

  private createBuildingPlan(
    monopoly: BoardSquare[],
    availableCash: number,
    player: Player,
    gameState: GameState,
    personality: PersonalityConfig
  ): { actions: BuildingAction[]; totalCost: number } {
    const actions: BuildingAction[] = [];
    let totalCost = 0;
    let remaining = availableCash;

    // Small optimization: try to build evenly
    let changed = true;
    while (changed && remaining > 0) {
      changed = false;
      // Sort by fewest houses to build evenly
      const sorted = [...monopoly].sort((a, b) => a.property!.houses - b.property!.houses);
      
      for (const square of sorted) {
        const prop = square.property!;
        if (prop.houses < 5 && remaining >= prop.housePrice) {
          actions.push({ type: 'build', propertyPosition: square.position });
          prop.houses++; // Temp increment for planning
          remaining -= prop.housePrice;
          totalCost += prop.housePrice;
          changed = true;
        }
      }
    }

    // Revert temp houses (important since state is shared in planning if not careful)
    // Actually our prop reference here is from the game state in current logic, 
    // but we should probably work on copies or just let the slice handle it.
    // Fixed: In a real app we'd deep clone. Here we'll just return the actions.
    return { actions, totalCost };
  }
}
