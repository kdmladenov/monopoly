'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import {
  addActivityLog,
  buildHouse,
  decrementJailTurn,
  endTurn,
  declareBankruptcy,
  movePlayer,
  mortgageProperty,
  payRent,
  foldAuctionPlayer,
  placeAuctionBid,
  purchaseProperty,
  startAuction,
  resolveLandingEffect,
  sellHouse,
  unmortgageProperty,
  rollDice,
  payJailFine,
} from '@/lib/features/game/gameSlice';
import { selectSquareByPosition } from '@/lib/features/board/boardSelectors';
import { getAIDecision } from '@/lib/ai/auctionAI';
import { GamePhase, PlayerType, TurnPhase, AIStyle } from '@/lib/game.types';
import { AIAdvisor } from '@/lib/ai/aiAdvisor';
import { getLandingIntent } from '@/lib/turns/landingController';
import { getLandingOutcomeMessage } from '@/lib/turns/landingPresentation';
import { shouldSkipMovement } from '@/lib/turns/playerTurnController';

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export function useGameTurnController() {
  const dispatch = useDispatch<AppDispatch>();
  const game = useSelector((state: RootState) => state.game);
  const advisor = useMemo(() => new AIAdvisor(), []);
  const currentPlayer = game.players[game.currentPlayerIndex];
  const [lastLandingPosition, setLastLandingPosition] = useState<number | null>(null);

  const landingSquare = useSelector((state: RootState) =>
    lastLandingPosition === null ? undefined : selectSquareByPosition(state, lastLandingPosition)
  );

  const activeLandingSquare = useMemo(
    () => landingSquare ?? game.board[currentPlayer?.position ?? 0],
    [game.board, landingSquare, currentPlayer?.position]
  );

  const landingIntent = currentPlayer && activeLandingSquare
    ? getLandingIntent(activeLandingSquare, game.board, currentPlayer)
    : null;

  const finishLanding = useCallback((message?: string) => {
    if (message) {
      dispatch(addActivityLog(message));
    }
    dispatch(endTurn());
    setLastLandingPosition(null);
  }, [dispatch]);

  const handleRoll = useCallback(() => {
    if (!currentPlayer) {
      return;
    }

    if (currentPlayer.type === PlayerType.AI && shouldSkipMovement(currentPlayer, game.phase)) {
      dispatch(decrementJailTurn({ playerId: currentPlayer.id }));
      finishLanding(`${currentPlayer.name} is in jail and skips movement.`);
      return;
    }

    const die1 = randomDie();
    const die2 = randomDie();
    const total = die1 + die2;
    const player = currentPlayer;
    const boardSize = Math.max(game.board.length, 40);
    const newPosition = (player.position + total) % boardSize;
    const passedStart = player.position + total >= boardSize;
    const landedSquare = game.board[newPosition];

    dispatch(
      rollDice({
        die1,
        die2,
        total,
        isDouble: die1 === die2,
      })
    );

    dispatch(
      movePlayer({
        playerId: player.id,
        newPosition,
        passedStart,
      })
    );
    setLastLandingPosition(newPosition);
    const intent = getLandingIntent(landedSquare, game.board, player);

    switch (intent.kind) {
      case 'buy-property':
      case 'pay-rent':
      case 'special':
        dispatch(addActivityLog(intent.message));
        break;
      default:
        dispatch(addActivityLog(`${player.name} moved to square ${newPosition}.`));
        break;
    }
  }, [currentPlayer, dispatch, game.board, game.phase]);

  const handlePayJailFine = useCallback(() => {
    if (!currentPlayer || !currentPlayer.isInJail) return;
    dispatch(payJailFine({ playerId: currentPlayer.id, amount: 1000 }));
    dispatch(addActivityLog(`${currentPlayer.name} paid 1000¤ fine to leave jail.`));
  }, [currentPlayer, dispatch]);

  const handleRollForJailEscape = useCallback(() => {
    if (!currentPlayer || !currentPlayer.isInJail) return;
    
    const die1 = randomDie();
    const die2 = randomDie();
    const total = die1 + die2;
    const isDouble = die1 === die2;
    
    dispatch(rollDice({ die1, die2, total, isDouble }));
    
    if (isDouble) {
      dispatch(addActivityLog(`${currentPlayer.name} rolled doubles (${die1}, ${die2}) and escaped jail!`));
      const boardSize = Math.max(game.board.length, 40);
      const newPosition = (currentPlayer.position + total) % boardSize;
      const passedStart = currentPlayer.position + total >= boardSize;
      
      dispatch(movePlayer({ playerId: currentPlayer.id, newPosition, passedStart }));
    } else {
      dispatch(addActivityLog(`${currentPlayer.name} failed to roll doubles (${die1}, ${die2}) and stays in jail.`));
      dispatch(decrementJailTurn({ playerId: currentPlayer.id }));
      finishLanding();
    }
  }, [currentPlayer, dispatch, game.board.length, finishLanding]);

  const handleBankruptcy = () => {
    if (!currentPlayer) {
      return;
    }

    dispatch(declareBankruptcy({ playerId: currentPlayer.id }));
    finishLanding(`${currentPlayer.name} declared bankruptcy.`);
  };

  const handleEndTurn = useCallback(() => {
    dispatch(endTurn());
  }, [dispatch]);

  const handleLandingAction = useCallback(() => {
    if (!currentPlayer || !activeLandingSquare) {
      return;
    }

    const intent = getLandingIntent(activeLandingSquare, game.board, currentPlayer);

    switch (intent.kind) {
      case 'special':
        dispatch(resolveLandingEffect(intent.effect));
        finishLanding(intent.message);
        return;
      case 'pay-rent':
        dispatch(
          payRent({
            fromPlayerId: currentPlayer.id,
            toPlayerId: intent.toPlayerId,
            amount: intent.amount,
          })
        );
        finishLanding(intent.message);
        return;
      case 'buy-property':
        if (currentPlayer.money < intent.propertyPrice && game.settings.enableAuctions) {
          dispatch(startAuction({ propertyPosition: intent.propertyPosition }));
          dispatch(addActivityLog(`Auction started for ${intent.propertyName}.`));
          return;
        }
        dispatch(
          purchaseProperty({
            playerId: currentPlayer.id,
            propertyPosition: intent.propertyPosition,
          })
        );
        finishLanding(intent.message);
        return;
      default:
        return;
    }
  }, [activeLandingSquare, currentPlayer, dispatch, finishLanding, game.board, game.settings.enableAuctions]);

  const handleStartAuction = useCallback(() => {
    if (!activeLandingSquare) return;
    const prop = activeLandingSquare.property || activeLandingSquare.transportation;
    if (!prop) return;

    dispatch(startAuction({ propertyPosition: activeLandingSquare.position }));
    dispatch(addActivityLog(`Auction started for ${prop.name}.`));
  }, [activeLandingSquare, dispatch]);

  const handlePlaceAuctionBid = useCallback((amount: number) => {
    const currentBidderId = game.auction.participants[game.auction.currentBidderIndex];
    const bidder = game.players.find(p => p.id === currentBidderId);
    if (!bidder) return;

    dispatch(
      placeAuctionBid({
        playerId: bidder.id,
        amount,
      })
    );
    dispatch(addActivityLog(`${bidder.name} bid ${amount}¤.`));
  }, [dispatch, game.auction, game.players]);

  const handleFoldAuctionPlayer = useCallback((playerId: string) => {
    dispatch(foldAuctionPlayer({ playerId }));
    const p = game.players.find(player => player.id === playerId);
    dispatch(addActivityLog(`${p?.name} folded and left the auction.`));
  }, [dispatch, game.players]);

  // AI Auction logic
  useEffect(() => {
    if (!game.auction.active) return;
    
    const currentBidderId = game.auction.participants[game.auction.currentBidderIndex];
    const bidder = game.players.find(p => p.id === currentBidderId);
    
    if (bidder?.type === PlayerType.AI) {
      const waitTime = bidder.aiStyle === AIStyle.CAUTIOUS ? 2000 : bidder.aiStyle === AIStyle.BALANCED ? 1500 : 1000;
      
      const timeout = setTimeout(() => {
        const decision = getAIDecision(game, bidder);
        
        if (decision.type === 'bid') {
          handlePlaceAuctionBid(decision.amount);
        } else {
          handleFoldAuctionPlayer(bidder.id);
        }
      }, waitTime);
      
      return () => clearTimeout(timeout);
    }
  }, [game.auction, handlePlaceAuctionBid, handleFoldAuctionPlayer, game.players, game.board, game]);

  const handleBuildHouse = useCallback((propertyPosition: number) => {
    if (!currentPlayer) {
      return;
    }

    dispatch(
      buildHouse({
        playerId: currentPlayer.id,
        propertyPosition,
      })
    );
    finishLanding(`${currentPlayer.name} built a house.`);
  }, [currentPlayer, dispatch, finishLanding]);

  const handleSellHouse = useCallback((propertyPosition: number) => {
    if (!currentPlayer) {
      return;
    }

    dispatch(
      sellHouse({
        playerId: currentPlayer.id,
        propertyPosition,
      })
    );
    finishLanding(`${currentPlayer.name} sold a house.`);
  }, [currentPlayer, dispatch, finishLanding]);

  const handleMortgageProperty = useCallback((propertyPosition: number) => {
    if (!currentPlayer) {
      return;
    }

    dispatch(
      mortgageProperty({
        playerId: currentPlayer.id,
        propertyPosition,
      })
    );
    finishLanding(`${currentPlayer.name} mortgaged a property.`);
  }, [currentPlayer, dispatch, finishLanding]);

  const handleUnmortgageProperty = (propertyPosition: number) => {
    if (!currentPlayer) {
      return;
    }

    dispatch(
      unmortgageProperty({
        playerId: currentPlayer.id,
        propertyPosition,
      })
    );
    finishLanding(`${currentPlayer.name} unmortgaged a property.`);
  };

  useEffect(() => {
    if (!currentPlayer || currentPlayer.type !== PlayerType.HUMAN || game.phase !== GamePhase.PLAYING) {
      return;
    }

    if (game.turnPhase === TurnPhase.ACTION && landingIntent) {
      if (landingIntent.kind === 'special' || landingIntent.kind === 'pay-rent') {
        const timeout = setTimeout(() => {
          handleLandingAction();
        }, 1500); // 1.5s delay for human players to see the landing message

        return () => clearTimeout(timeout);
      }
    }
  }, [currentPlayer?.type, game.phase, game.turnPhase, landingIntent, handleLandingAction]);

  useEffect(() => {
    if (!currentPlayer || currentPlayer.type !== PlayerType.AI || game.phase !== GamePhase.PLAYING) {
      return;
    }

    if (game.turnPhase === TurnPhase.ROLL_DICE) {
      const timeout = setTimeout(() => {
        handleRoll();
      }, 250);

      return () => clearTimeout(timeout);
    }

    if (game.turnPhase === TurnPhase.ACTION && landingIntent) {
      const timeout = setTimeout(() => {
        handleLandingAction();
      }, 250);

      return () => clearTimeout(timeout);
    }

    if (game.turnPhase === TurnPhase.END_TURN) {
      const timeout = setTimeout(() => {
        const propertyDecision = advisor.decidePropertyAction(currentPlayer, game.board);
        if (propertyDecision?.action === 'build') {
          handleBuildHouse(propertyDecision.propertyPosition);
          return;
        }

        if (propertyDecision?.action === 'sell') {
          handleSellHouse(propertyDecision.propertyPosition);
          return;
        }

        if (propertyDecision?.action === 'mortgage') {
          handleMortgageProperty(propertyDecision.propertyPosition);
          return;
        }

        const buildDecision = advisor.decideBuilding(currentPlayer, game.board);
        if (buildDecision?.action === 'build') {
          handleBuildHouse(buildDecision.propertyPosition);
          return;
        }

        const emergencyDecision = advisor.decideEmergencyMove(currentPlayer, game.board);
        if (emergencyDecision?.action === 'sell') {
          handleSellHouse(emergencyDecision.propertyPosition);
          return;
        }

        if (emergencyDecision?.action === 'mortgage') {
          handleMortgageProperty(emergencyDecision.propertyPosition);
          return;
        }

        handleEndTurn();
      }, 250);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [
    advisor,
    currentPlayer,
    game.board,
    game.phase,
    game.turnPhase,
    landingIntent,
    handleBuildHouse,
    handleEndTurn,
    handleLandingAction,
    handleMortgageProperty,
    handleSellHouse,
    handleRoll,
  ]);

  return {
    game,
    currentPlayer,
    bankruptPlayers: useMemo(
      () => game.players.filter((player) => player.isBankrupt),
      [game.players]
    ),
    activeLandingSquare,
    landingIntent,
    landingOutcomeMessage: getLandingOutcomeMessage(landingIntent),
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
  };
}
