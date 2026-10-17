import './style.scss';

interface PaintFlowProps {
  active: boolean;
  // splashX: left edge of the icon diamond; center: vertical middle of the row.
  splashX: number;
  center: number;
  fringe: {left: number; right: number; top: number};
  className?: string;
}

// Matched frame by frame to the game video; textures from scripts/ui-kit/extract/hover-flow.py.
const PaintFlow = ({active, splashX, center, fringe, className = ''}: PaintFlowProps) => {
  const vars = {
    '--splash-x': `${splashX}px`,
    '--center': `${center}px`,
    '--fringe-left': `${fringe.left}px`,
    '--fringe-right': `${fringe.right}px`,
    '--fringe-top': `${fringe.top}px`,
  } as React.CSSProperties;
  return (
    <div className={`PaintFlow ${active ? 'PaintFlow--active' : ''} ${className}`} style={vars} aria-hidden>
      <div className="PaintFlow-splash"/>
      <div className="PaintFlow-fringe">
        <div className="PaintFlow-layer PaintFlow-layer--a"/>
        <div className="PaintFlow-layer PaintFlow-layer--b"/>
      </div>
    </div>
  );
};

export default PaintFlow;
