import {useEffect, useState} from 'react';
import './style.scss';

// Screens are laid out at the game capture size (2510 × 1380); the whole stage is scaled to the window.
export const STAGE_W = 2510;
export const STAGE_H = 1380;

const useStageScale = () => {
  const [scale, setScale] = useState<number | null>(null);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
};

const Stage = ({className = '', children}: {className?: string; children: React.ReactNode}) => {
  const scale = useStageScale();
  return (
    <main className={`Screen ${className}`}>
      <div
        className="Screen-stage ui-film"
        style={{width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale ?? 1})`, visibility: scale ? 'visible' : 'hidden'}}
      >
        {children}
      </div>
    </main>
  );
};

export default Stage;
