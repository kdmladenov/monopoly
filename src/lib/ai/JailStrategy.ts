import { GameState, Player } from '../game.types';
import { PERSONALITY_CONFIGS, PersonalityConfig } from './BotPersonalityConfigs';

export class JailStrategy {
  shouldPayJailFine(player: Player, gameState: GameState): boolean {
    const personality = PERSONALITY_CONFIGS[player.aiStyle || 'balanced'];
    
    // Always pay on final turn
    if (player.jailTurns >= 2) return true;

    // Check affordance
    if (player.money < 1000 + personality.minCashReserve) {
      return false;
    }

    const phase = this.getGamePhase(gameState);
    const threat = this.calculateOpponentThreat(player, gameState);

    // Early game: jail is bad, want to be out buying
    if (phase === 'EARLY') {
      return Math.abs(personality.jailEarlyGameValue) > 0.4;
    }

    // Late game: jail might be good if threat is high
    if (phase === 'LATE') {
      if (threat > 0.7) {
        return false; // Stay in safety of jail
      }
      return true; // No threat, go out and collect rent
    }

    return true;
  }

  private getGamePhase(gameState: GameState): 'EARLY' | 'MID' | 'LATE' {
    const owned = gameState.players.reduce((sum, p) => sum + p.ownedProperties.length, 0);
    const total = gameState.board.filter(s => s.property || s.transportation).length;
    const ratio = owned / total;

    if (ratio < 0.5) return 'EARLY';
    if (ratio < 0.85) return 'MID';
    return 'LATE';
  }

  private calculateOpponentThreat(player: Player, gameState: GameState): number {
    let maxThreat = 0;
    for (const opponent of gameState.players) {
      if (opponent.id === player.id || opponent.isBankrupt) continue;
      
      let threat = 0;
      const opponentProperties = gameState.board.filter(s => s.property?.ownerId === opponent.id);
      
      opponentProperties.forEach(s => {
        if (s.property!.houses > 2) threat += 0.25;
        else if (s.property!.houses > 0) threat += 0.1;
      });

      maxThreat = Math.max(maxThreat, Math.min(threat, 1));
    }
    return maxThreat;
  }
}
