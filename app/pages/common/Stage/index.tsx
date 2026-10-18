import { useLayoutEffect } from 'react';

import './style.scss';

// Screens are laid out at the game capture size (2510 × 1380); the whole stage is scaled to the window.
export const STAGE_W = 2510;
export const STAGE_H = 1380;

// Run by root.tsx before the first paint and on every resize: the scale is a CSS variable, so the server-rendered
// stage shows at its size on the first frame instead of waiting for hydration (which delayed the first paint).
export const FIT_STAGE_SCRIPT = `(function(){var r=document.documentElement;function f(){r.style.setProperty('--stage-scale',Math.min(innerWidth/${STAGE_W},innerHeight/${STAGE_H}))}f();addEventListener('resize',f)})()`;

const fitStage = () =>
  document.documentElement.style.setProperty(
    '--stage-scale',
    String(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
  );

// Applied again once React owns the page: when hydration does not match the prerendered HTML (GitHub Pages), React
// rebuilds the document and drops the attribute the script set on <html>, leaving the stage at its full 2510 px.
const useFitStage = () =>
  useLayoutEffect(() => {
    fitStage();
    window.addEventListener('resize', fitStage);
    return () => window.removeEventListener('resize', fitStage);
  }, []);

const Stage = ({ className = '', children }: { className?: string; children: React.ReactNode }) => {
  useFitStage();
  return (
    <main className={`Screen ${className}`}>
      <div
        className="Screen-stage ui-film"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          // Zoom, not a scale transform: Safari rasterises a transformed layer at its unscaled size times the screen's
          // density, which took 1.1 GB of graphics memory on the start screen of an iPhone and got the tab killed;
          // zoomed, it is laid out and painted at the size it shows.
          zoom: 'var(--stage-scale, 1)'
        }}
      >
        {children}
      </div>
    </main>
  );
};

export default Stage;
