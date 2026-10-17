import './style.scss';

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

const TextureStatsBar = ({variant = 'xp', value, maxValue, width, showValue = true, label, className = '', style}: TextureStatsBarProps) => {
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

export default TextureStatsBar;
