import { STAGE_H, STAGE_W, useFitStage } from './size';
import './style.scss';

interface StageProps {
  className?: string;
  // The picture behind the interface (character, petals): no text, so it keeps the plain zoom.
  backdrop?: React.ReactNode;
  children: React.ReactNode;
}

const Stage = ({ className = '', backdrop, children }: StageProps) => {
  useFitStage();
  const size = { width: STAGE_W, height: STAGE_H, margin: `${-STAGE_H / 2}px 0 0 ${-STAGE_W / 2}px` };
  return (
    <main className={`Screen ${className}`}>
      {backdrop && (
        <div className="Screen-stage Screen-stage--backdrop" style={size}>
          {backdrop}
        </div>
      )}
      <div className="Screen-stage Screen-stage--ui ui-film" style={size}>
        {children}
      </div>
    </main>
  );
};

export default Stage;
