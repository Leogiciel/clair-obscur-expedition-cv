import './style.scss';

// Textures from scripts/ui-kit/extract/diamond-card.py (1x px).
const PLATE_LEFT = 90; // plate starts 90px from the diamond's left edge
const DIAMOND = 178;
// Center (x, y) and half-diagonal of the diamond's hollow interior, in texture px.
const SLOT: [number, number, number] = [88.75, 88.2, 58];
const WIDTH = 623;
const HEIGHT = 198;

interface TextureDiamondCardProps {
  width?: number;
  height?: number;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureDiamondCard = ({width = WIDTH, height = HEIGHT, icon, className = '', style, children}: TextureDiamondCardProps) => {
  const [sx, sy, sr] = SLOT;
  const vars = {width, height, '--plate-left': `${PLATE_LEFT}px`, '--diamond': `${DIAMOND}px`, ...style} as React.CSSProperties;
  return (
    <div className={`TextureDiamondCard ${className}`} style={vars}>
      <div className="TextureDiamondCard-plate" aria-hidden/>
      <div className="TextureDiamondCard-content">{children}</div>
      <div className="TextureDiamondCard-diamond">
        {icon && (
          <div className="TextureDiamondCard-slot" style={{left: sx - sr, top: sy - sr, width: sr * 2, height: sr * 2}}>{icon}</div>
        )}
      </div>
    </div>
  );
};

interface DiamondCardDividerProps {
  className?: string;
  style?: React.CSSProperties;
}

export const DiamondCardDivider = ({className = '', style}: DiamondCardDividerProps) => (
  <div className={`DiamondCardDivider ${className}`} style={style} aria-hidden/>
);

export default TextureDiamondCard;
