'use client';

import { BoardSquare } from '@/lib/game.types';
import BoardSquareView from './BoardSquareView';
import PlayerPawn from './PlayerPawn';
import { Player } from '@/lib/game.types';

interface Props {
  board: BoardSquare[];
  players: Player[];
}

export default function GameBoard({ board, players }: Props) {
  const squaresPerSide = 10;

  const getSquarePosition = (index: number) => {
    const side = Math.floor(index / squaresPerSide);
    const positionOnSide = index % squaresPerSide;

    if (side === 0) {
      return { bottom: 0, left: `${positionOnSide * 10}%` };
    }
    if (side === 1) {
      return { right: 0, bottom: `${positionOnSide * 10}%` };
    }
    if (side === 2) {
      return { top: 0, right: `${positionOnSide * 10}%` };
    }
    return { left: 0, top: `${positionOnSide * 10}%` };
  };

  return (
    <div className="relative min-h-[38rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02)_35%,_rgba(0,0,0,0.2)_100%)] p-3">
      <div className="absolute inset-[18%] rounded-[2rem] border border-white/10 bg-black/20" />

      {board.length > 0 ? (
        board.map((square, index) => (
          <div
            key={square.id}
            className="absolute p-1"
            style={{
              ...getSquarePosition(index),
              width: '10%',
              height: '10%',
            }}
          >
            <BoardSquareView square={square} />
            {players
              .filter((player) => player.position === square.position)
              .map((player, playerIndex) => (
                <PlayerPawn key={player.id} player={player} offset={playerIndex} />
              ))}
          </div>
        ))
      ) : (
        <div className="relative z-10 flex h-full items-center justify-center text-slate-300">
          Board data has not been generated yet.
        </div>
      )}
    </div>
  );
}
