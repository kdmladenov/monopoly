'use client';

import { GameState, Player } from '@/lib/game.types';
import { canEndTurn, canRoll } from '@/lib/turns/turnController';
import { Box, Paper, Typography, Button, Avatar } from '@mui/material';

import { useDispatch } from 'react-redux';
import { toggleHistoryLog } from '@/lib/features/notifications/notificationsSlice';
import HistoryIcon from '@mui/icons-material/History';
import { IconButton, Tooltip } from '@mui/material';

import { NotificationBell } from '@/components/notifications/NotificationBell';

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
  const dispatch = useDispatch();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#d1d5db' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid #94a3b8', display: 'flex', justifyContent: 'center', gap: 1 }}>
        <NotificationBell />
        <Tooltip title="Match History">
          <IconButton onClick={() => dispatch(toggleHistoryLog())} sx={{ border: '2px solid #94a3b8', color: '#1e293b' }}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>
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
        {[...game.players]
          .sort((a, b) => {
            // Move AI to top, Human to bottom
            if (a.type === 'ai' && b.type === 'human') return -1;
            if (a.type === 'human' && b.type === 'ai') return 1;
            return 0;
          })
          .map((player) => {
            const isActive = player.id === currentPlayer?.id;
            const isHuman = player.type === 'human';
            
            return (
              <Box key={player.id} sx={{ textAlign: 'center', mb: isHuman ? 2 : 1, mt: isHuman ? 1 : 0 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#1e293b', 
                    fontWeight: 900, 
                    fontSize: isHuman ? '1rem' : '0.85rem',
                    mb: 0.25 
                  }}
                >
                  {player.name}
                </Typography>
                <Paper
                  elevation={isActive ? 6 : (isHuman ? 3 : 1)}
                  sx={{
                    p: isHuman ? 1.5 : 0.75,
                    bgcolor: 'white',
                    borderRadius: isHuman ? 3 : 2,
                    border: `${isHuman ? 4 : 3}px solid ${player.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scale(1.05)' : (isHuman ? 'scale(1.02)' : 'none'),
                    boxShadow: isActive 
                      ? `0 0 15px ${player.color}66` 
                      : (isHuman ? `0 4px 10px ${player.color}22` : 'none'),
                    width: isHuman ? '90%' : 'auto',
                    mx: 'auto'
                  }}
                >
                  <Box
                    sx={{
                      width: isHuman ? 90 : 70,
                      height: isHuman ? 90 : 70,
                      bgcolor: `${player.color}11`,
                      borderRadius: isHuman ? 2 : 1.5,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography 
                      variant={isHuman ? "h2" : "h3"} 
                      sx={{ opacity: 0.3, fontWeight: 900, color: player.color }}
                    >
                      {player.name[0]}
                    </Typography>
                  </Box>
                  <Typography 
                    variant={isHuman ? "h5" : "h6"} 
                    sx={{ 
                      mt: 1, 
                      color: '#16a34a', 
                      fontWeight: 900,
                      fontSize: isHuman ? '1.4rem' : '1.1rem' 
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
