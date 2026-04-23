"use client";

import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Button
} from "@mui/material";
import { BoardSquare, Player, PlayerType } from "@/lib/game.types";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SyncIcon from "@mui/icons-material/Sync";
import PersonIcon from "@mui/icons-material/Person";
import PetsIcon from "@mui/icons-material/Pets";
import TrainIcon from "@mui/icons-material/Train";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface Props {
  open: boolean;
  onClose: () => void;
  proposer: Player;
  target: Player;
  board: BoardSquare[];
  proposerProperties: string[];
  targetProperties: string[];
  balance: number; 
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

  const proposerTradeItems = useMemo(() => 
    board.filter(s => {
      const id = s.property?.id || s.transportation?.name || "";
      return proposerProperties.includes(id);
    })
  , [proposerProperties, board]);

  const targetTradeItems = useMemo(() => 
    board.filter(s => {
      const id = s.property?.id || s.transportation?.name || "";
      return targetProperties.includes(id);
    })
  , [targetProperties, board]);

  const renderPropertyTile = (s: BoardSquare, isProposer: boolean) => {
    const id = s.property?.id || s.transportation?.name || "";
    const name = s.property?.name || s.transportation?.name || "PROPERTY";
    const price = s.property?.price || s.transportation?.price || 0;
    const color = s.property ? (s.property.color || "#333") : "#475569";

    return (
      <Box
        key={id}
        onClick={() => onToggleProperty(id, isProposer)}
        sx={{
          bgcolor: "white",
          borderRadius: "12px",
          width: "82px",
          height: "80px",
          display: "flex",
          flexDirection: "column",
          p: "4px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease-in-out",
          "&:hover": { transform: "scale(1.05)", boxShadow: "0 6px 15px rgba(0,0,0,0.2)" }
        }}
      >
        <Box sx={{ flex: 1, bgcolor: color, borderTopLeftRadius: "8px", borderTopRightRadius: "8px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, p: "4px 2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: color === "white" || color === "yellow" || color === "lightBlue" ? "black" : "white", fontSize: "10px", fontWeight: 800, textAlign: "center", lineHeight: 1.1 }}>
            {name}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "black", fontSize: "18px", fontWeight: 900 }}>
            {price}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      hideBackdrop
      sx={{
        pointerEvents: "none",
        '& .MuiDialog-paper': {
          pointerEvents: "auto",
          background: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          overflow: 'visible',
          margin: 1,
          mt: 4
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Box sx={{ position: "relative", width: "100%", maxWidth: 210, height: 550 }}>
              
                {/* Main Dialog Backgrounds */}
              <Box sx={{ 
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                display: "flex", gap: "4px"
              }}>
                {/* Left Half Glass Panel */}
                <Box sx={{ 
                  flex: 1, height: "100%", borderRadius: "24px 24px 0 24px", position: "relative", overflow: "hidden",
                  background: `color-mix(in srgb, ${proposer.color} 40%, rgba(0,0,0,0.3))`,
                  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 8px 24px rgba(255,255,255,0.5)"
                }}>
                  {/* Distinct Dark Header Block */}
                  <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "94px",
                    background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%), color-mix(in srgb, ${proposer.color} 80%, black)`,
                    boxShadow: "inset 0 6px 12px rgba(255,255,255,0.9), 0 4px 10px rgba(0,0,0,0.15)"
                  }} />
                  <Box sx={{ position: "absolute", top: "94px", bottom: 0, left: 0, right: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)" }} />
                </Box>
                {/* Right Half Glass Panel */}
                <Box sx={{ 
                  flex: 1, height: "100%", borderRadius: "24px 24px 24px 0", position: "relative", overflow: "hidden",
                  background: `color-mix(in srgb, ${target.color} 40%, rgba(0,0,0,0.3))`,
                  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 8px 24px rgba(255,255,255,0.5)"
                }}>
                  {/* Distinct Dark Header Block */}
                  <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "94px",
                    background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%), color-mix(in srgb, ${target.color} 80%, black)`,
                    boxShadow: "inset 0 6px 12px rgba(255,255,255,0.9), 0 4px 10px rgba(0,0,0,0.15)"
                  }} />
                  <Box sx={{ position: "absolute", top: "94px", bottom: 0, left: 0, right: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)" }} />
                </Box>
                
                {/* Fade Transition Connector at Bottom */}
                <Box sx={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  height: "170px",
                  borderRadius: "0 0 24px 24px",
                  background: `linear-gradient(90deg, color-mix(in srgb, ${proposer.color} 40%, rgba(0,0,0,0.3)) 0%, color-mix(in srgb, ${target.color} 40%, rgba(0,0,0,0.3)) 100%)`,
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
                  boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 8px 24px rgba(255,255,255,0.5)",
                  zIndex: 2,
                  pointerEvents: "none"
                }} />
              </Box>

                {/* Content Overlay */}
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column" }}>
                  
                  {/* Top: Property Lists */}
                  <Box sx={{ display: "flex", flex: 1, pt: 7, pb: 1, gap: "4px" }}>
                    {/* Left List */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box sx={{ height: "94px", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", pb: 1, mt: -7 }}>
                        <Typography sx={{ color: "white", fontWeight: 800, fontSize: "15px" }}>{proposer.name} (You)</Typography>
                      </Box>
                      <Box sx={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, mt: 1 }}>
                        {balance > 0 && (
                          <Typography sx={{ color: "#34d399", fontWeight: 800, fontSize: "16px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            +${balance.toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, overflowY: "auto", maxHeight: "290px", pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                        {proposerTradeItems.map(s => renderPropertyTile(s, true))}
                      </Box>
                    </Box>

                    {/* Right List */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box sx={{ height: "94px", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", pb: 1, mt: -7 }}>
                        <Typography sx={{ color: "white", fontWeight: 800, fontSize: "15px" }}>{target.name}</Typography>
                      </Box>
                      <Box sx={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, mt: 1 }}>
                        {balance < 0 && (
                          <Typography sx={{ color: "#34d399", fontWeight: 800, fontSize: "16px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            +${Math.abs(balance).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, overflowY: "auto", maxHeight: "290px", pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                        {targetTradeItems.map(s => renderPropertyTile(s, false))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Bottom: Cash & Actions */}
                  <Box sx={{ px: 1, pb: 2, pt: 1 }}>
                    <Stack spacing={1.5} sx={{ alignItems: "center", mt: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => onUpdateBalance(100)} sx={{ width: 44, height: 44, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }}}>
                          <AddIcon sx={{ color: "white", fontSize: 24 }} />
                        </IconButton>
                        <Box sx={{ width: 90, height: 44, bgcolor: "rgba(0,0,0,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ color: "white", fontSize: "18px", fontWeight: 700 }}>100</Typography>
                        </Box>
                        <IconButton onClick={() => onUpdateBalance(-100)} sx={{ width: 44, height: 44, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }}}>
                          <RemoveIcon sx={{ color: "white", fontSize: 24 }} />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => onUpdateBalance(1000)} sx={{ width: 44, height: 44, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }}}>
                          <AddIcon sx={{ color: "white", fontSize: 24 }} />
                        </IconButton>
                        <Box sx={{ width: 90, height: 44, bgcolor: "rgba(0,0,0,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ color: "white", fontSize: "18px", fontWeight: 700 }}>1000</Typography>
                        </Box>
                        <IconButton onClick={() => onUpdateBalance(-1000)} sx={{ width: 44, height: 44, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }}}>
                          <RemoveIcon sx={{ color: "white", fontSize: 24 }} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                      <Button
                        onClick={onClose}
                        variant="outlined"
                        fullWidth
                        sx={{
                          py: 1.5,
                          borderRadius: "30px",
                          borderColor: "rgba(255,255,255,0.4)",
                          borderWidth: "2px",
                          color: "white",
                          fontWeight: 800,
                          fontSize: "16px",
                          "&:hover": { borderWidth: "2px", borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                        }}
                      >
                        CANCEL
                      </Button>
                      <Button
                        onClick={onConfirmDeal}
                        variant="contained"
                        fullWidth
                        sx={{
                          py: 1.5,
                          borderRadius: "30px",
                          background: "linear-gradient(90deg, #34d399 0%, #10b981 100%)",
                          color: "white",
                          fontWeight: 800,
                          fontSize: "16px",
                          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                          "&:hover": { background: "linear-gradient(90deg, #10b981 0%, #059669 100%)" }
                        }}
                      >
                        PROPOSE
                      </Button>
                    </Stack>

                  </Box>
                </Box>

              {/* Central Swap Icon */}
              <Box sx={{ 
                position: "absolute", top: "48%", left: "50%", transform: "translate(-50%, -50%)",
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                opacity: 0.7
              }}>
                <SyncIcon sx={{ color: "white", fontSize: 16, opacity: 0.8 }} />
              </Box>

              {/* Top Avatars (Outside the hidden overflow) */}
              <Box sx={{ position: "absolute", top: -35, left: 0, right: 0, display: "flex", zIndex: 5 }}>
                {/* Left Avatar */}
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ p: "3px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 6px 15px rgba(0,0,0,0.5)" }}>
                    <Avatar sx={{ width: 50, height: 50, border: "2px solid white", bgcolor: proposer.color }}>
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Box>
                </Box>
                
                {/* Right Avatar */}
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ p: "3px", borderRadius: "50%", background: "linear-gradient(135deg, #d946ef 0%, #a21caf 100%)", boxShadow: "0 6px 15px rgba(0,0,0,0.5)" }}>
                    <Avatar sx={{ width: 50, height: 50, border: "2px solid white", bgcolor: target.color }}>
                      {target.type === PlayerType.AI ? <PetsIcon sx={{ fontSize: 28 }} /> : <PersonIcon sx={{ fontSize: 28 }} />}
                    </Avatar>
                  </Box>
                </Box>
              </Box>

            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
