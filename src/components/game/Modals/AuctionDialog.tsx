"use client";

import {
  Dialog,
  Box,
  Typography,
  Button,
  Slider,
  Avatar,
  Stack,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { BoardSquare, Player, SquareType, AuctionBid } from "@/lib/game.types";
import { useState, useMemo, useEffect } from "react";
import PersonIcon from "@mui/icons-material/Person";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface Props {
  open: boolean;
  square: BoardSquare | undefined;
  players: Player[];
  activeAuction: {
    highestBid: number;
    highestBidderId: string | null;
    minimumBid: number;
    currentBidderIndex: number;
    participants: string[];
    bidHistory: AuctionBid[];
  } | null;
  onBid: (amount: number) => void;
  onFold: (playerId: string) => void;
}

export default function AuctionDialog({
  open,
  square,
  players,
  activeAuction,
  onBid,
  onFold,
}: Props) {
  const [bidAmount, setBidAmount] = useState(0);

  // Sync bidAmount when minimumBid changes (next turn)
  useEffect(() => {
    if (activeAuction) {
      setBidAmount(activeAuction.minimumBid);
    }
  }, [activeAuction?.minimumBid]);

  if (!square || !activeAuction) return null;

  const property = square.property || square.transportation;
  if (!property) return null;

  const currentBidderId = activeAuction.participants[activeAuction.currentBidderIndex];
  const currentBidder = players.find((p) => p.id === currentBidderId);
  const highestBidder = players.find((p) => p.id === activeAuction.highestBidderId);

  const handleBidClick = () => {
    onBid(bidAmount);
  };

  const handleFoldClick = () => {
    if (currentBidder) {
      onFold(currentBidder.id);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth={false}
      hideBackdrop={true}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            bgcolor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
            p: 0,
            overflow: { xs: "auto", sm: "visible" },
            maxHeight: '95vh'
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: { xs: 280, sm: 700 }, // Significantly narrower
          borderRadius: 2,
          overflow: "hidden",
          border: "3px solid black",
          bgcolor: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Left: Property Card */}
        <Box
          sx={{
            width: { xs: "100%", sm: 300 },
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            borderRight: { xs: "none", sm: "3px solid black" },
            borderBottom: { xs: "3px solid black", sm: "none" },
            bgcolor: "#fff",
            color: "black",
          }}
        >
          <Box
            sx={{
              bgcolor: square.property?.color || "#fbbf24",
              py: 0.8,
              textAlign: "center",
              border: "2px solid black",
              mb: 1.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: "black", letterSpacing: 0.5, textTransform: "uppercase", fontSize: '0.8rem' }}>
              {property.name}
            </Typography>
          </Box>

          <Stack spacing={0.4} sx={{ flexGrow: 1, color: "black" }}>
            {square.property ? (
              <Stack spacing={0.4}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>Land</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>{square.property.rentStructure.base}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>One house</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.property.rentStructure.house1}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Two houses</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.property.rentStructure.house2}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Three houses</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.property.rentStructure.house3}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Four houses</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.property.rentStructure.house4}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Five houses</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.property.rentStructure.hotel}¤</Typography>
                </Box>
              </Stack>
            ) : (
                <Stack spacing={0.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Rent (1 Terminal)</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.transportation?.rent.one}¤</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "black" }}>Rent (2 Terminals)</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "black" }}>{square.transportation?.rent.two}¤</Typography>
                    </Box>
                </Stack>
            )}
            <Typography variant="body2" sx={{ mt: 1, fontSize: "0.6rem", lineHeight: 1.1, color: "black", fontStyle: 'italic' }}>
              If a player owns all the cities with the same color, landing rent will be double
            </Typography>
          </Stack>

          <Stack spacing={0.4} sx={{ mt: 1, color: "black" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>House price</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>{square.property?.housePrice || 0}¤</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>Mortgage value</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "black" }}>{property.mortgageValue}¤</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Right: Bidding Controls */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#000",
            color: "white",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top: Current High Bidder and History */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 0.5,
                  border: "1px solid #ccc",
                  borderRadius: 1.5,
                  bgcolor: highestBidder?.color || "#d1d5db",
                  width: 50,
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: "white" }} />
              </Paper>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700, fontSize: '0.8rem' }}>
                {activeAuction.highestBid.toLocaleString()}¤
              </Typography>
            </Box>

            {/* Bid History */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: "auto", 
              maxHeight: 120, 
            }}>
              {activeAuction.bidHistory.slice().reverse().slice(0, 5).map((bid, i) => (
                <Typography key={`bid-${bid.playerId}-${bid.amount}-${i}`} sx={{ fontSize: "0.7rem", textAlign: 'left', mb: 0.2 }}>
                  {bid.playerName}: {bid.amount.toLocaleString()}¤
                </Typography>
              ))}
              {activeAuction.bidHistory.length === 0 && (
                <Typography sx={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.7rem' }}>No offers</Typography>
              )}
            </Box>
          </Box>

          {/* Middle: Current Player Turn */}
          <Box sx={{ mt: "auto", mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: 'center' }}>
              <Typography sx={{ color: "#fbbf24", fontWeight: 700, fontSize: '0.9rem' }}>
                {currentBidder?.name}
              </Typography>
              <Typography sx={{ color: "#fbbf24", fontWeight: 800, fontSize: '0.9rem' }}>
                {bidAmount.toLocaleString()}¤
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => setBidAmount(m => Math.max(activeAuction.minimumBid, m - 50))} sx={{ color: '#666', p: 0.2 }}>
                <ChevronLeftIcon sx={{ fontSize: 30 }} />
              </IconButton>
              <Slider
                value={bidAmount}
                min={activeAuction.minimumBid}
                max={currentBidder ? Math.min(currentBidder.money, activeAuction.highestBid + 5000) : 10000}
                step={10}
                onChange={(_, val) => setBidAmount(val as number)}
                sx={{
                  color: "#333",
                  flexGrow: 1,
                  height: 3,
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    bgcolor: "white",
                    border: '1px solid black',
                  },
                }}
              />
              <IconButton onClick={() => setBidAmount(m => Math.min(currentBidder?.money || 100000, m + 50))} sx={{ color: '#ccc', p: 0.2 }}>
                <ChevronRightIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Footer: Fold and Bid buttons */}
          <Box sx={{ display: "flex", justifyContent: 'space-between', mt: 1, gap: 2 }}>
            <Button
              onClick={handleFoldClick}
              fullWidth
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "#ef4444",
                fontSize: "0.9rem",
                fontWeight: 700,
                textTransform: "uppercase",
                py: 0.8,
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" },
              }}
            >
              Fold
            </Button>
            <Button
              onClick={handleBidClick}
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "#16a34a",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: 900,
                textTransform: "uppercase",
                py: 0.8,
                "&:hover": { bgcolor: "#15803d" },
              }}
            >
              Bid
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
