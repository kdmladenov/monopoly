'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';

const highlights = [
  'Choose a continent and reshape the board',
  'Mix human and AI players in one session',
  'Build, trade, and outlast everyone else',
];

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', py: 10, px: 3, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 8,
            bgcolor: 'background.paper',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8, alignItems: 'center' }}>
            <Box sx={{ flex: 1.2 }}>
              <Stack spacing={4}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    letterSpacing: 4,
                    fontWeight: 800,
                  }}
                >
                  EUROPOLY
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                  A continent-spanning strategy game built for long, dramatic turns.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.2rem' }}>
                  Claim city groups, pressure opponents, and turn Europe into your personal empire. 
                  Featuring a custom 13x9 board layout and MUI-powered interface.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    component={Link}
                    href="/setup"
                    variant="contained"
                    size="large"
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                  >
                    Start setup
                  </Button>
                  <Button
                    component={Link}
                    href="/game"
                    variant="outlined"
                    size="large"
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    View game board
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 0.8, width: '100%' }}>
              <Paper
                sx={{
                  p: 4,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      FOUNDATION STATUS
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      MUI Migration Ready
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 99,
                      bgcolor: 'rgba(52, 211, 153, 0.15)',
                      color: '#a7f3d0',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    v1.0
                  </Box>
                </Box>
                <Stack spacing={2}>
                  {highlights.map((item) => (
                    <Paper
                      key={item}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
