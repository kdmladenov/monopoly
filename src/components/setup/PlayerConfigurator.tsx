'use client';

import { AIStyle, Player, PlayerType } from '@/lib/game.types';

interface PlayerConfiguratorProps {
  players: Player[];
  maxPlayers: number;
  onAddPlayer: () => void;
  onAddAIPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, patch: Partial<Player>) => void;
}

export default function PlayerConfigurator({
  players,
  maxPlayers,
  onAddPlayer,
  onAddAIPlayer,
  onRemovePlayer,
  onUpdatePlayer,
}: PlayerConfiguratorProps) {
  const canAdd = players.length < maxPlayers;

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Players</h2>
          <p className="mt-2 text-sm text-slate-400">
            Configure the opening roster before starting the match.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {players.length}/{maxPlayers}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: player.color }} />
                <p className="truncate font-medium">{player.name}</p>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <span>{player.type === PlayerType.HUMAN ? 'Human' : 'AI'} player</span>
                {player.type === PlayerType.AI && (
                  <select
                    value={player.aiStyle ?? AIStyle.BALANCED}
                    onChange={(event) =>
                      onUpdatePlayer(player.id, { aiStyle: event.target.value as AIStyle })
                    }
                    className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-white"
                  >
                    <option value={AIStyle.CAUTIOUS}>Cautious</option>
                    <option value={AIStyle.BALANCED}>Balanced</option>
                    <option value={AIStyle.AGGRESSIVE}>Aggressive</option>
                  </select>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemovePlayer(player.id)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onAddPlayer}
          disabled={!canAdd}
          className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add player
        </button>
        <button
          onClick={onAddAIPlayer}
          disabled={!canAdd}
          className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add AI
        </button>
      </div>
    </div>
  );
}
