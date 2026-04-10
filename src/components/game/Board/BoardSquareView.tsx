import { BoardSquare, SquareType } from '@/lib/game.types';

interface Props {
  square: BoardSquare;
}

export default function BoardSquareView({ square }: Props) {
  if (square.type === SquareType.PROPERTY && square.property) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
        <div>
          <div
            className="h-2 rounded-full"
            style={{ backgroundColor: square.property.color ?? '#94a3b8' }}
          />
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.2em] text-cyan-200">
            Property {square.position}
          </p>
          <p className="mt-2 text-sm font-semibold leading-tight text-white">
            {square.property.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">{square.property.country}</p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-sm font-semibold text-emerald-200">
            ¤{square.property.price}
          </p>
          {square.property.houses > 0 ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
              {square.property.houses === 5 ? 'Hotel' : `${square.property.houses} Houses`}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Open
            </span>
          )}
        </div>
      </div>
    );
  }

  if (square.type === SquareType.TRANSPORTATION && square.transportation) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.2em] text-sky-200">
            Transportation {square.position}
          </p>
          <p className="mt-2 text-sm font-semibold leading-tight text-white">
            {square.transportation.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">{square.transportation.type}</p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-sm font-semibold text-sky-200">¤{square.transportation.price}</p>
          <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-100">
            Rail/Route
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.2em] text-amber-200">
          Special {square.position}
        </p>
        <p className="mt-2 text-sm font-semibold leading-tight text-white">
          {square.special?.name ?? 'Special Tile'}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {square.special?.type ?? 'special'}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          {square.special?.type === 'start' ? 'Start' : 'Event'}
        </span>
        {square.special?.amount ? (
          <p className="text-sm font-semibold text-amber-200">¤{square.special.amount}</p>
        ) : null}
      </div>
    </div>
  );
}
