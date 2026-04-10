import { GamePhase, Player } from '@/lib/game.types';

export function shouldSkipMovement(player: Player | undefined, phase: GamePhase): boolean {
  return Boolean(player?.isInJail) && phase === GamePhase.PLAYING;
}

export function canDeclareBankruptcy(player: Player | undefined, phase: GamePhase): boolean {
  if (!player) {
    return false;
  }

  return !player.isBankrupt && player.money === 0 && phase === GamePhase.PLAYING;
}

export function getPlayerStatus(player: Player | undefined): string {
  if (!player) {
    return 'No active player.';
  }

  if (player.isBankrupt) {
    return `${player.name} is bankrupt.`;
  }

  if (player.isInJail) {
    return `${player.name} is in jail for ${player.jailTurns} more turn${player.jailTurns === 1 ? '' : 's'}.`;
  }

  return `${player.name} is ready to roll.`;
}

export function getPlayerTurnHint(player: Player | undefined): string | null {
  if (!player) {
    return null;
  }

  if (player.isInJail) {
    return 'Jail status active: roll to reduce the timer.';
  }

  if (player.consecutiveDoubles > 0) {
    return `Doubles streak: ${player.consecutiveDoubles}/3.`;
  }

  return null;
}
