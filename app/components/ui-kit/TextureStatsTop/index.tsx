import './style.scss';

// Textures from scripts/ui-kit/extract/stats-top.py carry only the strokes; content is up to the page.

interface TextureStatsTopProps {
  // stats-backdrop.webp, rebuilt from the video by scripts/ui-kit/extract/stats-backdrop.py.
  backdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Frame texture 500×398 sits 8 px left and 18 px above the box (corner frays). 9-slice: 72 px top
// (rule + bevelled corner), 84 px right (corner + right post), 48 px left (faded rule start + left
// post), nothing at the bottom.
const TextureStatsTop = ({backdrop = true, className = '', style, children}: TextureStatsTopProps) => (
  <div className={`TextureStatsTop ${className}`} style={style}>
    {backdrop && (
      <div className="TextureStatsTop-backdrop" aria-hidden/>
    )}
    <div className="TextureStatsTop-tex" aria-hidden/>
    <div className="TextureStatsTop-content">{children}</div>
  </div>
);

export type TextureStatsBarVariant = 'xp' | 'plain';

// left/right: fixed caps (arrow + stop). track: margins of the inner rail the fill may occupy.
const BARS: Record<TextureStatsBarVariant, {
  src: string;
  width: number;
  height: number;
  left: number;
  right: number;
  track: [number, number];
}> = {
  xp: {src: '/ui/tex/stats-top-bar-xp.webp', width: 392, height: 30, left: 30, right: 22, track: [27, 21]},
  plain: {src: '/ui/tex/stats-top-bar.webp', width: 442, height: 30, left: 30, right: 22, track: [22, 21]},
};

interface TextureStatsBarProps {
  variant?: TextureStatsBarVariant;
  value: number;
  maxValue: number;
  width?: number;
  showValue?: boolean;
  label?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const TextureStatsBar = ({variant = 'xp', value, maxValue, width, showValue = true, label, className = '', style}: TextureStatsBarProps) => {
  const b = BARS[variant];
  const w = width ?? b.width;
  const ratio = maxValue > 0 ? Math.max(0, Math.min(1, value / maxValue)) : 0;
  const vars = {
    width: w,
    height: b.height,
    '--tex': `url('${b.src}')`,
    '--slice-left': b.left,
    '--slice-right': b.right,
    '--tex-left': `${b.left}px`,
    '--tex-right': `${b.right}px`,
    '--track-left': `${b.track[0]}px`,
    '--track-right': `${b.track[1]}px`,
    '--ratio': ratio,
    ...style,
  } as React.CSSProperties;
  return (
    <div className={`TextureStatsBar TextureStatsBar--${variant} ${className}`} style={vars}>
      {showValue && <div className="TextureStatsBar-value">{label ?? `${value} / ${maxValue}`}</div>}
      <div className="TextureStatsBar-tex" aria-hidden/>
      {ratio > 0 && <div className="TextureStatsBar-fill" aria-hidden/>}
    </div>
  );
};

export default TextureStatsTop;
