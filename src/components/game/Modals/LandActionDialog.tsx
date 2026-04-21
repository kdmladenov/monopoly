"use client";

import {
  Dialog,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Paper
} from "@mui/material";
import { BoardSquare, Player, SquareType } from "@/lib/game.types";

interface Props {
  open: boolean;
  onClose: () => void;
  square: BoardSquare | undefined;
  player: Player | undefined;
  enableAuctions: boolean;
  onBuy: () => void;
  onAuction?: () => void;
  onMortgage?: (pos: number) => void;
  onUnmortgage?: (pos: number) => void;
  onBuildHouse?: (pos: number) => void;
  onSellHouse?: (pos: number) => void;
  isLanding?: boolean;
  board?: BoardSquare[];
  players?: Player[];
  onProposeDeal?: (ownerId: string) => void;
}

export default function LandActionDialog({
  open,
  onClose,
  square,
  player,
  enableAuctions,
  onBuy,
  onAuction,
  onMortgage,
  onUnmortgage,
  onBuildHouse,
  isLanding,
  board,
  players,
  onProposeDeal
}: Props) {
  if (!square || !player) return null;

  const isProperty = square.type === SquareType.PROPERTY && square.property;
  const isTransportation =
    square.type === SquareType.TRANSPORTATION && square.transportation;

  if (!isProperty && !isTransportation) return null;

  const property = isProperty ? square.property! : null;
  const transportation = isTransportation ? square.transportation! : null;

  const name = property?.name || transportation?.name || "";
  const color = property?.color || "#334155"; // Dark blue for transportation
  const price = property?.price || transportation?.price || 0;
  const housePrice = property?.housePrice || 0;
  const mortgageValue =
    property?.mortgageValue || transportation?.mortgageValue || 0;
  const isMortgaged = property?.isMortgaged || transportation?.isMortgaged;

  const ownerId = property?.ownerId || transportation?.ownerId;
  const owner = players?.find(p => p.id === ownerId);
  const contentBg = owner ? `${owner.color}4D` : "white";


  return (
    <Dialog
      open={open}
      onClose={onClose} // Always allow closing
      hideBackdrop={true} // Remove the overlay
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            overflow: "visible",
            bgcolor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
            elevation: 0
          }
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
          alignItems: { xs: "center", sm: "flex-start" },
          gap: 2,
          p: 2,
          position: "relative",
          maxWidth: "100vw",
          boxSizing: "border-box"
        }}
      >
        {/* The Card */}
        <Paper
          elevation={24}
          sx={{
            width: { xs: 260, sm: 300 }, // Even smaller card
            bgcolor: "white",
            borderRadius: 2,
            border: "3px solid black",
            overflow: "hidden",
            color: "black",
            flexShrink: 0,
            position: "relative"
          }}
        >
          {isMortgaged && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                pointerEvents: "none",
                bgcolor: "rgba(255, 255, 255, 0.4)"
              }}
            >
              <Typography
                sx={{
                  color: "#dc2626",
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  textTransform: "uppercase",
                  transform: "rotate(-45deg)",
                  border: "2px solid #dc2626",
                  px: 1,
                  borderRadius: 1,
                  whiteSpace: "nowrap",
                  letterSpacing: 1,
                  bgcolor: "white",
                  boxShadow: 2
                }}
              >
                MORTGAGED
              </Typography>
            </Box>
          )}
          {/* Header */}
          <Box
            sx={{
              bgcolor: color,
              py: 1, // Smaller header
              textAlign: "center",
              borderBottom: "3px solid black"
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, letterSpacing: 1, color: "white", fontSize: '1.2rem' }}
            >
              {name.toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: contentBg }}>
            <Stack spacing={0.5}>
              {property ? (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Land</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {property.rentStructure.base}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>One house</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {property.rentStructure.house1}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Two houses</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {property.rentStructure.house2}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Three houses</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {property.rentStructure.house3}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Four houses</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {property.rentStructure.house4}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Five houses</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {property.rentStructure.hotel}
                    </Typography>
                  </Box>
                </>
              ) : transportation ? (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Rent (1 Terminal)</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {transportation.rent.one}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Rent (2 Terminals)</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {transportation.rent.two}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Rent (3 Terminals)</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {transportation.rent.three}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>Rent (4 Terminals)</Typography>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {transportation.rent.four}
                    </Typography>
                  </Box>
                </>
              ) : null}
            </Stack>

            <Typography
              sx={{ my: 1.5, fontStyle: "italic", lineHeight: 1.1, fontSize: '0.6rem' }}
            >
              {property
                ? "If a player owns all the cities with the same color, landing rent will be double"
                : "Rent is based on the number of transportation terminals owned."}
            </Typography>

            <Divider sx={{ borderColor: "black", mb: 1 }} />

            <Stack spacing={0.5}>
              {property && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>House price</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{housePrice}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Mortgage value</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{mortgageValue}</Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* The Action Buttons */}
        <Stack spacing={1} sx={{ mt: { xs: 0, sm: 5 }, width: { xs: 240, sm: 180 } }}>
          {/* Buy/Auction only if landed and unowned */}
          {isLanding && !property?.ownerId && !transportation?.ownerId && (
            <>
              <Button
                onClick={() => {
                  onBuy();
                  onClose();
                }}
                variant="contained"
                sx={{
                  bgcolor: "black",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 900,
                  py: 1,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#333" }
                }}
              >
                BUY
              </Button>

              {enableAuctions && (
                <Button
                  onClick={() => {
                    onAuction?.();
                    onClose();
                  }}
                  variant="contained"
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 900,
                    py: 1,
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: "#333" }
                  }}
                >
                  AUCTION
                </Button>
              )}
            </>
          )}

          {/* Player-owned Property Actions */}
          {property?.ownerId === player.id && (
            <>
              {!property.isMortgaged ? (
                <>
                  {/* Build House: Only if owns full color group */}
                  {(board && (
                    board.filter(b => b.property?.color === property.color).every(b => b.property?.ownerId === player.id)
                  )) && (
                    <Button
                      onClick={() => onBuildHouse?.(square.position)}
                      disabled={player.money < property.housePrice || property.houses >= 5}
                      variant="contained"
                      sx={{ bgcolor: "black", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                    >
                      BUILD HOUSE (+{property.housePrice})
                    </Button>
                  )}
                  
                  {/* Sell House: Only if there are houses */}
                  {property.houses > 0 && (
                    <Button
                      onClick={() => onSellHouse?.(square.position)}
                      variant="contained"
                      sx={{ bgcolor: "black", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                    >
                      SELL HOUSE (+{Math.floor(property.housePrice / 2)})
                    </Button>
                  )}

                  {/* Mortgage: Only if no houses */}
                  {property.houses === 0 && (
                    <Button
                      onClick={() => onMortgage?.(square.position)}
                      variant="contained"
                      sx={{ bgcolor: "black", color: "white", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                    >
                      MORTGAGE (+{property.mortgageValue})
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => onUnmortgage?.(square.position)}
                  disabled={player.money < Math.ceil(property.mortgageValue * 1.1)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                >
                  UNMORTGAGE (-{Math.ceil(property.mortgageValue * 1.1)})
                </Button>
              )}
            </>
          )}

          {/* Player-owned Transportation Actions */}
          {transportation?.ownerId === player.id && (
            <>
              {!transportation.isMortgaged ? (
                <Button
                  onClick={() => onMortgage?.(square.position)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                >
                  MORTGAGE (+{transportation.mortgageValue})
                </Button>
              ) : (
                <Button
                  onClick={() => onUnmortgage?.(square.position)}
                  disabled={player.money < Math.ceil(transportation.mortgageValue * 1.1)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
                >
                  UNMORTGAGE (-{Math.ceil(transportation.mortgageValue * 1.1)})
                </Button>
              )}
            </>
          )}

          {/* Propose Deal: Only if owned by someone else */}
          {ownerId && ownerId !== player.id && (
            <Button
              onClick={() => onProposeDeal?.(ownerId)}
              variant="contained"
              sx={{ bgcolor: "black", color: "white", fontWeight: 700, fontSize: '0.8rem', py: 0.8 }}
            >
              PROPOSE DEAL
            </Button>
          )}

        </Stack>
      </Box>
    </Dialog>
  );
}
