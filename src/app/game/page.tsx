'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameBoard from '@/components/game/Board/GameBoard';
import PropertyActionPanel from '@/components/game/Modals/PropertyActionPanel';
import TurnSidebar from '@/components/game/UI/TurnSidebar';
import { useGameTurnController } from '@/hooks/useGameTurnController';
import { Box, Container, Typography, Paper, CircularProgress, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function GamePage() {
  const router = useRouter();
  const {
    game,
    currentPlayer,
    bankruptPlayers,
    activeLandingSquare,
    landingOutcomeMessage,
    handleRoll,
    handleBankruptcy,
    handleLandingAction,
    handleStartAuction,
    handlePlaceAuctionBid,
    handleEndAuctionRound,
    handleEndTurn,
    handleBuildHouse,
    handleSellHouse,
    handleMortgageProperty,
    handleUnmortgageProperty,
  } = useGameTurnController();

  useEffect(() => {
    if (!game || game.board.length === 0) {
      const timer = setTimeout(() => {
        router.push('/setup');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [game, router]);

  if (!game || game.board.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: 2 }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6">No game data found. Redirecting to setup...</Typography>
      </Box>
    );
  }

  const auctionNextBidderName = game.auction.active
    ? game.players.find((p) => p.id === game.auction.participants[game.auction.currentBidderIndex])?.name ?? null
    : null;

  return (
    <Box sx={{ height: '100vh', width: '100vw', bgcolor: '#94a3b8', display: 'flex', overflow: 'hidden' }}>
      {/* Main Board Area - Stretched to edges */}
      <Box sx={{ flexGrow: 1, height: '100vh', position: 'relative' }}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <GameBoard 
            board={game.board} 
            players={game.players} 
            lastDiceRoll={game.lastDiceRoll}
          />
        </Box>

        {/* Action Button (Info Icon) moved to a floating position or stay underneath */}
        <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
          <Tooltip
            title={
              <Box sx={{ p: 1, maxWidth: 420 }}>
                {landingOutcomeMessage && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fef3c7' }}>
                    <Typography variant="body2">{landingOutcomeMessage}</Typography>
                  </Paper>
                )}
                
                <PropertyActionPanel
                  board={game.board}
                  square={activeLandingSquare}
                  player={currentPlayer}
                  enableAuctions={game.settings.enableAuctions}
                  auctionNextBidderName={auctionNextBidderName}
                  onBuy={handleLandingAction}
                  onStartAuction={handleStartAuction}
                  onPlaceAuctionBid={handlePlaceAuctionBid}
                  onEndAuctionRound={handleEndAuctionRound}
                  onBuildHouse={handleBuildHouse}
                  onSellHouse={handleSellHouse}
                  onMortgageProperty={handleMortgageProperty}
                  onUnmortgageProperty={handleUnmortgageProperty}
                />
              </Box>
            }
            interactive
            placement="left"
          >
            <IconButton 
              sx={{ 
                bgcolor: 'rgba(251, 191, 36, 0.1)', 
                color: '#fcd34d',
                width: 48,
                height: 48,
                border: '1px solid rgba(251, 191, 36, 0.3)',
                boxShadow: 2,
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.2)' }
              }}
            >
              <InfoIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Sidebar Area - Fixed exactly as in image */}
      <Box sx={{ width: 140, height: '100vh', bgcolor: '#d1d5db', borderLeft: '1px solid #94a3b8' }}>
        <TurnSidebar
          game={game}
          currentPlayer={currentPlayer}
          bankruptPlayers={bankruptPlayers}
          onRoll={handleRoll}
          onEndTurn={handleEndTurn}
          onDeclareBankruptcy={handleBankruptcy}
        />
      </Box>
    </Box>
  );
}
