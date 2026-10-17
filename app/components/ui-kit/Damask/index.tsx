import {useId} from 'react';
import './style.scss';

interface DamaskProps {
  tile?: number;
  vignette?: boolean;
  className?: string;
}

// Original embroidery-inspired pattern, not a copy of the game's.
const Damask = ({tile = 72, vignette = true, className = ''}: DamaskProps) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`Damask ${vignette ? 'Damask--vignette' : ''} ${className}`} aria-hidden>
      <defs>
        <pattern id={`damask-${id}`} width={tile} height={tile} patternUnits="userSpaceOnUse" viewBox="0 0 72 72">
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            <polygon points="36,4 68,36 36,68 4,36"/>
            <polygon points="36,18 54,36 36,54 18,36"/>
            <path d="M33 30h6v3h3v6h-3v3h-6v-3h-3v-6h3z"/>
            <path d="M0 0l8 8M72 0l-8 8M0 72l8-8M72 72l-8-8"/>
            <path d="M36 0v4M36 68v4M0 36h4M68 36h4"/>
            <path d="M22 4l-4-4M50 4l4-4M22 68l-4 4M50 68l4 4"/>
            <path d="M8 18h6M11 15v6M58 18h6M61 15v6M8 54h6M11 51v6M58 54h6M61 51v6"/>
            <path d="M36 24l3 3-3 3-3-3zM36 42l3 3-3 3-3-3zM24 36l3-3 3 3-3 3zM42 36l3-3 3 3-3 3z"/>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#damask-${id})`}/>
    </svg>
  );
};

export default Damask;
