'use client';

import { BoardSquare, DiceRoll } from '@/lib/game.types';
import BoardSquareView from './BoardSquareView';
import PlayerPawn from './PlayerPawn';
import AnimatedPawn from './AnimatedPawn';
import { Player, PlayerType } from '@/lib/game.types';
import { Box, Typography, Paper, IconButton } from '@mui/material';

interface Props {
  board: BoardSquare[];
  players: Player[];
  lastDiceRoll: { die1: number; die2: number } | null;
  animationSpeed?: number;
  onSquareClick?: (pos: number) => void;
  onRollDice?: () => void;
  onEndTurn?: () => void;
  onShowInfo?: (event: React.MouseEvent<HTMLElement>) => void;
  canRoll?: boolean;
  canEndTurn?: boolean;
  activeTradePlayerIds?: string[];
}

export default function GameBoard({ 
  board, 
  players, 
  lastDiceRoll, 
  animationSpeed = 0.6,
  onSquareClick, 
  onRollDice, 
  onEndTurn,
  onShowInfo,
  canRoll,
  canEndTurn,
  activeTradePlayerIds
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
          width: 42,
          height: 42,
          bgcolor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          p: 0.6,
          // Deepened 3D Insets and shadows
          boxShadow: `
            0 6px 12px rgba(0,0,0,0.4),
            inset 2px 2px 5px rgba(255,255,255,0.9),
            inset -4px -4px 8px rgba(0,0,0,0.25),
            inset 0 0 12px rgba(0,0,0,0.1)
          `,
          // Dual shading (Top-Left and Top-Right light sources)
          backgroundImage: `
            linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%),
            linear-gradient(225deg, rgba(255,255,255,0.2) 0%, transparent 40%)
          `,
          position: 'relative'
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
        gridTemplateColumns: '1.5fr repeat(4, 1fr) 1.5fr',
        gridTemplateRows: '1.5fr repeat(14, 1fr) 1.5fr', // Proportional corners
        width: '100vw',
        height: '100vh',
        maxWidth: 500,
        aspectRatio: '6 / 16',
        bgcolor: '#c6e6d5',
        gap: 0,
        border: '4px solid #1a1a1a',
        boxShadow: '0 0 40px rgba(0,0,0,0.3)',
        mx: 'auto',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Center Area with Recessed Effect */}
      <Box
        sx={{
          gridArea: '2 / 2 / 16 / 6', 
          bgcolor: '#c6e6d5', // Solid floor color
          // Sophisticated layered shadows for a high-end 3D board
          boxShadow: `
            inset 0 12px 24px rgba(0,0,0,0.1),
            inset 0 -8px 16px rgba(0,0,0,0.06),
            inset 8px 0 16px rgba(0,0,0,0.04),
            inset -8px 0 16px rgba(0,0,0,0.04)
          `, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          pb: 1.5,
          position: 'relative',
          overflow: 'hidden', // Contain the texture overlay
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '2px',
          m: 0.2,
          // Premium Felt/Texture Overlay
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/fabric-of-squares.png")',
            pointerEvents: 'none',
          },
          // Center Highlight
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, transparent 80%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Player Stats - Reorganized with Human Player below and bigger */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1.5, 
          width: '100%', 
          px: 1, 
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          {/* AI Players - Compact Row at the Top */}
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            width: '100%', 
            justifyContent: 'center', 
            flexWrap: 'nowrap'
          }}>
            {players.filter(p => p.type === PlayerType.AI).map((p) => (
              <Paper 
                key={p.id} 
                elevation={1} 
                sx={{ 
                  p: 0.35, 
                  flex: '1 1 0',
                  maxWidth: 70,
                  minWidth: 45,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  border: `1px solid ${p.color}`,
                  bgcolor: `${p.color}25`, // Subtle background
                  borderRadius: 0.8,
                  opacity: 0.9,
                  transition: 'all 0.2s',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, width: '100%', justifyContent: 'center' }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: p.color, flexShrink: 0 }} />
                  <Typography sx={{ 
                    fontWeight: 700, 
                    fontSize: '0.4rem', 
                    color: 'black', 
                    textTransform: 'uppercase', 
                    fontFamily: '"Roboto Condensed", sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {p.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.55rem', color: 'black' }}>
                  {p.money.toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Human Players Group - Below AI and Larger */}
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1, 
            flexWrap: 'wrap' // Handle multiple humans
          }}>
            {players.filter(p => p.type === PlayerType.HUMAN).map((p) => (
              <Paper 
                key={p.id} 
                elevation={4} 
                sx={{ 
                  p: 0.8, 
                  flex: '1 1 0',
                  minWidth: 100,
                  maxWidth: 140,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  border: `2px solid ${p.color}`,
                  bgcolor: `${p.color}45`, 
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  // Always slightly bigger, but current human is extra emphasized
                  transform: 'scale(1.02)',
                  boxShadow: `0 4px 8px ${p.color}25`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, width: '100%', justifyContent: 'center', mb: 0.2 }}>
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: p.color, 
                    flexShrink: 0
                  }} />
                  <Typography sx={{ 
                    fontWeight: 900, 
                    fontSize: '0.65rem', 
                    color: 'black', 
                    textTransform: 'uppercase', 
                    fontFamily: '"Roboto Condensed", sans-serif'
                  }}>
                    {p.name}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontWeight: 950, 
                  fontSize: '1rem', 
                  color: 'black'
                }}>
                  {p.money.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>¤</span>
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Gameplay Controls at the BOTTOM */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', mb: 1 }}>
          {/* Dice */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Die value={lastDiceRoll?.die1 || 1} />
            <Die value={lastDiceRoll?.die2 || 2} />
          </Box>

          {/* Action Buttons - Fixed height container to prevent dice shifting */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5, 
            width: '75%', 
            alignItems: 'center',
            minHeight: 110, // Ensure dice don't jump when buttons disappear
            justifyContent: 'center'
          }}>
            {canRoll ? (
              <Box 
                component="button"
                onClick={onRollDice}
                sx={{ 
                  background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                  color: 'white',
                  border: '2px solid white',
                  outline: '1px solid black',
                  borderRadius: 3,
                  width: '100%',
                  py: 1.2,
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  boxShadow: `
                    0 4px 10px rgba(0,0,0,0.3),
                    inset 0 4px 6px rgba(255,255,255,0.4),
                    inset 0 -6px 8px rgba(0,0,0,0.3)
                  `,
                  transition: 'all 0.1s',
                  '&:active': { 
                    transform: 'scale(0.98)', 
                    boxShadow: `
                      0 2px 4px rgba(0,0,0,0.3),
                      inset 0 2px 4px rgba(255,255,255,0.3),
                      inset 0 -3px 4px rgba(0,0,0,0.3)
                    `
                  }
                }}
              >
                ROLL
              </Box>
            ) : null}

            {canEndTurn ? (
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
            ) : null}
          </Box>
        </Box>
      </Box>


      {/* Player Pawns Layer - Step-by-step movement */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
        {players.map((player) => (
          <AnimatedPawn 
            key={player.id} 
            player={player} 
            allPlayers={players} 
            getSquareGridArea={getSquareGridArea}
            animationSpeed={animationSpeed}
          />
        ))}
      </Box>

      {/* Trade Overlay (dims the board except for participating properties) */}
      {activeTradePlayerIds && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: '-150vh',
            left: '-150vw',
            right: '-150vw',
            bottom: '-150vh',
            bgcolor: 'rgba(0,0,0,0.65)', 
            zIndex: 50, 
            cursor: 'default',
          }} 
        />
      )}

      {/* Board Squares */}
      {(board || []).map((square) => {
        const ownerId = square.property?.ownerId || square.transportation?.ownerId;
        const isTradeParticipantOwner = activeTradePlayerIds && ownerId && activeTradePlayerIds.includes(ownerId);

        return (
          <Box
            key={square.id}
            sx={{
              ...getSquareGridArea(square.position),
              position: 'relative',
              zIndex: isTradeParticipantOwner ? 51 : 1,
              cursor: 'pointer',
              transition: 'z-index 0.3s'
            }}
            onClick={() => onSquareClick?.(square.position)}
          >
            <BoardSquareView 
              square={square} 
              ownerColor={players.find(p => p.id === ownerId)?.color}
            />
          </Box>
        );
      })}
    </Box>
  );
}
