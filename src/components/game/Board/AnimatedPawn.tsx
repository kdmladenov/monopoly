'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/lib/game.types';
import { Box } from '@mui/material';
import PlayerPawn from './PlayerPawn';

interface AnimatedPawnProps {
  player: Player;
  allPlayers: Player[];
  getSquareGridArea: (pos: number) => any;
  animationSpeed: number;
}

const offsets = [
  'translate(-7.5px, -7.5px)',
  'translate(-2.5px, -2.5px)',
  'translate(2.5px, 2.5px)',
  'translate(7.5px, 7.5px)',
];

export default function AnimatedPawn({ 
  player, 
  allPlayers, 
  getSquareGridArea, 
  animationSpeed 
}: AnimatedPawnProps) {
  const [visualPosition, setVisualPosition] = useState(player.position);

  useEffect(() => {
    if (player.position === visualPosition) return;

    // Check for "Go To Jail" or direct teleports
    const distance = (player.position - visualPosition + 40) % 40;
    if (distance > 12) {
      // Teleport (Jail)
      setVisualPosition(player.position);
      return;
    }

    // Normal sliding movement
    // Treat animationSpeed as 'speed' (higher = faster), so duration = 1 / speed
    const baseDuration = (1 / animationSpeed);
    const stepDuration = (baseDuration * 1000) / 2;
    
    const interval = setInterval(() => {
      setVisualPosition((prev) => {
        const next = (prev + 1) % 40;
        if (next === player.position) {
          clearInterval(interval);
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [player.position, animationSpeed]);

  const { gridRow, gridColumn } = getSquareGridArea(visualPosition);
  
  // Calculate percentage positions based on the 1.5fr - 4x1fr - 1.5fr grid
  let left = 0;
  if (gridColumn === 1) left = 0;
  else if (gridColumn === 6) left = (5.5 / 7) * 100;
  else left = ((1.5 + (gridColumn - 2)) / 7) * 100;
  
  let top = 0;
  if (gridRow === 1) top = 0;
  else if (gridRow === 16) top = (15.5 / 17) * 100;
  else top = ((1.5 + (gridRow - 2)) / 17) * 100;

  const widthPc = (gridColumn === 1 || gridColumn === 6 ? 1.5/7 : 1/7) * 100;
  const heightPc = (gridRow === 1 || gridRow === 16 ? 1.5/17 : 1/17) * 100;

  const playersAtSamePos = allPlayers.filter(p => {
    // We compare with the visualPosition of THIS component
    // But other players might be at different visual positions.
    // Usually we want to know where they WILL be or where they are.
    // For simplicity, we check their actual state position, 
    // but the user said "at the same property at the same time".
    return p.position === visualPosition;
  });
  
  const isAlone = playersAtSamePos.length <= 1;
  const localIndex = playersAtSamePos.findIndex(p => p.id === player.id);
  
  // If alone, offset -1 (center). If stacked, use localIndex.
  const offsetIndex = isAlone ? -1 : localIndex;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${left + widthPc / 2}%`,
        top: `${top + heightPc / 2}%`,
        width: 28,
        height: 28,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Transition for the sliding movement
        transition: `all ${((1 / animationSpeed) / 2)}s ease-in-out`,
        zIndex: 100 + (player.turnOrder || 0),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <PlayerPawn player={player} offset={offsetIndex} />
        
        {/* Static Ground Shadow */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -3,
            width: 22,
            height: 8,
            bgcolor: 'rgba(0,0,0,0.4)',
            borderRadius: '50%',
            filter: 'blur(3px)',
            zIndex: -1,
          }}
        />
      </Box>
    </Box>
  );
}
