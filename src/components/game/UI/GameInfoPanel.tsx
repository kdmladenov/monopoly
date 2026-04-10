'use client';

import { GameState } from '@/lib/game.types';

interface Props {
  game: GameState;
}

export default function GameInfoPanel({ game }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
      <p className="font-semibold text-white">Current state</p>
      <pre className="mt-3 overflow-auto text-xs leading-6">
        {JSON.stringify(
          {
            phase: game.phase,
            continent: game.continent,
            playerCount: game.players.length,
            lastDiceRoll: game.lastDiceRoll,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
