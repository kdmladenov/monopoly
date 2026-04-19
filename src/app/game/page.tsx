'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameBoard from '@/components/game/Board/GameBoard';
import PropertyActionPanel from '@/components/game/Modals/PropertyActionPanel';
import TurnSidebar from '@/components/game/UI/TurnSidebar';
import { useGameTurnController } from '@/hooks/useGameTurnController';
import { Box, Container, Typography, Paper, CircularProgress, IconButton, Tooltip, Dialog } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LandActionDialog from '@/components/game/Modals/LandActionDialog';
import JailActionDialog from '@/components/game/Modals/JailActionDialog';
import { PlayerType, TurnPhase, AIStyle, Player } from '@/lib/game.types';
import { useState, useCallback, forwardRef, useMemo } from 'react';
import TradeDialog from '@/components/game/Modals/TradeDialog';
import AuctionDialog from '@/components/game/Modals/AuctionDialog';
import { useDispatch } from 'react-redux';
import { executeTrade, addActivityLog } from '@/lib/features/game/gameSlice';
import { canRoll, canEndTurn } from '@/lib/turns/turnController';

const TooltipChild = forwardRef<HTMLSpanElement, any>((props, ref) => {
  const { interactive, ...other } = props;
  return <span ref={ref} {...other} />;
});

