import { DiceRoll, GamePhase, TurnPhase } from '@/lib/game.types';

export function getTurnHint(turnPhase: TurnPhase, phase: GamePhase): string {
  if (phase === GamePhase.ENDED) {
    return 'Game over.';
  }

  switch (turnPhase) {
    case TurnPhase.ROLL_DICE:
      return 'Roll to move.';
    case TurnPhase.ACTION:
      return 'Resolve the landing and then end the turn.';
    case TurnPhase.END_TURN:
      return 'Turn is ready to end.';
    case TurnPhase.MOVE:
    default:
      return 'Turn is in progress.';
  }
}

export function canRoll(turnPhase: TurnPhase, phase: GamePhase): boolean {
  return turnPhase === TurnPhase.ROLL_DICE && phase !== GamePhase.ENDED;
}

export function canEndTurn(turnPhase: TurnPhase): boolean {
  return turnPhase === TurnPhase.END_TURN;
}

export function getDoubleTurnHint(lastDiceRoll: DiceRoll | null): string | null {
  if (!lastDiceRoll?.isDouble) {
    return null;
  }

  return 'Doubles rolled: you keep the turn.';
}
