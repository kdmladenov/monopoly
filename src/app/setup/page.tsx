"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  AIDifficulty,
  AIStyle,
  ContinentId,
  PlayerType
} from "@/lib/game.types";
import {
  setBoard,
  setCurrentPlayerIndex,
  setPlayers,
  startGame
} from "@/lib/features/game/gameSlice";
import { BoardGenerator } from "@/lib/services/BoardGenerator";
import ContinentSelector from "@/components/setup/ContinentSelector";
import PlayerConfigurator from "@/components/setup/PlayerConfigurator";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack
} from "@mui/material";

export default function SetupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentPlayers = useSelector((state: RootState) => state.game.players);
  const [continent, setContinent] = useState(ContinentId.EUROPE);
  const boardGenerator = useMemo(() => new BoardGenerator(), []);

  const players = useMemo(
    () =>
      currentPlayers.map((player, index) => ({
        ...player,
        turnOrder: index
      })),
    [currentPlayers]
  );

  const addPlayer = () => {
    const nextIndex = players.length + 1;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex}`,
          name: `Player ${nextIndex}`,
          type: PlayerType.HUMAN,
          avatar: "token",
          color: nextIndex % 2 ? "#f97316" : "#38bdf8",
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex - 1
        }
      ])
    );
  };

  const addAIPlayer = () => {
    const nextIndex = players.length + 1;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex}`,
          name: `AI ${nextIndex}`,
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.INTERMEDIATE,
          aiStyle: AIStyle.BALANCED,
          avatar: "globe",
          color: nextIndex % 2 ? "#38bdf8" : "#a78bfa",
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex - 1
        }
      ])
    );
  };

  const updatePlayer = (
    playerId: string,
    patch: Partial<(typeof players)[number]>
  ) => {
    dispatch(
      setPlayers(
        players.map((player) =>
          player.id === playerId ? { ...player, ...patch } : player
        )
      )
    );
  };

  const removePlayer = (playerId: string) => {
    const nextPlayers = players
      .filter((player) => player.id !== playerId)
      .map((player, index) => ({
        ...player,
        turnOrder: index
      }));

    dispatch(setPlayers(nextPlayers));
  };

  const start = () => {
    const board = boardGenerator.generateBoard(continent);
    dispatch(setBoard(board));
    dispatch(setCurrentPlayerIndex(0));
    dispatch(startGame());
    router.push("/game");
  };

  return (
    <Box
      sx={{ minHeight: "100vh", py: 10, px: 3, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 8,
            bgcolor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 6
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: 2
                }}
              >
                SETUP
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900 }}>
                Configure your match
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              sx={{
                borderRadius: 99,
                px: 3,
                color: "white",
                borderColor: "rgba(255,255,255,0.2)"
              }}
            >
              Back home
            </Button>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
            <Box sx={{ flex: 1 }}>
              <ContinentSelector selected={continent} onSelect={setContinent} />
            </Box>
            <Box sx={{ flex: 1.5 }}>
              <PlayerConfigurator
                players={players}
                maxPlayers={4}
                onAddPlayer={addPlayer}
                onAddAIPlayer={addAIPlayer}
                onRemovePlayer={removePlayer}
                onUpdatePlayer={updatePlayer}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Selected continent:{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                {continent}
              </Box>
            </Typography>
            <Button
              onClick={start}
              variant="contained"
              size="large"
              sx={{ px: 6, py: 2, fontSize: "1.2rem", fontWeight: 700 }}
            >
              Launch game
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