export default function GamePage() {
  const router = useRouter();
  const dispatch = useDispatch();
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
    handleEndTurn,
    handleBuildHouse,
    handleSellHouse,
    handleMortgageProperty,
    handleUnmortgageProperty,
    handlePayJailFine,
    handleRollForJailEscape,
    handleFoldAuctionPlayer,
    landingIntent,
  } = useGameTurnController();

  const [isLandDialogOpen, setIsLandDialogOpen] = useState(false);
  const [isJailDialogOpen, setIsJailDialogOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [inspectedSquarePosition, setInspectedSquarePosition] = useState<number | null>(null);
  const [tradeData, setTradeData] = useState<{ 
    open: boolean; 
    proposer: Player | null; 
    target: Player | null;
    proposerProps: string[];
    targetProps: string[];
    balance: number;
  }>({
    open: false,
    proposer: null,
    target: null,
    proposerProps: [],
    targetProps: [],
    balance: 0
  });

  const handleToggleTradeProperty = useCallback((id: string, isProposer: boolean) => {
    setTradeData(prev => {
      const field = isProposer ? 'proposerProps' : 'targetProps';
      const opposite = isProposer ? 'targetProps' : 'proposerProps';
      const currentList = prev[field];
      const has = currentList.includes(id);
      
      return {
        ...prev,
        [field]: has ? currentList.filter(i => i !== id) : [...currentList, id],
        [opposite]: prev[opposite].filter(i => i !== id)
      };
    });
  }, []);

  const handleSquareClick = useCallback((pos: number) => {
    const square = game.board[pos];
    if (tradeData.open && square && tradeData.proposer && tradeData.target) {
      const propId = square.property?.id || square.transportation?.name;
      if (!propId) return;
      
      const houses = square.property?.houses || 0;
      if (houses > 0) return; // Cannot trade properties with houses

      if (square.property?.ownerId === tradeData.proposer.id || square.transportation?.ownerId === tradeData.proposer.id) {
        handleToggleTradeProperty(propId, true);
      } else if (square.property?.ownerId === tradeData.target.id || square.transportation?.ownerId === tradeData.target.id) {
        handleToggleTradeProperty(propId, false);
      }
      return;
    }
    setInspectedSquarePosition(pos);
  }, [tradeData, game.board, handleToggleTradeProperty]);

  const inspectedSquare = inspectedSquarePosition !== null ? game.board[inspectedSquarePosition] : null;
  const auctionSquare = useMemo(() => 
    game.board.find(s => s.position === game.auction.propertyPosition)
  , [game.board, game.auction.propertyPosition]);

  useEffect(() => {
    if (
      game.turnPhase === TurnPhase.ROLL_DICE &&
      currentPlayer?.type === PlayerType.HUMAN &&
      currentPlayer.isInJail
    ) {
      setIsJailDialogOpen(true);
    } else {
      setIsJailDialogOpen(false);
    }
  }, [game.turnPhase, currentPlayer?.type, currentPlayer?.isInJail]);

  useEffect(() => {
    if (
      game.turnPhase === TurnPhase.ACTION &&
      currentPlayer?.type === PlayerType.HUMAN &&
      landingIntent?.kind === 'buy-property'
    ) {
      setIsLandDialogOpen(true);
    } else {
      setIsLandDialogOpen(false);
    }
  }, [game.turnPhase, currentPlayer?.type, landingIntent?.kind]);

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
            onSquareClick={handleSquareClick}
            onRollDice={handleRoll}
            onEndTurn={handleEndTurn}
            onShowInfo={() => setIsOverviewOpen(true)}
            canRoll={canRoll(game.turnPhase, game.phase)}
            canEndTurn={canEndTurn(game.turnPhase)}
          />
        </Box>

        <Box 
          onClick={() => setIsOverviewOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            right: 0, 
            width: 30, 
            height: 30, 
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': { opacity: 0.9, transform: 'scale(1.1)' },
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30">
            <path d="M 30 0 L 30 30 L 0 30 Z" fill="#fcd34d" fillOpacity="0.8" />
            <text x="21" y="26" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily='"Roboto Condensed", sans-serif'>i</text>
          </svg>
        </Box>

        {/* Overview Dialog triggered by GameBoard center button */}
        <Dialog 
          open={isOverviewOpen} 
          onClose={() => setIsOverviewOpen(false)}
          slotProps={{ 
            paper: { 
              sx: { 
                bgcolor: '#0f172a', 
                border: '1px solid rgba(251, 191, 36, 0.3)', 
                color: 'white',
                maxWidth: 'calc(100vw - 32px)',
                width: 360,
                m: 2
              } 
            } 
          }}
        >
          <Box sx={{ p: 1.5, width: '100%', boxSizing: 'border-box' }}>
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
              onBuildHouse={handleBuildHouse}
              onSellHouse={handleSellHouse}
              onMortgageProperty={handleMortgageProperty}
              onUnmortgageProperty={handleUnmortgageProperty}
            />
          </Box>
        </Dialog>

        <LandActionDialog
          open={isLandDialogOpen || inspectedSquarePosition !== null}
          onClose={() => {
            setIsLandDialogOpen(false);
            setInspectedSquarePosition(null);
          }}
          square={inspectedSquare ?? activeLandingSquare}
          player={currentPlayer}
          board={game.board}
          players={game.players}
          isLanding={isLandDialogOpen && inspectedSquarePosition === null}
          enableAuctions={game.settings.enableAuctions}
          onBuy={handleLandingAction}
          onAuction={handleStartAuction}
          onMortgage={handleMortgageProperty}
          onUnmortgage={handleUnmortgageProperty}
          onBuildHouse={handleBuildHouse}
          onSellHouse={handleSellHouse}
          onProposeDeal={(ownerId) => {
            const owner = game.players.find(p => p.id === ownerId);
            const sq = inspectedSquare ?? activeLandingSquare;
            if (owner && currentPlayer && sq) {
              const propId = sq.property?.id || sq.transportation?.name;
              setTradeData({ 
                open: true, 
                proposer: currentPlayer, 
                target: owner,
                proposerProps: [],
                targetProps: propId ? [propId] : [],
                balance: 0
              });
              setIsLandDialogOpen(false);
              setInspectedSquarePosition(null);
            }
          }}
        />

        {tradeData.proposer && tradeData.target && (
          <TradeDialog
            open={tradeData.open}
            onClose={() => setTradeData(prev => ({ ...prev, open: false }))}
            proposer={tradeData.proposer}
            target={tradeData.target}
            board={game.board}
            proposerProperties={tradeData.proposerProps}
            targetProperties={tradeData.targetProps}
            balance={tradeData.balance}
            onToggleProperty={handleToggleTradeProperty}
            onUpdateBalance={(delta) => {
              setTradeData(prev => {
                const newBalance = prev.balance + delta;
                if (newBalance > 0 && prev.proposer && prev.proposer.money < newBalance) return prev;
                if (newBalance < 0 && prev.target && prev.target.money < Math.abs(newBalance)) return prev;
                return { ...prev, balance: newBalance };
              });
            }}
            onConfirmDeal={async () => {
              const { proposer, target, proposerProps, targetProps, balance } = tradeData;
              if (!proposer || !target) return { accepted: false };
              const pOffer = { money: balance > 0 ? balance : 0, propertyIds: proposerProps };
              const tOffer = { money: balance < 0 ? Math.abs(balance) : 0, propertyIds: targetProps };
              const calculateValue = (offer: any) => {
                let val = offer.money;
                offer.propertyIds.forEach((id: string) => {
                  const s = game.board.find(s => s.property?.id === id || s.transportation?.name === id);
                  if (s?.property) val += s.property.price;
                  else if (s?.transportation) val += s.transportation.price;
                });
                return val;
              };
              const pVal = calculateValue(pOffer);
              const tVal = calculateValue(tOffer);
              if (target.type === PlayerType.AI) {
                const multiplier = target.aiStyle === AIStyle.AGGRESSIVE ? 1.0 : target.aiStyle === AIStyle.BALANCED ? 1.2 : 1.4;
                if (pVal >= tVal * multiplier) {
                  dispatch(executeTrade({ proposerId: proposer.id, targetId: target.id, proposerOffer: pOffer, targetOffer: tOffer }));
                  dispatch(addActivityLog(`${proposer.name} traded with ${target.name}!`));
                  return { accepted: true };
                } else {
                  dispatch(addActivityLog(`${target.name} rejected the deal.`));
                  return { accepted: false };
                }
              } else {
                 dispatch(executeTrade({ proposerId: proposer.id, targetId: target.id, proposerOffer: pOffer, targetOffer: tOffer }));
                 return { accepted: true };
              }
            }}
          />
        )}

        <AuctionDialog
          open={game.auction.active}
          square={auctionSquare}
          players={game.players}
          activeAuction={game.auction}
          onBid={handlePlaceAuctionBid}
          onFold={handleFoldAuctionPlayer}
        />

        <JailActionDialog
          open={isJailDialogOpen}
          onPayFine={handlePayJailFine}
          onRollForEscape={handleRollForJailEscape}
          playerMoney={currentPlayer?.money ?? 0}
          fineAmount={1000}
        />
      </Box>
    </Box>
  );
}
