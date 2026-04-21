'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  Typography, 
  Button, 
  Stack,
  Paper
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import CasinoIcon from '@mui/icons-material/Casino';

interface Props {
  open: boolean;
  onPayFine: () => void;
  onRollForEscape: () => void;
  playerMoney: number;
  fineAmount: number;
}

export default function JailActionDialog({
  open,
  onPayFine,
  onRollForEscape,
  playerMoney,
  fineAmount,
}: Props) {
  const canPay = playerMoney >= fineAmount;

  return (
    <Dialog 
      open={open} 
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'visible',
            bgcolor: 'transparent',
            boxShadow: 'none',
          }
        }
      }}
    >
      <Box sx={{ p: 1 }}>
        <Paper
          elevation={24}
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '4px solid black',
            overflow: 'hidden',
            color: 'black',
            p: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                bgcolor: '#ef4444', 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto',
                border: '4px solid black',
                mb: 2,
                color: 'white'
              }}
            >
              <GavelIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>IN JAIL</Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#4b5563' }}>
              How do you want to get out?
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Button
              onClick={onPayFine}
              disabled={!canPay}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: 'black',
                color: 'white',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#333' },
                '&:disabled': { bgcolor: '#9ca3af' }
              }}
              startIcon={<GavelIcon />}
            >
              PAY FINE ({fineAmount})
            </Button>

            <Button
              onClick={onRollForEscape}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: 'white',
                color: 'black',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                border: '2px solid black',
                '&:hover': { bgcolor: '#f3f4f6' }
              }}
              startIcon={<CasinoIcon />}
            >
              ROLL FOR DOUBLES
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ display: 'block', mt: 3, textAlign: 'center', color: '#6b7280' }}>
            If you roll doubles, you move by that amount for free. Otherwise, you miss your turn.
          </Typography>
        </Paper>
      </Box>
    </Dialog>
  );
}
