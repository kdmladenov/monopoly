import { Player } from '@/lib/game.types';

interface Props {
  player: Player;
  offset: number;
}

const offsets = [
  'translate(-7.5px, -7.5px)',
  'translate(-2.5px, -2.5px)',
  'translate(2.5px, 2.5px)',
  'translate(7.5px, 7.5px)',
];

export default function PlayerPawn({ player, offset }: Props) {
  return (
    <div
      className="z-20"
      style={{ 
        width: '28px', 
        height: '28px',
        borderRadius: '50%',
        backgroundColor: player.color,
        transform: offset === -1 ? 'none' : offsets[offset % offsets.length],
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: `
          inset -6px -6px 12px rgba(0,0,0,0.4), 
          inset 4px 4px 8px rgba(255,255,255,0.4),
          0 8px 16px rgba(0,0,0,0.6)
        `,
        backgroundImage: `
          radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${player.color} 0%, rgba(0,0,0,0.2) 100%)
        `,
        border: 'none',
        boxSizing: 'border-box'
      }}
      title={player.name}
      aria-label={player.name}
    />
  );
}
