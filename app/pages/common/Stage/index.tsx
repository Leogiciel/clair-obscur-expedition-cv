import { STAGE_H, STAGE_W, useFitStage } from './size';
import './style.scss';

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
