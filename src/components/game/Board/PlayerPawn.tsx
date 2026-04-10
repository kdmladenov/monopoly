import { Player } from '@/lib/game.types';

interface Props {
  player: Player;
  offset: number;
}

const offsets = [
  'translate-x-0 translate-y-0',
  'translate-x-3 translate-y-0',
  'translate-x-0 translate-y-3',
  'translate-x-3 translate-y-3',
];

export default function PlayerPawn({ player, offset }: Props) {
  return (
    <div
      className={`absolute left-1 top-1 z-20 h-5 w-5 rounded-full border border-white/70 shadow-lg shadow-black/30 ${offsets[offset % offsets.length]}`}
      style={{ backgroundColor: player.color }}
      title={player.name}
      aria-label={player.name}
    />
  );
}
