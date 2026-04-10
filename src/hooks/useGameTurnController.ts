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
  endAuctionRound,
  placeAuctionBid,
  purchaseProperty,
  startAuction,
  resolveLandingEffect,
  sellHouse,
  unmortgageProperty,
  rollDice,
} from '@/lib/features/game/gameSlice';
import { selectSquareByPosition } from '@/lib/features/board/boardSelectors';
import { GamePhase, PlayerType, TurnPhase } from '@/lib/game.types';
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

    if (shouldSkipMovement(currentPlayer, game.phase)) {
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
  }, [currentPlayer, dispatch, finishLanding, game.board, game.phase]);

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
    if (!activeLandingSquare || activeLandingSquare.type !== 'property' || !activeLandingSquare.property) {
      return;
    }

    dispatch(startAuction({ propertyPosition: activeLandingSquare.position }));
    dispatch(addActivityLog(`Auction started for ${activeLandingSquare.property.name}.`));
  }, [activeLandingSquare, dispatch]);

  const handlePlaceAuctionBid = useCallback((amount: number) => {
    if (!currentPlayer || !activeLandingSquare || !activeLandingSquare.property) {
      return;
    }

    dispatch(
      placeAuctionBid({
        playerId: currentPlayer.id,
        propertyPosition: activeLandingSquare.position,
        amount,
      })
    );
    dispatch(addActivityLog(`${currentPlayer.name} bid ¤${amount}.`));
  }, [activeLandingSquare, currentPlayer, dispatch]);

  const handleEndAuctionRound = useCallback(() => {
    if (activeLandingSquare?.property) {
      dispatch(addActivityLog(`Auction round ended for ${activeLandingSquare.property.name}.`));
    }
    dispatch(endAuctionRound());
    if (activeLandingSquare?.property) {
      finishLanding(`Auction resolved for ${activeLandingSquare.property.name}.`);
    }
  }, [activeLandingSquare, dispatch, finishLanding]);

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
    handleEndAuctionRound,
    handleEndTurn,
    handleBuildHouse,
    handleSellHouse,
    handleMortgageProperty,
    handleUnmortgageProperty,
  };
}
