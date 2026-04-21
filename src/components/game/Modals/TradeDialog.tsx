"use client";

import {
  Dialog,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import { BoardSquare, Player } from "@/lib/game.types";
import { useMemo, useState } from "react";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonIcon from "@mui/icons-material/Person";
import PetsIcon from "@mui/icons-material/Pets";

interface Props {
  open: boolean;
  onClose: () => void;
  proposer: Player;
  target: Player;
  board: BoardSquare[];
  proposerProperties: string[];
  targetProperties: string[];
  balance: number; // Positive: Proposer pays Target. Negative: Target pays Proposer.
  onToggleProperty: (id: string, isProposer: boolean) => void;
  onUpdateBalance: (delta: number) => void;
  onConfirmDeal: () => Promise<{ accepted: boolean }>;
}

export default function TradeDialog({
  open,
  onClose,
  proposer,
  target,
  board,
  proposerProperties,
  targetProperties,
  balance,
  onToggleProperty,
  onUpdateBalance,
  onConfirmDeal
}: Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleToggle = (id: string, isProposer: boolean) => {
    setStatusMessage(null);
    onToggleProperty(id, isProposer);
  };

  const handleUpdateBalance = (delta: number) => {
    setStatusMessage(null);
    onUpdateBalance(delta);
  };

  const proposerOwned = useMemo(() => 
    board.filter(s => (s.property?.ownerId === proposer.id || s.transportation?.ownerId === proposer.id))
  , [proposer, board]);

  const targetOwned = useMemo(() => 
    board.filter(s => (s.property?.ownerId === target.id || s.transportation?.ownerId === target.id))
  , [target, board]);

  const handlePropose = async () => {
    const result = await onConfirmDeal();
    if (result.accepted) {
      setStatusMessage("DEAL ACCEPTED");
      // Optionally close after a delay? Rule says "footer should have message... and not closed automatically"
    } else {
      setStatusMessage("DEAL REJECTED");
    }
  };

  const renderPropertyTile = (s: BoardSquare, isProposer: boolean) => {
    const id = s.property?.id || s.transportation?.name || "";
    const name = s.property?.name || s.transportation?.name || "";
    const price = s.property?.price || s.transportation?.price || 0;
    const color = s.property?.color || "#333";
    const selected = isProposer ? proposerProperties.includes(id) : targetProperties.includes(id);
    const hasHouses = (s.property?.houses || 0) > 0;

    return (
      <Box
        key={id}
        onClick={() => !hasHouses && handleToggle(id, isProposer)}
        sx={{
          width: "45%",
          aspectRatio: "1/1",
          bgcolor: color,
          color: "white",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 1,
          cursor: hasHouses ? "not-allowed" : "pointer",
          border: selected ? "4px solid #fff" : "2px solid #000",
          boxShadow: selected ? 4 : 0,
          opacity: hasHouses ? 0.6 : 1,
          position: "relative"
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: "0.7rem", mb: 0.5 }}>
          {name.toUpperCase()}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {price}
        </Typography>
        {(s.property?.isMortgaged || s.transportation?.isMortgaged) && (
          <Box sx={{ position: "absolute", top: "40%", left: "10%", bgcolor: "red", color: "white", p: 0.2, fontWeight: 900, fontSize: "0.5rem", border: "1px solid white", transform: "rotate(-15deg)" }}>
            MORTGAGED
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            bgcolor: "#000",
            color: "white",
            p: 3,
            border: "3px solid #333"
          }
        }
      }}
    >
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", mb: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Paper sx={{ p: 1, bgcolor: proposer.color, borderRadius: 2, border: "3px solid #fff" }}>
                <PersonIcon sx={{ fontSize: 60, color: "white" }} />
              </Paper>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{proposer.name}</Typography>
            </Box>
            <SwapHorizIcon sx={{ fontSize: 40, color: "#9ca3af" }} />
            <Box sx={{ textAlign: "center" }}>
              <Paper sx={{ p: 1, bgcolor: target.color, borderRadius: 2, border: "3px solid #fff" }}>
                <PetsIcon sx={{ fontSize: 60, color: "white" }} />
              </Paper>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{target.name}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, height: 420 }}>
            {/* Proposer Field */}
            <Paper sx={{ flex: 1, bgcolor: "#b9d5ff", p: 2, borderRadius: 3, display: "flex", flexDirection: "column" }}>
              <Box sx={{ flexGrow: 1, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 1, alignContent: "flex-start" }}>
                {proposerOwned.map(s => renderPropertyTile(s, true))}
              </Box>
              <Box sx={{ mt: 2, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {balance > 0 && (
                  <Paper sx={{ p: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white", borderRadius: 2 }}>
                    <Box sx={{ bgcolor: "#22c55e", color: "white", p: 0.5, borderRadius: 1, fontWeight: 900 }}>$</Box>
                    <Typography sx={{ color: "black", fontWeight: 900, fontSize: "1.2rem" }}>{balance.toLocaleString()}</Typography>
                  </Paper>
                )}
              </Box>
            </Paper>

            <Box sx={{ display: "flex", alignItems: "center" }}>
               <SwapHorizIcon sx={{ fontSize: 30, color: "white" }} />
            </Box>

            {/* Target Field */}
            <Paper sx={{ flex: 1, bgcolor: "#ffc9c9", p: 2, borderRadius: 3, display: "flex", flexDirection: "column" }}>
              <Box sx={{ flexGrow: 1, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 1, alignContent: "flex-start" }}>
                {targetOwned.map(s => renderPropertyTile(s, false))}
              </Box>
              <Box sx={{ mt: 2, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {balance < 0 && (
                  <Paper sx={{ p: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white", borderRadius: 2 }}>
                    <Box sx={{ bgcolor: "#22c55e", color: "white", p: 0.5, borderRadius: 1, fontWeight: 900 }}>$</Box>
                    <Typography sx={{ color: "black", fontWeight: 900, fontSize: "1.2rem" }}>{Math.abs(balance).toLocaleString()}</Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Money Buttons Footer */}
          <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>CASH:</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={() => handleUpdateBalance(1000)} sx={{ bgcolor: "#333", minWidth: 60 }}>+1000</Button>
              <Button size="small" variant="contained" onClick={() => handleUpdateBalance(100)} sx={{ bgcolor: "#333", minWidth: 60 }}>+100</Button>
              <Button size="small" variant="contained" onClick={() => handleUpdateBalance(-100)} sx={{ bgcolor: "#333", minWidth: 60 }}>-100</Button>
              <Button size="small" variant="contained" onClick={() => handleUpdateBalance(-1000)} sx={{ bgcolor: "#333", minWidth: 60 }}>-1000</Button>
            </Stack>
            
            {statusMessage && (
               <Typography 
                 variant="h6" 
                 sx={{ 
                   ml: "auto", 
                   fontWeight: 900, 
                   color: statusMessage === "DEAL ACCEPTED" ? "#22c55e" : "#ef4444" 
                 }}
               >
                 {statusMessage}
               </Typography>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ width: 160, justifyContent: "center" }}>
          <Button
            onClick={handlePropose}
            variant="contained"
            sx={{
              bgcolor: "#22c55e",
              color: "white",
              fontWeight: 900,
              fontSize: "1.1rem",
              py: 2,
              borderRadius: 3,
              border: "3px solid #000",
              "&:hover": { bgcolor: "#16a34a" }
            }}
          >
            PROPOSE<br/>DEAL
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: "#ef4444",
              color: "white",
              fontWeight: 900,
              fontSize: "1.1rem",
              py: 2,
              borderRadius: 3,
              border: "3px solid #000",
              "&:hover": { bgcolor: "#dc2626" }
            }}
          >
            CANCEL
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
