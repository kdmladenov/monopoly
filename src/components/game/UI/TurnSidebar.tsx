'use client';

import { GameState, Player } from '@/lib/game.types';
import { canEndTurn, canRoll, getDoubleTurnHint, getTurnHint } from '@/lib/turns/turnController';
import {
  canDeclareBankruptcy,
  getPlayerStatus,
  getPlayerTurnHint,
} from '@/lib/turns/playerTurnController';
import ActivityLogPanel from './ActivityLogPanel';

interface Props {
  game: GameState;
  currentPlayer: Player | undefined;
  bankruptPlayers: Player[];
  onRoll: () => void;
  onEndTurn: () => void;
  onDeclareBankruptcy: () => void;
}

export default function TurnSidebar({
  game,
  currentPlayer,
  bankruptPlayers,
  onRoll,
  onEndTurn,
  onDeclareBankruptcy,
}: Props) {
  const isBankruptcyAvailable = canDeclareBankruptcy(currentPlayer, game.phase);

  return (
    <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-[var(--panel)] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Turn</p>
        <div className="mt-2 rounded-2xl bg-white/5 p-4">
          <p className="text-xl font-semibold">{currentPlayer?.name ?? 'No player'}</p>
          <p className="text-sm text-slate-400">Phase: {game.turnPhase}</p>
          <p className="text-sm text-slate-400">Round: {game.turn}</p>
          <p className="text-sm text-slate-400">Position: {currentPlayer?.position ?? 0}</p>
          <p className="text-sm text-slate-400">Bankrupt: {bankruptPlayers.length}</p>
          <p className="text-sm text-slate-400">{getPlayerStatus(currentPlayer)}</p>
          {getPlayerTurnHint(currentPlayer) ? (
            <p className="text-sm text-cyan-200">{getPlayerTurnHint(currentPlayer)}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3">
        <button
          onClick={onRoll}
          disabled={!canRoll(game.turnPhase, game.phase)}
          className="rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Roll dice
        </button>
        <button
          onClick={onEndTurn}
          disabled={!canEndTurn(game.turnPhase) || currentPlayer?.isInJail}
          className="rounded-2xl border border-white/15 px-4 py-3 font-semibold transition hover:bg-white/8"
        >
          End turn
        </button>
      </div>

      <p className="text-xs text-slate-400">{getTurnHint(game.turnPhase, game.phase)}</p>
      {getDoubleTurnHint(game.lastDiceRoll) ? (
        <p className="text-xs text-cyan-200">{getDoubleTurnHint(game.lastDiceRoll)}</p>
      ) : null}

      {isBankruptcyAvailable ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          This player is out of money and can declare bankruptcy.
          <button
            onClick={onDeclareBankruptcy}
            className="mt-3 w-full rounded-xl bg-rose-300 px-4 py-2 font-semibold text-rose-950 transition hover:bg-rose-200"
          >
            Declare bankruptcy
          </button>
        </div>
      ) : null}

      <ActivityLogPanel entries={game.activityLog} />
    </aside>
  );
}
