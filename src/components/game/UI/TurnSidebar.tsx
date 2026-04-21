'use client';

import { GameState, Player } from '@/lib/game.types';
import { canEndTurn, canRoll } from '@/lib/turns/turnController';
import { Box, Paper, Typography, Button, Avatar } from '@mui/material';

interface Props {
  game: GameState;
  currentPlayer: Player | undefined;
  bankruptPlayers: Player[];
  onRoll: () => void;
  onEndTurn: () => void;
  onDeclareBankruptcy: () => void;
}

export default function TurnSidebar({
  game,
  currentPlayer,
  bankruptPlayers,
  onRoll,
  onEndTurn,
  onDeclareBankruptcy,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#d1d5db' }}>
      <Box
        sx={{
          flexGrow: 1,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto',
        }}
      >
        {game.players.map((player) => {
          const isActive = player.id === currentPlayer?.id;
          return (
            <Box key={player.id} sx={{ textAlign: 'center', mb: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#1e293b', 
                  fontWeight: 900, 
                  fontSize: '0.85rem',
                  mb: 0.25 
                }}
              >
                {player.name}
              </Typography>
              <Paper
                elevation={isActive ? 4 : 1}
                sx={{
                  p: 0.75,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: `3px solid ${player.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  transform: isActive ? 'scale(1.02)' : 'none',
                  boxShadow: isActive ? `0 0 10px ${player.color}44` : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: `${player.color}11`,
                    borderRadius: 1.5,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <Typography variant="h3" sx={{ opacity: 0.3, fontWeight: 900, color: player.color }}>
                    {player.name[0]}
                  </Typography>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 1, 
                    color: '#16a34a', 
                    fontWeight: 900,
                    fontSize: '1.1rem' 
                  }}
                >
                  {player.money.toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          );
        })}

        <Box sx={{ mt: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            onClick={onRoll}
            disabled={!canRoll(game.turnPhase, game.phase)}
            fullWidth
            sx={{ 
              py: 1, 
              fontSize: '0.9rem', 
              fontWeight: 800,
              bgcolor: '#22d3ee',
              color: '#0e7490',
              borderRadius: 2,
              '&:hover': { bgcolor: '#06b6d4' }
            }}
          >
            Roll dice
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', bgcolor: '#cbd5e1' }}>
        <Button 
          sx={{ 
            color: '#94a3b8', 
            fontSize: '0.85rem',
            fontWeight: 700,
            '&:hover': { color: '#64748b' }
          }}
          onClick={() => window.location.href = '/'}
        >
          EXIT
        </Button>
      </Box>
    </Box>
  );
}
