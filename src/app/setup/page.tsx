'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { AIDifficulty, AIStyle, ContinentId, PlayerType } from '@/lib/game.types';
import { setBoard, setCurrentPlayerIndex, setPlayers, startGame } from '@/lib/features/game/gameSlice';
import { BoardGenerator } from '@/lib/services/BoardGenerator';
import ContinentSelector from '@/components/setup/ContinentSelector';
import PlayerConfigurator from '@/components/setup/PlayerConfigurator';

export default function SetupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentPlayers = useSelector((state: RootState) => state.game.players);
  const [continent, setContinent] = useState(ContinentId.EUROPE);
  const boardGenerator = useMemo(() => new BoardGenerator(), []);

  const players = useMemo(
    () =>
      currentPlayers.map((player, index) => ({
        ...player,
        turnOrder: index,
      })),
    [currentPlayers]
  );

  const addPlayer = () => {
    const nextIndex = players.length + 1;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex}`,
          name: `Player ${nextIndex}`,
          type: PlayerType.HUMAN,
          avatar: 'token',
          color: nextIndex % 2 ? '#f97316' : '#38bdf8',
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex - 1,
        },
      ])
    );
  };

  const addAIPlayer = () => {
    const nextIndex = players.length + 1;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex}`,
          name: `AI ${nextIndex}`,
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.INTERMEDIATE,
          aiStyle: AIStyle.BALANCED,
          avatar: 'globe',
          color: nextIndex % 2 ? '#38bdf8' : '#a78bfa',
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex - 1,
        },
      ])
    );
  };

  const updatePlayer = (playerId: string, patch: Partial<(typeof players)[number]>) => {
    dispatch(
      setPlayers(
        players.map((player) => (player.id === playerId ? { ...player, ...patch } : player))
      )
    );
  };

  const removePlayer = (playerId: string) => {
    const nextPlayers = players.filter((player) => player.id !== playerId).map((player, index) => ({
      ...player,
      turnOrder: index,
    }));

    dispatch(setPlayers(nextPlayers));
  };

  const start = () => {
    const board = boardGenerator.generateBoard(continent);
    dispatch(setBoard(board));
    dispatch(setCurrentPlayerIndex(0));
    dispatch(startGame());
    router.push('/game');
  };

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200">Setup</p>
            <h1 className="mt-2 text-4xl font-black">Configure your match</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:bg-white/8"
          >
            Back home
          </Link>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <ContinentSelector selected={continent} onSelect={setContinent} />
          <PlayerConfigurator
            players={players}
            maxPlayers={4}
            onAddPlayer={addPlayer}
            onAddAIPlayer={addAIPlayer}
            onRemovePlayer={removePlayer}
            onUpdatePlayer={updatePlayer}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Selected continent: <span className="text-white">{continent}</span>
          </p>
          <button
            onClick={start}
            className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Launch game
          </button>
        </div>
      </div>
    </main>
  );
}
