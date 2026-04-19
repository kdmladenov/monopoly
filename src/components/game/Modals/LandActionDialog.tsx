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

  const handleClose = (event: any, reason: "backdropClick" | "escapeKeyDown") => {
    if (isLanding && (reason === "backdropClick" || reason === "escapeKeyDown")) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          alignItems: "flex-start",
          gap: 2,
          position: "relative"
        }}
      >
        {/* The Card */}
        <Paper
          elevation={24}
          sx={{
            width: 380,
            bgcolor: "white",
            borderRadius: 3,
            border: "4px solid black",
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
                  fontSize: "3rem",
                  textTransform: "uppercase",
                  transform: "rotate(-45deg)",
                  border: "4px solid #dc2626",
                  px: 2,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  letterSpacing: 2,
                  bgcolor: "white",
                  boxShadow: 4
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
              py: 2,
              textAlign: "center",
              borderBottom: "4px solid black"
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: 1, color: "white" }}
            >
              {name.toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ p: 3, bgcolor: contentBg }}>
            <Stack spacing={1}>
              {property ? (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Land</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.base}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">One house</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.house1}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Two houses</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.house2}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Three houses</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.house3}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Four houses</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.house4}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Five houses</Typography>
                    <Typography variant="h6">
                      {property.rentStructure.hotel}¤
                    </Typography>
                  </Box>
                </>
              ) : transportation ? (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Rent (1 Terminal)</Typography>
                    <Typography variant="h6">
                      {transportation.rent.one}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Rent (2 Terminals)</Typography>
                    <Typography variant="h6">
                      {transportation.rent.two}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Rent (3 Terminals)</Typography>
                    <Typography variant="h6">
                      {transportation.rent.three}¤
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Rent (4 Terminals)</Typography>
                    <Typography variant="h6">
                      {transportation.rent.four}¤
                    </Typography>
                  </Box>
                </>
              ) : null}
            </Stack>

            <Typography
              variant="body2"
              sx={{ my: 3, fontStyle: "italic", lineHeight: 1.2 }}
            >
              {property
                ? "If a player owns all the cities with the same color, landing rent will be double"
                : "Rent is based on the number of transportation terminals owned."}
            </Typography>

            <Divider sx={{ borderColor: "black", mb: 2 }} />

            <Stack spacing={1}>
              {property && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">House price</Typography>
                  <Typography variant="h6">{housePrice}¤</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Mortgage value</Typography>
                <Typography variant="h6">{mortgageValue}¤</Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* The Action Buttons */}
        <Stack spacing={2} sx={{ mt: 5, width: 220 }}>
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
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  py: 1.5,
                  borderRadius: 2,
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
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    py: 1.5,
                    borderRadius: 2,
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
                      sx={{ bgcolor: "black", fontWeight: 700 }}
                    >
                      BUILD HOUSE (+{property.housePrice}¤)
                    </Button>
                  )}
                  
                  {/* Sell House: Only if there are houses */}
                  {property.houses > 0 && (
                    <Button
                      onClick={() => onSellHouse?.(square.position)}
                      variant="contained"
                      sx={{ bgcolor: "black", fontWeight: 700 }}
                    >
                      SELL HOUSE (+{Math.floor(property.housePrice / 2)}¤)
                    </Button>
                  )}

                  {/* Mortgage: Only if no houses */}
                  {property.houses === 0 && (
                    <Button
                      onClick={() => onMortgage?.(square.position)}
                      variant="contained"
                      sx={{ bgcolor: "black", color: "white", fontWeight: 700 }}
                    >
                      MORTGAGE (+{property.mortgageValue}¤)
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => onUnmortgage?.(square.position)}
                  disabled={player.money < Math.ceil(property.mortgageValue * 1.1)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700 }}
                >
                  UNMORTGAGE (-{Math.ceil(property.mortgageValue * 1.1)}¤)
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
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700 }}
                >
                  MORTGAGE (+{transportation.mortgageValue}¤)
                </Button>
              ) : (
                <Button
                  onClick={() => onUnmortgage?.(square.position)}
                  disabled={player.money < Math.ceil(transportation.mortgageValue * 1.1)}
                  variant="contained"
                  sx={{ bgcolor: "black", color: "white", fontWeight: 700 }}
                >
                  UNMORTGAGE (-{Math.ceil(transportation.mortgageValue * 1.1)}¤)
                </Button>
              )}
            </>
          )}

          {/* Propose Deal: Only if owned by someone else */}
          {ownerId && ownerId !== player.id && (
            <Button
              onClick={() => onProposeDeal?.(ownerId)}
              variant="contained"
              sx={{ bgcolor: "black", color: "white", fontWeight: 700 }}
            >
              PROPOSE DEAL
            </Button>
          )}

          {!isLanding && (
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: "black",
                color: "black",
                fontWeight: 700,
                "&:hover": { borderColor: "#333", bgcolor: "rgba(0,0,0,0.05)" }
              }}
            >
              BACK
            </Button>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
