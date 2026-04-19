import { Player } from '@/lib/game.types';

interface Props {
  player: Player;
  offset: number;
}

const offsets = [
  'translate(0, 0)',
  'translate(14px, 0)',
  'translate(0, 14px)',
  'translate(14px, 14px)',
];

export default function PlayerPawn({ player, offset }: Props) {
  return (
    <div
      className="absolute left-1.5 top-1.5 z-20"
      style={{ 
        width: '28px', // Larger chip
        height: '28px',
        borderRadius: '50%',
        backgroundColor: player.color,
        transform: offsets[offset % offsets.length],
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: `
          inset -3px -3px 6px rgba(0,0,0,0.4), 
          inset 3px 3px 6px rgba(255,255,255,0.4),
          0 4px 8px rgba(0,0,0,0.6)
        `,
        backgroundImage: `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%),
          linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)
        `,
        border: '2px solid rgba(255,255,255,0.3)',
        boxSizing: 'border-box'
      }}
      title={player.name}
      aria-label={player.name}
    />
  );
}
