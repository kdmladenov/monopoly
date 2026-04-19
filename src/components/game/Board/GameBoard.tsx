'use client';

import { BoardSquare, DiceRoll } from '@/lib/game.types';
import BoardSquareView from './BoardSquareView';
import PlayerPawn from './PlayerPawn';
import { Player } from '@/lib/game.types';
import { Box, Typography } from '@mui/material';

interface Props {
  board: BoardSquare[];
  players: Player[];
  lastDiceRoll: DiceRoll | null;
  onSquareClick?: (pos: number) => void;
  onRollDice?: () => void;
  canRoll?: boolean;
}

export default function GameBoard({ board, players, lastDiceRoll, onSquareClick, onRollDice, canRoll }: Props) {
  console.log('GameBoard rendering with board:', board?.length, 'squares');

  // Indices based on 13x9 layout
  // Grid indices for 13x9 layout
  const getSquareGridArea = (pos: number) => {
    if (pos >= 0 && pos <= 12) {
      // Bottom side: 0 (BR) to 12 (BL)
      return { 
        gridRow: 9, 
        gridColumn: 13 - pos 
      };
    }
    if (pos > 12 && pos < 20) {
      // Left side: 13 to 19
      return { 
        gridRow: 21 - pos, 
        gridColumn: 1 
      };
    }
    if (pos >= 20 && pos <= 32) {
      // Top side: 20 (TL) to 32 (TR)
      return { 
        gridRow: 1, 
        gridColumn: pos - 19 
      };
    }
    if (pos > 32) {
      // Right side: 33 to 39
      return { 
        gridRow: pos - 31, 
        gridColumn: 13 
      };
    }
    return {};
  };

  const Die = ({ value }: { value: number }) => {
    const pips = [];
    const positions = [
      [], // 0
      [4], // 1
      [2, 6], // 2 (top right, bottom left)
      [2, 4, 6], // 3 (diagonal)
      [0, 2, 6, 8], // 4 (four corners)
      [0, 2, 4, 6, 8], // 5 (four corners + center)
      [0, 3, 6, 2, 5, 8], // 6 (two columns of three)
    ];

    for (let i = 0; i < 9; i++) {
      pips.push(
        <Box key={i} sx={{ width: '33.33%', height: '33.33%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {positions[value].includes(i) && (
            <Box sx={{ width: '70%', height: '70%', bgcolor: 'black', borderRadius: '50%' }} />
          )}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: 55,
          height: 55,
          bgcolor: '#f1f1f1',
          border: '1.2px solid #333',
          borderRadius: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          p: 0.8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {pips}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(9, 1fr)',
        width: '100%',
        height: '100%',
        bgcolor: '#cbd5e1',
        overflow: 'hidden',
        gap: 0,
      }}
    >
      {/* Center Area (Map and Buttons) */}
      <Box
        sx={{
          gridArea: '2 / 2 / 9 / 13',
          bgcolor: '#f1f5f9',
          border: '2px solid #475569',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: 'url("/europe_map.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Top-Right Control Box */}
        <Box sx={{ 
          position: 'absolute', 
          top: '5%', 
          right: '5%', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          zIndex: 10
        }}>
          {/* Logo */}
          <Box sx={{ 
            bgcolor: 'white', 
            borderRadius: 1, 
            border: '2px solid #1e293b', 
            px: 2,
            py: 0.5,
            boxShadow: 2
          }}>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem', fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
              EUROPOLY
            </Typography>
          </Box>

          {/* Dice display */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Die value={lastDiceRoll?.die1 || 1} />
            <Die value={lastDiceRoll?.die2 || 1} />
          </Box>

          {/* Roll Button */}
          <Box 
            component="button"
            onClick={onRollDice}
            disabled={!canRoll}
            sx={{ 
              mt: 1,
              border: 'none',
              background: 'none',
              cursor: canRoll ? 'pointer' : 'default',
              opacity: canRoll ? 1 : 0.5,
              '&:hover': {
                transform: canRoll ? 'scale(1.05)' : 'none'
              },
              transition: 'transform 0.1s'
            }}
          >
            <Typography variant="h6" sx={{ color: 'black', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
              Roll dice
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Board Squares */}
      {(board || []).map((square) => (
        <Box
          key={square.id}
          sx={{
            ...getSquareGridArea(square.position),
            position: 'relative',
            zIndex: 1,
            bgcolor: 'white',
            cursor: 'pointer',
            '&:hover': { zIndex: 10, boxShadow: '0 0 10px rgba(0,0,0,0.2)' }
          }}
          onClick={() => onSquareClick?.(square.position)}
        >
          <BoardSquareView 
            square={square} 
            ownerColor={players.find(p => p.id === (square.property?.ownerId || square.transportation?.ownerId))?.color}
          />
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', p: 0.5 }}>
            {players
              .filter((player) => player.position === square.position)
              .map((player, playerIndex) => (
                <PlayerPawn key={player.id} player={player} offset={playerIndex} />
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
