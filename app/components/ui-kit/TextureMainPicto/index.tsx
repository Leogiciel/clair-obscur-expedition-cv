import { publicUrl } from '~/publicUrl';

import './style.scss';

export type TextureMainPictoVariant = 'filled' | 'empty';

// Measured by scripts/ui-kit/extract/main-pictos.py, px at 1x from the texture's top-left corner.
// left/right: fixed parts of the 3-slice. center: plate midline. text: x where the text starts.
// aside: distance from the right edge to the "Level" column axis.
const TEXTURES: Record<
  TextureMainPictoVariant,
  {
    src: string;
    width: number;
    height: number;
    left: number;
    right: number;
    center: number;
    text: number;
    aside: number;
  }
> = {
  filled: {
    src: publicUrl('ui/tex/main-pictos-filled.webp'),
    width: 512,
    height: 113,
    left: 182,
    right: 210,
    center: 55,
    text: 115,
    aside: 89
  },
  empty: {
    src: publicUrl('ui/tex/main-pictos-empty.webp'),
    width: 568,
    height: 119,
    left: 158,
    right: 290,
    center: 59,
    text: 140,
    aside: 89
  }
};

// Filled plate diamond: center (57.5, 56.5), usable interior ±28 px (the rule lies beyond).
const ICON = { left: 29.5, top: 28.5, size: 56 };

interface TextureMainPictoProps {
  variant?: TextureMainPictoVariant;
  width?: number;
  icon?: React.ReactNode;
  level?: React.ReactNode;
  levelLabel?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureMainPicto = ({
  variant = 'filled',
  width,
  icon,
  level,
  levelLabel = 'Level',
  className = '',
  style,
  children
}: TextureMainPictoProps) => {
  const t = TEXTURES[variant];
  const w = Math.max(width ?? t.width, t.left + t.right);
  const vars = {
    width: w,
    height: t.height,
    '--tex': `url('${t.src}')`,
    '--tex-left': `${t.left}px`,
    '--tex-right': `${t.right}px`,
    '--slice-left': t.left,
    '--slice-right': t.right,
    '--center': `${t.center}px`,
    '--text': `${t.text}px`,
    '--aside': `${t.aside}px`,
    ...style
  } as React.CSSProperties;
  const filled = variant === 'filled';
  return (
    <div className={`TextureMainPicto TextureMainPicto--${variant} ${className}`} style={vars}>
      <div className="TextureMainPicto-tex" aria-hidden />
      {filled && icon && (
        <div
          className="TextureMainPicto-icon"
          style={{ left: ICON.left, top: ICON.top, width: ICON.size, height: ICON.size }}
        >
          {icon}
        </div>
      )}
      <div className="TextureMainPicto-name">{children ?? (filled ? null : '–')}</div>
      {filled && level !== undefined && (
        <div className="TextureMainPicto-aside">
          <span className="TextureMainPicto-levelLabel">{levelLabel}</span>
          <span className="TextureMainPicto-level">{level}</span>
        </div>
      )}
    </div>
  );
};

export default TextureMainPicto;
