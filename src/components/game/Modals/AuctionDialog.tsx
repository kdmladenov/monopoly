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
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
            p: 0,
            overflow: "visible",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: 900,
          height: 520,
          borderRadius: 4,
          overflow: "hidden",
          border: "4px solid black",
          bgcolor: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Left: Property Card */}
        <Box
          sx={{
            width: 400,
            p: 3,
            display: "flex",
            flexDirection: "column",
            borderRight: "4px solid black",
            bgcolor: "#fff",
            color: "black",
          }}
        >
          <Box
            sx={{
              bgcolor: square.property?.color || "#fbbf24",
              py: 1.5,
              textAlign: "center",
              border: "3px solid black",
              mb: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, color: "black", letterSpacing: 0.5, textTransform: "capitalize" }}>
              {property.name.toLowerCase()}
            </Typography>
          </Box>

          <Stack spacing={0.5} sx={{ flexGrow: 1, color: "black" }}>
            {square.property ? (
              <Stack spacing={0.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 400, color: "black" }}>Land</Typography>
                  <Typography sx={{ fontSize: "1.6rem", fontWeight: 400, color: "black" }}>{square.property.rentStructure.base}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>One house</Typography>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property.rentStructure.house1}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Two houses</Typography>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property.rentStructure.house2}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Three houses</Typography>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property.rentStructure.house3}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Four houses</Typography>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property.rentStructure.house4}¤</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Five houses</Typography>
                  <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property.rentStructure.hotel}¤</Typography>
                </Box>
              </Stack>
            ) : (
                <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Rent (1 Terminal)</Typography>
                        <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.transportation?.rent.one}¤</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Rent (2 Terminals)</Typography>
                        <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.transportation?.rent.two}¤</Typography>
                    </Box>
                </Stack>
            )}
            <Typography variant="body1" sx={{ mt: 2, fontSize: "1.1rem", lineHeight: 1.2, color: "black", maxWidth: '90%' }}>
              If a player owns all the cities with the same color, landing rent will be double
            </Typography>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 1, color: "black" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "1.6rem", color: "black" }}>House price</Typography>
              <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{square.property?.housePrice || 0}¤</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "1.6rem", color: "black" }}>Mortgage value</Typography>
              <Typography sx={{ fontSize: "1.6rem", color: "black" }}>{property.mortgageValue}¤</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Right: Bidding Controls */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#000",
            color: "white",
            p: 4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top: Current High Bidder and History */}
          <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  border: "2px solid #ccc",
                  borderRadius: 2,
                  bgcolor: highestBidder?.color || "#d1d5db",
                  width: 110,
                  height: 110,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 90, color: "white" }} />
              </Paper>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                {activeAuction.highestBid.toLocaleString()}¤
              </Typography>
            </Box>

            {/* Bid History */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: "auto", 
              maxHeight: 180, 
            }}>
              {activeAuction.bidHistory.slice().reverse().map((bid, i) => (
                <Typography key={`bid-${bid.playerId}-${bid.amount}-${i}`} sx={{ fontSize: "1.3rem", textAlign: 'left', mb: 0.5 }}>
                  {bid.playerName} offers {bid.amount.toLocaleString()}¤
                </Typography>
              ))}
              {activeAuction.bidHistory.length === 0 && (
                <Typography sx={{ opacity: 0.5, fontStyle: 'italic' }}>No offers yet</Typography>
              )}
            </Box>
          </Box>

          {/* Middle: Current Player Turn */}
          <Box sx={{ mt: "auto", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: 'center' }}>
              <Typography variant="h4" sx={{ color: "#fbbf24", fontWeight: 500 }}>
                {currentBidder?.name}
              </Typography>
              <Typography variant="h4" sx={{ color: "#fbbf24", fontWeight: 500 }}>
                {bidAmount.toLocaleString()}¤
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => setBidAmount(m => Math.max(activeAuction.minimumBid, m - 100))} sx={{ color: '#666' }}>
                <ChevronLeftIcon sx={{ fontSize: 60 }} />
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
                  height: 4,
                  "& .MuiSlider-thumb": {
                    width: 28,
                    height: 28,
                    bgcolor: "white",
                    border: '1px solid black',
                  },
                  "& .MuiSlider-rail": {
                    opacity: 1,
                    bgcolor: '#333',
                  },
                  "& .MuiSlider-track": {
                    border: 'none',
                  },
                }}
              />
              <IconButton onClick={() => setBidAmount(m => Math.min(currentBidder?.money || 100000, m + 100))} sx={{ color: '#ccc' }}>
                <ChevronRightIcon sx={{ fontSize: 60 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Footer: Fold and Bid buttons */}
          <Box sx={{ display: "flex", justifyContent: 'space-between', mt: 1 }}>
            <Button
              onClick={handleFoldClick}
              sx={{
                color: "white",
                fontSize: "1.8rem",
                fontWeight: 400,
                textTransform: "none",
                p: 0,
                "&:hover": { bgcolor: "transparent", color: "#666" },
              }}
            >
              Fold
            </Button>
            <Button
              onClick={handleBidClick}
              sx={{
                color: "white",
                fontSize: "1.8rem",
                fontWeight: 400,
                textTransform: "none",
                p: 0,
                "&:hover": { bgcolor: "transparent", color: "#666" },
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
