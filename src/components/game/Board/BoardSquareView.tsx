import { BoardSquare, SquareType } from '@/lib/game.types';
import { Box, Typography, Paper } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import CasinoIcon from '@mui/icons-material/Casino';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'; // for clover/lottery
import BeachAccessIcon from '@mui/icons-material/BeachAccess'; // for palm tree
import GavelIcon from '@mui/icons-material/Gavel'; // for go to jail
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // for jail
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // for motorway
import SailingIcon from '@mui/icons-material/Sailing'; // for ferry
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface Props {
  square: BoardSquare;
}

export default function BoardSquareView({ square }: Props) {
  const pos = square.position;
  const isCorner = [0, 12, 20, 32].includes(pos);

  let side: 'bottom' | 'left' | 'top' | 'right' = 'bottom';
  if (pos >= 0 && pos <= 12) side = 'bottom';
  else if (pos > 12 && pos < 20) side = 'left';
  else if (pos >= 20 && pos <= 32) side = 'top';
  else if (pos > 32) side = 'right';

  // Determine flex direction and bar styling based on side
  const getLayoutStyles = () => {
    switch (side) {
      case 'left':
        return { 
          flexDirection: 'row-reverse',
          barStyle: { width: '22%', height: '100%', borderLeft: '1.5px solid black' }
        };
      case 'top':
        return { 
          flexDirection: 'column-reverse',
          barStyle: { height: '22%', width: '100%', borderTop: '1.5px solid black' }
        };
      case 'right':
        return { 
          flexDirection: 'row',
          barStyle: { width: '22%', height: '100%', borderRight: '1.5px solid black' }
        };
      case 'bottom':
      default:
        return { 
          flexDirection: 'column',
          barStyle: { height: '22%', width: '100%', borderBottom: '1.5px solid black' }
        };
    }
  };

  const { flexDirection, barStyle } = getLayoutStyles();

  const getIcon = () => {
    if (square.type === SquareType.TRANSPORTATION) {
      const tType = square.transportation?.type;
      if (tType === 'airport') return <FlightIcon sx={{ fontSize: '1.2rem', color: '#64748b' }} />;
      if (tType === 'motorway') return <DirectionsCarIcon sx={{ fontSize: '1.2rem', color: '#1e3a8a' }} />;
      if (tType === 'ferry') return <SailingIcon sx={{ fontSize: '1.2rem', color: '#1e3a8a' }} />;
    }
    
    if (square.type === SquareType.SPECIAL) {
      const sType = square.special?.type;
      if (sType === 'casino') return <CasinoIcon sx={{ fontSize: '1.2rem', color: '#ef4444' }} />;
      if (sType === 'lottery') return <LocalFloristIcon sx={{ fontSize: '1.2rem', color: '#22c55e' }} />;
      if (sType === 'tax') return <MonetizationOnIcon sx={{ fontSize: '1.2rem', color: '#92400e' }} />;
      if (sType === 'freeParking' || pos === 20) return <BeachAccessIcon sx={{ fontSize: '2rem', color: '#16a34a' }} />;
      if (sType === 'goToJail' || pos === 32) return <GavelIcon sx={{ fontSize: '2rem', color: '#1e293b' }} />;
      if (sType === 'jail' || pos === 12) return <SentimentVeryDissatisfiedIcon sx={{ fontSize: '2rem', color: '#1e293b' }} />;
      if (sType === 'start' || pos === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <PlayArrowIcon sx={{ fontSize: '1.5rem', color: '#16a34a' }} />
          <LocalAtmIcon sx={{ fontSize: '1rem', color: '#16a34a' }} />
        </Box>
      );
    }
    return null;
  };

  const name = square.property?.name || square.transportation?.name || square.special?.name || 'Square';
  const price = square.property?.price || square.transportation?.price || square.special?.amount;

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection,
        bgcolor: 'white',
        border: '1px solid black',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {square.type === SquareType.PROPERTY && square.property && (
        <Box
          sx={{
            bgcolor: square.property.color || '#ccc',
            ...barStyle
          }}
        />
      )}
      
      <Box sx={{ 
        p: 0.5, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'black', 
            fontWeight: 900, 
            fontSize: isCorner ? '0.75rem' : '0.6rem', 
            textAlign: 'center', 
            lineHeight: 1.1,
            mt: 0.2,
            maxWidth: '100%'
          }}
        >
          {name}
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getIcon()}
        </Box>

        {price !== undefined && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'black', 
              fontWeight: 800, 
              fontSize: '0.65rem',
              mb: 0.2
            }}
          >
            {price.toLocaleString()}¤
          </Typography>
        )}
      </Box>
    </Box>
  );
}
