import './style.scss';

export type TexturePortraitsVariant = 'normal' | 'active';

type Pt = [number, number];

// Measured by scripts/ui-kit/extract/portraits.py (px, 1x). inner: inner rule polygon the portrait is
// clipped to. flag: the game's flag slot. The crest cannot stretch (slanted edges, bottom point), so
// it scales uniformly with `width`.
const TEXTURES: Record<
  TexturePortraitsVariant,
  {
    src: string;
    width: number;
    height: number;
    inner: Pt[];
    flag: [number, number, number, number];
  }
> = {
  normal: {
    src: '/ui/tex/portraits-frame.webp',
    width: 168,
    height: 114,
    inner: [
      [19, 17],
      [149, 17],
      [143, 62],
      [80, 94],
      [52, 85]
    ],
    flag: [106, 22, 38, 38]
  },
  active: {
    src: '/ui/tex/portraits-frame-active.webp',
    width: 252,
    height: 150,
    inner: [
      [44, 19],
      [222, 19],
      [218, 78],
      [126, 127],
      [92, 109]
    ],
    flag: [164, 30, 44, 50]
  }
};

interface TexturePortraitsProps {
  variant?: TexturePortraitsVariant;
  width?: number;
  portrait?: React.ReactNode;
  flag?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TexturePortraits = ({
  variant = 'normal',
  width,
  portrait,
  flag,
  className = '',
  style,
  children
}: TexturePortraitsProps) => {
  const t = TEXTURES[variant];
  const s = (width ?? t.width) / t.width;
  const clip = `polygon(${t.inner.map(([x, y]) => `${(x / t.width) * 100}% ${(y / t.height) * 100}%`).join(', ')})`;
  const [fx, fy, fw, fh] = t.flag;
  const vars = {
    width: t.width * s,
    height: t.height * s,
    '--tex': `url('${t.src}')`,
    ...style
  } as React.CSSProperties;
  return (
    <div className={`TexturePortraits TexturePortraits--${variant} ${className}`} style={vars}>
      <div className="TexturePortraits-tex" aria-hidden />
      {(portrait || children) && (
        <div className="TexturePortraits-inner" style={{ clipPath: clip }}>
          {portrait}
          {children}
        </div>
      )}
      {flag && (
        <div
          className="TexturePortraits-flag"
          style={{ left: fx * s, top: fy * s, width: fw * s, height: fh * s }}
        >
          {flag}
        </div>
      )}
    </div>
  );
};

export default TexturePortraits;
