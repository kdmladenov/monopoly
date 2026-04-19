'use client';

import { ContinentId } from '@/lib/game.types';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Paper
} from '@mui/material';

const continents = [
  { id: ContinentId.WORLD, label: 'World (Default)', accent: '#6366f1' },
  { id: ContinentId.EUROPE, label: 'Europe', accent: '#3b82f6' },
  { id: ContinentId.ASIA, label: 'Asia', accent: '#f59e0b' },
  { id: ContinentId.AFRICA, label: 'Africa', accent: '#f97316' },
  { id: ContinentId.NORTH_AMERICA, label: 'North America', accent: '#10b981' },
  { id: ContinentId.SOUTH_AMERICA, label: 'South America', accent: '#8b5cf6' },
  { id: ContinentId.OCEANIA, label: 'Oceania', accent: '#06b6d4' },
  { id: ContinentId.CLASSIC, label: 'Classic Monopoly', accent: '#ef4444' },
];

interface ContinentSelectorProps {
  selected: ContinentId;
  onSelect: (continent: ContinentId) => void;
}

export default function ContinentSelector({ selected, onSelect }: ContinentSelectorProps) {
  return (
    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>

      <FormControl fullWidth variant="filled" sx={{ 
        bgcolor: 'rgba(255,255,255,0.05)', 
        borderRadius: 2,
        overflow: 'hidden',
        '& .MuiFilledInput-root': {
          bgcolor: 'transparent',
          '&:before, &:after': { display: 'none' },
          '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.08)' }
        }
      }}>
        <Select
          value={selected}
          onChange={(e) => onSelect(e.target.value as ContinentId)}
          displayEmpty
          sx={{ color: 'white', fontWeight: 600 }}
          MenuProps={{
            disablePortal: true, // Fix positioning in blurred/transformed containers
            sx: {
              '& .MuiPaper-root': {
                bgcolor: '#1e293b',
                backgroundImage: 'none',
                mt: 1,
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }
          }}
          renderValue={(selectedVal) => {
            const cont = continents.find(c => c.id === selectedVal);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cont?.accent }} />
                 {cont?.label}
              </Box>
            );
          }}
        >
          {continents.map((continent) => (
            <MenuItem 
              key={continent.id} 
              value={continent.id}
              sx={{ 
                py: 1.5, 
                gap: 2,
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: continent.accent }} />
              <Typography sx={{ fontWeight: 600 }}>{continent.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
