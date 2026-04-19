import { AIStyle, Player, PlayerType } from '@/lib/game.types';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Select, 
  MenuItem, 
  Stack,
  Chip,
  InputBase
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function PlayerConfigurator({
  players,
  maxPlayers,
  onAddPlayer,
  onAddAIPlayer,
  onRemovePlayer,
  onUpdatePlayer,
}: PlayerConfiguratorProps) {
  const canAdd = players.length < maxPlayers;

  return (
    <Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* ... (header) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
           <Typography variant="h6" sx={{ fontWeight: 700 }}>Players</Typography>
        </Box>
        <Chip 
          label={`${players.length} / ${maxPlayers}`} 
          size="small" 
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700 }} 
        />
      </Box>

      <Stack spacing={1.5}>
        {players.map((player) => {
          const isSelf = player.id === 'player_1';
          const isAI = player.type === PlayerType.AI;
          const canEditName = isSelf || isAI;

          return (
            <Box
              key={player.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255,255,255,0.05)',
                p: 1.5,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: player.color, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <InputBase
                    value={player.name}
                    disabled={!canEditName}
                    onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
                    sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '0.9rem',
                      width: '100%',
                      '& .MuiInputBase-input': { 
                        py: 0,
                        cursor: canEditName ? 'text' : 'default',
                        '&.Mui-disabled': { WebkitTextFillColor: 'rgba(255,255,255,0.7)' }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                       {player.type === PlayerType.HUMAN ? 'HUMAN' : 'AI'}
                     </Typography>
                     {player.type === PlayerType.AI && (
                       <Select
                         size="small"
                         value={player.aiStyle ?? AIStyle.BALANCED}
                         onChange={(e) => onUpdatePlayer(player.id, { aiStyle: e.target.value as AIStyle })}
                         sx={{ 
                           ml: 1, 
                           height: 20, 
                           fontSize: '0.6rem', 
                           bgcolor: 'rgba(255,255,255,0.05)',
                           borderRadius: 0.5,
                           '& .MuiSelect-select': { py: 0, px: 1 }
                         }}
                         MenuProps={{
                           disablePortal: true,
                           sx: {
                             '& .MuiPaper-root': {
                               bgcolor: '#1e293b',
                               backgroundImage: 'none',
                               border: '1px solid rgba(255,255,255,0.1)'
                             }
                           }
                         }}
                       >
                         <MenuItem value={AIStyle.CAUTIOUS} sx={{ fontSize: '0.75rem' }}>Cautious</MenuItem>
                         <MenuItem value={AIStyle.BALANCED} sx={{ fontSize: '0.75rem' }}>Balanced</MenuItem>
                         <MenuItem value={AIStyle.AGGRESSIVE} sx={{ fontSize: '0.75rem' }}>Aggressive</MenuItem>
                       </Select>
                     )}
                  </Box>
                </Box>
              </Box>
              
              <IconButton 
                size="small" 
                onClick={() => onRemovePlayer(player.id)}
                disabled={isSelf} // Cannot remove self
                sx={{ 
                  ml: 1,
                  color: 'rgba(255,255,255,0.3)', 
                  '&:hover': { color: '#ef4444' },
                  '&.Mui-disabled': { opacity: 0 } 
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Stack>

      {canAdd && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={onAddPlayer}
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
          >
            Add Player
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={onAddAIPlayer}
            sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'primary.main', borderOpacity: 0.3, color: 'primary.light' }}
          >
            Add AI
          </Button>
        </Box>
      )}
    </Box>
  );
}
