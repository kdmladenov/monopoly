import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultGameSettings, initialGameState } from '@/lib/gameState';
import {
  BuildHousePayload,
  AIStyle,
  DiceRoll,
  GamePhase,
  GameSettings,
  GameState,
  MortgagePropertyPayload,
  LandingEffectPayload,
  MovePlayerPayload,
  SellHousePayload,
  TurnPhase,
} from '@/lib/game.types';

const gameSlice = createSlice({
  name: 'game',
  initialState: initialGameState,
  reducers: {
    startGame(state) {
      state.phase = GamePhase.PLAYING;
      state.turnPhase = TurnPhase.ROLL_DICE;
    },
    setBoard(state, action: PayloadAction<GameState['board']>) {
      state.board = action.payload;
    },
    setPlayers(state, action: PayloadAction<GameState['players']>) {
      state.players = action.payload;
    },
    setCurrentPlayerIndex(state, action: PayloadAction<number>) {
      state.currentPlayerIndex = action.payload;
    },
    startAuction(state, action: PayloadAction<{ propertyPosition: number }>) {
      state.auction = {
        propertyPosition: action.payload.propertyPosition,
        active: true,
        highestBid: 0,
        highestBidderId: null,
        minimumBid: 1,
        currentBidderIndex: state.currentPlayerIndex,
        participants: state.players.filter((player) => !player.isBankrupt).map((player) => player.id),
      };
      state.turnPhase = TurnPhase.END_TURN;
    },
    placeAuctionBid(
      state,
      action: PayloadAction<{ playerId: string; propertyPosition: number; amount: number }>
    ) {
      if (!state.auction.active || state.auction.propertyPosition !== action.payload.propertyPosition) {
        return;
      }

      if (state.auction.participants[state.auction.currentBidderIndex] !== action.payload.playerId) {
        return;
      }

      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player || player.money < action.payload.amount || action.payload.amount < state.auction.minimumBid) {
        return;
      }

      state.auction.highestBid = action.payload.amount;
      state.auction.highestBidderId = player.id;
      state.auction.minimumBid = action.payload.amount + 1;
      state.auction.currentBidderIndex = (state.auction.currentBidderIndex + 1) % state.auction.participants.length;
    },
    endAuctionRound(state) {
      if (!state.auction.active) {
        return;
      }

      const square = state.board.find((item) => item.position === state.auction.propertyPosition);
      const property = square?.property;
      if (!property || property.ownerId) {
        state.auction.active = false;
        state.turnPhase = TurnPhase.END_TURN;
        return;
      }

      const winner =
        state.players.find((player) => player.id === state.auction.highestBidderId) ??
        state.players.find(
          (player) => !player.isBankrupt && player.money >= (state.auction.highestBid || property.price)
        );

      if (!winner) {
        state.auction.active = false;
        state.turnPhase = TurnPhase.END_TURN;
        return;
      }

      const winningBid = state.auction.highestBid || property.price;
      if (winner.money < winningBid) {
        state.auction.active = false;
        state.turnPhase = TurnPhase.END_TURN;
        return;
      }

      winner.money -= winningBid;
      winner.ownedProperties.push(property.id);
      property.ownerId = winner.id;
      state.auction.highestBid = winningBid;
      state.auction.highestBidderId = winner.id;
      state.auction.active = false;
      state.turnPhase = TurnPhase.END_TURN;
    },
    resolveAuction(state) {
      if (!state.auction.active) {
        return;
      }

      const square = state.board.find((item) => item.position === state.auction.propertyPosition);
      const property = square?.property;
      if (!property || property.ownerId) {
        state.auction.active = false;
        return;
      }

      const eligiblePlayers = state.players.filter(
        (player) => !player.isBankrupt && player.money >= property.price
      );

      if (eligiblePlayers.length === 0) {
        state.auction.active = false;
        return;
      }

      const winner =
        eligiblePlayers.find((player) => player.id === state.auction.highestBidderId) ??
        eligiblePlayers.reduce((best, player) => {
          const styleWeight =
            player.aiStyle === AIStyle.AGGRESSIVE ? 3 : player.aiStyle === AIStyle.BALANCED ? 2 : 1;
          const bestStyleWeight =
            best.aiStyle === AIStyle.AGGRESSIVE ? 3 : best.aiStyle === AIStyle.BALANCED ? 2 : 1;
          const playerScore = player.money + styleWeight * 1000;
          const bestScore = best.money + bestStyleWeight * 1000;
          return playerScore > bestScore ? player : best;
        }, eligiblePlayers[0]);

      const winningBid = state.auction.highestBid || property.price;
      winner.money -= winningBid;
      winner.ownedProperties.push(property.id);
      property.ownerId = winner.id;
      state.auction.highestBid = winningBid;
      state.auction.highestBidderId = winner.id;
      state.auction.active = false;
      state.turnPhase = TurnPhase.END_TURN;
    },
    addActivityLog(state, action: PayloadAction<string>) {
      state.activityLog.unshift(action.payload);
      state.activityLog = state.activityLog.slice(0, 6);
    },
    rollDice(state, action: PayloadAction<DiceRoll>) {
      state.lastDiceRoll = action.payload;
      const player = state.players[state.currentPlayerIndex];
      if (!player) {
        state.turnPhase = TurnPhase.MOVE;
        return;
      }

      if (action.payload.isDouble) {
        player.consecutiveDoubles += 1;
        if (player.consecutiveDoubles >= 3) {
          player.consecutiveDoubles = 0;
          player.isInJail = true;
          player.jailTurns = 2;
          state.turnPhase = TurnPhase.END_TURN;
          return;
        }
      } else {
        player.consecutiveDoubles = 0;
      }

      state.turnPhase = TurnPhase.MOVE;
    },
    decrementJailTurn(state, action: PayloadAction<{ playerId: string }>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player || !player.isInJail) {
        return;
      }

      player.jailTurns = Math.max(0, player.jailTurns - 1);
      if (player.jailTurns === 0) {
        player.isInJail = false;
      }
    },
    payJailFine(state, action: PayloadAction<{ playerId: string; amount: number }>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player || !player.isInJail || player.money < action.payload.amount) {
        return;
      }

      player.money -= action.payload.amount;
      player.isInJail = false;
      player.jailTurns = 0;
      state.turnPhase = TurnPhase.ROLL_DICE;
    },
    movePlayer(state, action: PayloadAction<MovePlayerPayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player) {
        return;
      }

      player.position = action.payload.newPosition;
      if (action.payload.passedStart) {
        player.money += state.settings.passingStartBonus;
      }

      state.turnPhase = TurnPhase.ACTION;
    },
    purchaseProperty(
      state,
      action: PayloadAction<{ playerId: string; propertyPosition: number }>
    ) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      const square = state.board.find((item) => item.position === action.payload.propertyPosition);

      if (!player || !square || square.type !== 'property' || !square.property) {
        return;
      }

      if (square.property.ownerId || player.money < square.property.price) {
        return;
      }

      player.money -= square.property.price;
      player.ownedProperties.push(square.property.id);
      square.property.ownerId = player.id;
      state.turnPhase = TurnPhase.END_TURN;
    },
    payRent(
      state,
      action: PayloadAction<{ fromPlayerId: string; toPlayerId: string; amount: number }>
    ) {
      const fromPlayer = state.players.find((item) => item.id === action.payload.fromPlayerId);
      const toPlayer = state.players.find((item) => item.id === action.payload.toPlayerId);

      if (!fromPlayer || !toPlayer || fromPlayer.money < action.payload.amount) {
        return;
      }

      fromPlayer.money -= action.payload.amount;
      toPlayer.money += action.payload.amount;
      state.turnPhase = TurnPhase.END_TURN;
    },
    buildHouse(state, action: PayloadAction<BuildHousePayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      const square = state.board.find((item) => item.position === action.payload.propertyPosition);

      if (!player || !square || square.type !== 'property' || !square.property) {
        return;
      }

      const property = square.property;
      if (property.ownerId !== player.id || property.houses >= 5 || player.money < property.housePrice) {
        return;
      }

      const sameColorProperties = state.board.filter(
        (item) => item.type === 'property' && item.property?.color === property.color
      );
      const ownsColorSet = sameColorProperties.length > 0 && sameColorProperties.every(
        (item) => item.property?.ownerId === player.id
      );
      if (!ownsColorSet) {
        return;
      }

      const minHouses = Math.min(
        ...sameColorProperties.map((item) => item.property?.houses ?? 0)
      );
      if (property.houses > minHouses) {
        return;
      }

      player.money -= property.housePrice;
      property.houses += 1;
      state.turnPhase = TurnPhase.END_TURN;
    },
    sellHouse(state, action: PayloadAction<SellHousePayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      const square = state.board.find((item) => item.position === action.payload.propertyPosition);

      if (!player || !square || square.type !== 'property' || !square.property) {
        return;
      }

      const property = square.property;
      if (property.ownerId !== player.id || property.houses <= 0) {
        return;
      }

      property.houses -= 1;
      player.money += Math.floor(property.housePrice / 2);
      state.turnPhase = TurnPhase.END_TURN;
    },
    mortgageProperty(state, action: PayloadAction<MortgagePropertyPayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      const square = state.board.find((item) => item.position === action.payload.propertyPosition);

      if (!player || !square || square.type !== 'property' || !square.property) {
        return;
      }

      const property = square.property;
      if (property.ownerId !== player.id || property.houses > 0 || property.isMortgaged) {
        return;
      }

      property.isMortgaged = true;
      player.money += property.mortgageValue;
      state.turnPhase = TurnPhase.END_TURN;
    },
    unmortgageProperty(state, action: PayloadAction<MortgagePropertyPayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      const square = state.board.find((item) => item.position === action.payload.propertyPosition);

      if (!player || !square || square.type !== 'property' || !square.property) {
        return;
      }

      const property = square.property;
      if (property.ownerId !== player.id || !property.isMortgaged) {
        return;
      }

      const cost = Math.ceil(property.mortgageValue * 1.1);
      if (player.money < cost) {
        return;
      }

      property.isMortgaged = false;
      player.money -= cost;
      state.turnPhase = TurnPhase.END_TURN;
    },
    declareBankruptcy(state, action: PayloadAction<{ playerId: string }>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player) {
        return;
      }

      player.isBankrupt = true;
      player.money = 0;
      player.ownedProperties = [];

      state.board.forEach((square) => {
        if (square.property?.ownerId === player.id) {
          square.property.ownerId = null;
        }
        if (square.transportation?.ownerId === player.id) {
          square.transportation.ownerId = null;
        }
      });

      const activePlayers = state.players.filter((item) => !item.isBankrupt);
      if (activePlayers.length === 1) {
        state.phase = GamePhase.ENDED;
        state.winner = activePlayers[0].id;
      }
    },
    resolveLandingEffect(state, action: PayloadAction<LandingEffectPayload>) {
      const player = state.players.find((item) => item.id === action.payload.playerId);
      if (!player) {
        return;
      }

      switch (action.payload.effect) {
        case 'start':
          player.money += state.settings.passingStartBonus;
          break;
        case 'tax':
          player.money = Math.max(0, player.money - (action.payload.amount ?? 0));
          break;
        case 'goToJail':
          player.isInJail = true;
          player.jailTurns = 2;
          if (typeof action.payload.jailPosition === 'number') {
            player.position = action.payload.jailPosition;
          }
          break;
        case 'casinoWin':
        case 'lotteryWin':
          player.money += action.payload.amount ?? 0;
          break;
        case 'casinoLoss':
        case 'lotteryLoss':
          player.money = Math.max(0, player.money - (action.payload.amount ?? 0));
          break;
        case 'none':
          break;
      }

      state.turnPhase = TurnPhase.END_TURN;
    },
    endTurn(state) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const keepTurn = Boolean(state.lastDiceRoll?.isDouble) && !currentPlayer?.isInJail;

      if (!keepTurn) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % Math.max(state.players.length, 1);
      }

      state.turn += 1;
      state.turnPhase = TurnPhase.ROLL_DICE;
      state.lastDiceRoll = null;
    },
    declareWinner(state, action: PayloadAction<string>) {
      state.phase = GamePhase.ENDED;
      state.winner = action.payload;
    },
    updateSettings(state, action: PayloadAction<Partial<GameSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetGame() {
      return {
        ...initialGameState,
        settings: defaultGameSettings,
      };
    },
  },
});

export const {
  startGame,
  setBoard,
  setPlayers,
  setCurrentPlayerIndex,
  startAuction,
  placeAuctionBid,
  endAuctionRound,
  resolveAuction,
  addActivityLog,
  rollDice,
  decrementJailTurn,
  movePlayer,
  purchaseProperty,
  payRent,
  buildHouse,
  sellHouse,
  mortgageProperty,
  unmortgageProperty,
  declareBankruptcy,
  resolveLandingEffect,
  payJailFine,
  endTurn,
  declareWinner,
  updateSettings,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
