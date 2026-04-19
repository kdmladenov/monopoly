'use client';

import { BoardSquare, DiceRoll } from '@/lib/game.types';
import BoardSquareView from './BoardSquareView';
import PlayerPawn from './PlayerPawn';
import { Player } from '@/lib/game.types';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface Props {
  board: BoardSquare[];
  players: Player[];
  lastDiceRoll: { die1: number; die2: number } | null;
  onSquareClick?: (pos: number) => void;
  onRollDice?: () => void;
  onEndTurn?: () => void;
  onShowInfo?: (event: React.MouseEvent<HTMLElement>) => void;
  canRoll?: boolean;
  canEndTurn?: boolean;
}

export default function GameBoard({ 
  board, 
  players, 
  lastDiceRoll, 
  onSquareClick, 
  onRollDice, 
  onEndTurn,
  onShowInfo,
  canRoll,
  canEndTurn 
}: Props) {
  console.log('GameBoard rendering with board:', board?.length, 'squares');

  // Indices based on image orientation (0 at Bottom-Left, 5 at Bottom-Right)
  const getSquareGridArea = (pos: number) => {
    if (pos >= 0 && pos <= 5) {
      // Bottom side: 0 (BR) to 5 (BL)
      return { 
        gridRow: 16, 
        gridColumn: 6 - pos 
      };
    }
    if (pos > 5 && pos < 20) {
      // Left side: 6 to 19 (UP)
      return { 
        gridRow: 16 - (pos - 5), 
        gridColumn: 1 
      };
    }
    if (pos >= 20 && pos <= 25) {
      // Top side: 20 (TL) to 25 (TR)
      return { 
        gridRow: 1, 
        gridColumn: (pos - 20) + 1 
      };
    }
    if (pos > 25) {
      // Right side: 26 to 39 (DOWN)
      return { 
        gridRow: (pos - 25) + 1, 
        gridColumn: 6 
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
            <Box sx={{ width: '70%', height: '70%', bgcolor: '#333', borderRadius: '50%' }} />
          )}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: 44,
          height: 44,
          bgcolor: 'white',
          border: '1px solid #ccc',
          borderRadius: 1,
          display: 'flex',
          flexWrap: 'wrap',
          p: 0.5,
          boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
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
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: '1.5fr repeat(14, 1fr) 1.5fr', // Proportional corners
        width: '100vw',
        height: '100vh',
        maxWidth: 500,
        aspectRatio: '6 / 16',
        bgcolor: '#c6e6d5',
        overflow: 'hidden',
        gap: 0,
        border: '4px solid #1a1a1a',
        boxShadow: '0 0 40px rgba(0,0,0,0.3)',
        mx: 'auto',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Center Area */}
      <Box
        sx={{
          gridArea: '2 / 2 / 16 / 6', 
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          pb: 1.5,
          position: 'relative',
        }}
      >
        {/* Player Stats at the TOP */}
        <Box sx={{ display: 'flex', gap: 1, width: '100%', px: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {players.map((p, idx) => (
            <Paper key={p.id} elevation={idx === 0 ? 3 : 1} sx={{ 
              p: 0.5, 
              width: 70, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              border: `2px solid ${p.color}`,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              transform: idx === 0 ? 'scale(1.05)' : 'none'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: p.color }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.45rem', color: 'black', textTransform: 'uppercase', fontFamily: '"Roboto Condensed", sans-serif', maxWidth: 50, overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '0.65rem', color: '#16a34a' }}>{p.money.toLocaleString()}¤</Typography>
            </Paper>
          ))}
        </Box>

        {/* Gameplay Controls at the BOTTOM */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', mb: 1 }}>
          {/* Dice */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Die value={lastDiceRoll?.die1 || 1} />
            <Die value={lastDiceRoll?.die2 || 2} />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '75%', alignItems: 'center' }}>
            {canRoll && (
              <Box 
                component="button"
                onClick={onRollDice}
                sx={{ 
                  background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                  color: 'white',
                  border: '2px solid white',
                  outline: '1px solid black',
                  borderRadius: 2.5,
                  width: '100%',
                  py: 1,
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  transition: 'all 0.1s',
                  '&:active': { transform: 'scale(0.95)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
                }}
              >
                ROLL
              </Box>
            )}

            {canEndTurn && (
              <Box 
                component="button"
                onClick={onEndTurn}
                sx={{ 
                  background: '#16a34a',
                  color: 'white',
                  border: '2px solid white',
                  outline: '1px solid black',
                  borderRadius: 2,
                  width: '85%',
                  py: 0.8,
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                  transition: 'all 0.1s',
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                END TURN
              </Box>
            )}
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
            cursor: 'pointer',
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
