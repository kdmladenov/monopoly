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
  startGame,
  updateSettings
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
  Stack,
  Slider
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentPlayers = useSelector((state: RootState) => state.game.players);
  const [continent, setContinent] = useState(ContinentId.WORLD);
  const boardGenerator = useMemo(() => new BoardGenerator(), []);

  const players = useMemo(
    () =>
      currentPlayers.map((player, index) => ({
        ...player,
        turnOrder: index
      })),
    [currentPlayers]
  );

  const PLAYER_COLORS = ["#FF8A00", "#00D1FF", "#00FF85", "#B000FF"];

  const addPlayer = () => {
    const nextIndex = players.length;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex + 1}`,
          name: `Player ${nextIndex + 1}`,
          type: PlayerType.HUMAN,
          avatar: "token",
          color: PLAYER_COLORS[nextIndex] || "#ffffff",
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex
        }
      ])
    );
  };

  const addAIPlayer = () => {
    const nextIndex = players.length;
    dispatch(
      setPlayers([
        ...players,
        {
          id: `player_${nextIndex + 1}`,
          name: `AI ${nextIndex + 1}`,
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.INTERMEDIATE,
          aiStyle: AIStyle.BALANCED,
          avatar: "globe",
          color: PLAYER_COLORS[nextIndex] || "#ffffff",
          money: 40000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: nextIndex
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
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 6 },
        px: 2,
        bgcolor: "#0f172a"
      }} // Darker, cleaner bg
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 }, // Much less padding
            borderRadius: 4, // Softer corners
            bgcolor: "rgba(30, 41, 59, 0.7)", // Glassmorphism-lite
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1
            }}
          >
            {/* Header removed */}
          </Box>

          <Stack direction="column" spacing={3}>
            <Box>
              <ContinentSelector selected={continent} onSelect={setContinent} />
            </Box>
            <Box>
              <PlayerConfigurator
                players={players}
                maxPlayers={4}
                onAddPlayer={addPlayer}
                onAddAIPlayer={addAIPlayer}
                onRemovePlayer={removePlayer}
                onUpdatePlayer={updatePlayer}
              />
            </Box>
            
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 1, alignItems: 'center' }}>
                <SpeedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Animation Speed</Typography>
              </Stack>
              <Slider
                size="small"
                value={useSelector((state: RootState) => state.game.settings.animationSpeed)}
                min={0.2}
                max={4.5}
                step={0.1}
                marks={[
                  { value: 0.5, label: 'Slow' },
                  { value: 2.0, label: 'Normal' },
                  { value: 4.0, label: 'Fast' }
                ]}
                onChange={(_, value) => dispatch(updateSettings({ animationSpeed: value as number }))}
                valueLabelDisplay="auto"
                sx={{ 
                  ml: 1, 
                  width: '95%',
                  '& .MuiSlider-markLabel': { 
                    fontSize: '0.65rem', 
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 700
                  }
                }}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.8rem" }}
            >
              Current Theme:{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                {continent.toUpperCase()}
              </Box>
            </Typography>
            <Button
              onClick={start}
              variant="contained"
              disabled={players.length < 2}
              fullWidth={{ xs: true, sm: false } as any}
              sx={{
                px: 5,
                py: 1.2,
                fontSize: "1rem",
                fontWeight: 800,
                borderRadius: 3,
                boxShadow: players.length < 2 ? 'none' : "0 8px 16px rgba(59, 130, 246, 0.2)"
              }}
            >
              PLAY
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
