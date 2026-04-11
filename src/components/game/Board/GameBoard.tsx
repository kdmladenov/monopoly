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
}

export default function GameBoard({ board, players, lastDiceRoll }: Props) {
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

  const renderDice = (value: number) => (
    <Box
      sx={{
        width: 70,
        height: 70,
        bgcolor: 'white',
        border: '3px solid black',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 4,
      }}
    >
      <Typography variant="h3" sx={{ color: 'black', fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  );

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
        {/* Logo Box */}
        <Box sx={{ 
          position: 'absolute', 
          top: '20%', 
          right: '15%', 
          p: 1.5, 
          bgcolor: 'white', 
          borderRadius: 1, 
          border: '2px solid #1e293b', 
          boxShadow: 4 
        }}>
          <Typography variant="h5" sx={{ m: 0, color: '#1e293b', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
            EUROPOLY
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, zIndex: 1, mt: 10 }}>
          {lastDiceRoll && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {renderDice(lastDiceRoll.die1)}
              {renderDice(lastDiceRoll.die2)}
            </Box>
          )}
          <Typography variant="h6" sx={{ color: '#000', fontWeight: 900, bgcolor: 'rgba(255,255,255,0.7)', px: 2, borderRadius: 1 }}>
            Roll dice
          </Typography>
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
          }}
        >
          <BoardSquareView square={square} />
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
