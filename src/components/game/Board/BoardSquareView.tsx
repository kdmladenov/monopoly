import { BoardSquare, SquareType } from '@/lib/game.types';
import { Box, Typography } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import CasinoIcon from '@mui/icons-material/Casino';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'; 
import BeachAccessIcon from '@mui/icons-material/BeachAccess'; 
import GavelIcon from '@mui/icons-material/Gavel'; 
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; 
import SailingIcon from '@mui/icons-material/Sailing'; 
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrainIcon from '@mui/icons-material/Train';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'; // for chance
import InventoryIcon from '@mui/icons-material/Inventory'; // for chest

interface Props {
  square: BoardSquare;
  ownerColor?: string;
}

export default function BoardSquareView({ square, ownerColor }: Props) {
  const pos = square.position;
  const isCorner = [0, 5, 20, 25].includes(pos);

  // side logic for new image orientation (0=BL, 5=BR, 20=TR, 25=TL)
  let side: 'bottom' | 'right' | 'top' | 'left' = 'bottom';
  if (pos >= 0 && pos <= 5) side = 'bottom';
  else if (pos > 5 && pos < 20) side = 'left';
  else if (pos >= 20 && pos <= 25) side = 'top';
  else if (pos > 25) side = 'right';

  const getLayoutStyles = () => {
    switch (side) {
      case 'left':
        return { 
          flexDirection: 'row-reverse',
          barStyle: { width: 20, height: '100%', borderLeft: '1px solid black', flexShrink: 0 }
        };
      case 'top':
        return { 
          flexDirection: 'column-reverse',
          barStyle: { height: 20, width: '100%', borderTop: '1px solid black', flexShrink: 0 }
        };
      case 'right':
        return { 
          flexDirection: 'row',
          barStyle: { width: 20, height: '100%', borderRight: '1px solid black', flexShrink: 0 }
        };
      case 'bottom':
      default:
        return { 
          flexDirection: 'column',
          barStyle: { height: 20, width: '100%', borderBottom: '1px solid black', flexShrink: 0 }
        };
    }
  };

  const { flexDirection, barStyle } = getLayoutStyles();

  const getIcon = () => {
    const isSmall = side === 'left' || side === 'right';
    const iconSize = isSmall ? '1.2rem' : '1.8rem';

    if (square.type === SquareType.TRANSPORTATION) {
      return <TrainIcon sx={{ fontSize: iconSize, color: 'black' }} />;
    }
    
    if (square.type === SquareType.SPECIAL) {
      const sType = square.special?.type;
      if (sType === 'lottery') {
         if (square.special?.name.includes('CHEST')) return <InventoryIcon sx={{ fontSize: iconSize, color: '#0ea5e9' }} />;
         return <Typography sx={{ fontSize: isSmall ? '1.2rem' : '2rem', fontWeight: 900, color: '#ef4444' }}>?</Typography>;
      }
      if (sType === 'tax') {
        return <MonetizationOnIcon sx={{ fontSize: iconSize, color: square.special?.name.includes('INCOME') ? '#64748b' : '#eab308' }} />;
      }
      if (sType === 'freeParking' || pos === 20) return <DirectionsCarIcon sx={{ fontSize: '2rem', color: '#ef4444' }} />;
      if (sType === 'goToJail' || pos === 25) return <SentimentVeryDissatisfiedIcon sx={{ fontSize: isSmall ? '1.5rem' : '2.4rem', color: '#10b981' }} />;
      if (sType === 'jail' || pos === 5) return <SentimentVeryDissatisfiedIcon sx={{ fontSize: '2rem', color: 'black' }} />;
      if (sType === 'start' || pos === 0) return (
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: '1.4rem', lineHeight: 1 }}>GO</Typography>
           <Box sx={{ width: 30, height: 3, bgcolor: '#ef4444', position: 'relative', mt: 0.5, '&::after': { content: '""', position: 'absolute', right: -4, top: -3, borderLeft: '6px solid #ef4444', borderTop: '4.5px solid transparent', borderBottom: '4.5px solid transparent' } }} />
        </Box>
      );
    }
    return null;
  };

  const name = square.property?.name || square.transportation?.name || square.special?.name || '';
  const price = square.property?.price || square.transportation?.price || square.special?.amount;
  
  const classicColors: any = {
    brown: '#955436',
    lightBlue: '#aae0fa',
    purple: '#d93a96',
    orange: '#f7941d',
    red: '#ed1c24',
    yellow: '#fedd00',
    green: '#1fb35a',
    darkBlue: '#0072bb'
  };

  const barColor = square.property ? (classicColors[square.property.color || ''] || square.property.color) : '#ccc';
  const isMortgaged = (square.property?.isMortgaged) || (square.transportation?.isMortgaged);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection,
        bgcolor: ownerColor ? `${ownerColor}59` : '#c6e6d5', // 59 is approx 35% opacity
        border: '0.5px solid black',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        // Directional shadows to make center look lower
        boxShadow: side === 'bottom' ? 'inset 0 4px 6px -4px rgba(0,0,0,0.3)' : 
                   side === 'top' ? 'inset 0 -4px 6px -4px rgba(0,0,0,0.3)' :
                   side === 'left' ? 'inset -4px 0 6px -4px rgba(0,0,0,0.3)' :
                   'inset 4px 0 6px -4px rgba(0,0,0,0.3)',
        zIndex: 2,
      }}
    >
      {isMortgaged && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, bgcolor: 'rgba(255,255,255,0.4)' }}>
          <Typography sx={{ color: '#dc2626', fontWeight: 900, fontSize: '0.4rem', transform: 'rotate(-45deg)', border: '1px solid #dc2626', px: 0.3, bgcolor: 'white' }}>MORTGAGED</Typography>
        </Box>
      )}
      {square.type === SquareType.PROPERTY && square.property && (
        <Box sx={{ bgcolor: barColor, ...barStyle }} />
      )}
      
      <Box sx={{ 
        px: 0.2,
        py: 0.5, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        minWidth: 0,
        position: 'relative',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Typography 
          sx={{ 
            color: 'black', 
            fontWeight: 900, 
            fontSize: '0.55rem', // Totally unified size for ALL squares
            lineHeight: 1,
            width: '100%',
            fontFamily: '"Roboto Condensed", sans-serif',
            textTransform: 'uppercase',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}
        >
          {name}
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getIcon()}
        </Box>

        {price !== undefined && (
          <Typography 
            sx={{ 
              color: 'black', 
              fontWeight: 900, 
              fontSize: '0.55rem', // Unified size for all non-corner squares
              lineHeight: 1,
              fontFamily: '"Roboto Condensed", sans-serif'
            }}
          >
            {price.toLocaleString()}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
