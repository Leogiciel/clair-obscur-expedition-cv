import './style.scss';

// Screens are laid out at the game capture size (2510 × 1380); the whole stage is scaled to the window.
export const STAGE_W = 2510;
export const STAGE_H = 1380;

// Run by root.tsx before the first paint and on every resize: the scale is a CSS variable, so the server-rendered
// stage shows at its size on the first frame instead of waiting for hydration (which delayed the first paint).
export const FIT_STAGE_SCRIPT = `(function(){var r=document.documentElement;function f(){r.style.setProperty('--stage-scale',Math.min(innerWidth/${STAGE_W},innerHeight/${STAGE_H}))}f();addEventListener('resize',f)})()`;

const Stage = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <main className={`Screen ${className}`}>
    <div
      className="Screen-stage ui-film"
      style={{
        width: STAGE_W,
        height: STAGE_H,
        transform: 'translate(-50%, -50%) scale(var(--stage-scale, 1))'
      }}
    >
      {children}
    </div>
  </main>
);

export default Stage;
