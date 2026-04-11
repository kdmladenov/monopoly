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
}

export default function LandActionDialog({
  open,
  onClose,
  square,
  player,
  enableAuctions,
  onBuy,
  onAuction
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "visible",
            bgcolor: "transparent",
            boxShadow: "none"
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
            flexShrink: 0
          }}
        >
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

          <Box sx={{ p: 3 }}>
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
        <Stack spacing={2} sx={{ mt: 10 }}>
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
              py: 2,
              px: 6,
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
                py: 2,
                px: 6,
                borderRadius: 2,
                "&:hover": { bgcolor: "#333" }
              }}
            >
              AUCTION
            </Button>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
