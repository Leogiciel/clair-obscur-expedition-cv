import { publicUrl } from '~/publicUrl';

import './style.scss';

export type TexturePlateVariant = 'normal' | 'selected' | 'hover';

// Measured by scripts/ui-kit/extract-borders.py (px, 1x). left/right: fixed slice parts.
// icon/portrait: center and half-diagonal of the hollow diamonds.
const TEXTURES: Record<
  TexturePlateVariant,
  {
    src: string;
    width: number;
    height: number;
    left: number;
    right: number;
    icon: [number, number, number];
    portrait?: [number, number, number];
    // Icon diamond left edge and top rule: textures have different margins (smear, portrait), so rows
    // align on this anchor.
    anchor: [number, number];
    // Distance from the chevron tip to the texture's right edge (portrait and frays included).
    tail: number;
  }
> = {
  normal: {
    src: publicUrl('ui/tex/plate-normal.webp'),
    width: 337,
    height: 66,
    left: 60,
    right: 37,
    icon: [30, 32, 17],
    anchor: [9, 4],
    tail: 10
  },
  selected: {
    src: publicUrl('ui/tex/plate-selected.webp'),
    width: 374,
    height: 75,
    left: 62,
    right: 67,
    icon: [32, 41, 17],
    portrait: [340, 42, 22],
    anchor: [6, 12],
    tail: 54
  },
  hover: {
    src: publicUrl('ui/tex/plate-hover.webp'),
    width: 424,
    height: 72,
    left: 94,
    right: 62,
    icon: [62, 37, 18],
    portrait: [393, 37, 22],
    anchor: [37, 10],
    tail: 55
  }
};

// `length` runs from the icon diamond's left edge to the chevron tip, so the row keeps its geometry
// in every state.
export const plateBox = (variant: TexturePlateVariant, length: number) => {
  const t = TEXTURES[variant];
  return { left: -t.anchor[0], top: -t.anchor[1], width: length + t.anchor[0] + t.tail, height: t.height };
};

interface TexturePlateProps {
  variant?: TexturePlateVariant;
  width?: number;
  icon?: React.ReactNode;
  portrait?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TexturePlate = ({
  variant = 'normal',
  width,
  icon,
  portrait,
  aside,
  className = '',
  style,
  children
}: TexturePlateProps) => {
  const t = TEXTURES[variant];
  const w = width ?? t.width;
  const [ix, iy, ir] = t.icon;
  const p = t.portrait && [t.portrait[0] + (w - t.width), t.portrait[1], t.portrait[2]];
  const vars = {
    width: w,
    height: t.height,
    '--tex': `url('${t.src}')`,
    '--tex-left': `${t.left}px`,
    '--tex-right': `${t.right}px`,
    '--slice-left': t.left,
    '--slice-right': t.right,
    '--center': `${iy}px`,
    ...style
  } as React.CSSProperties;
  return (
    <div className={`TexturePlate TexturePlate--${variant} ${className}`} style={vars}>
      <div className="TexturePlate-tex" aria-hidden />
      {icon && (
        <div
          className="TexturePlate-slot"
          style={{ left: ix - ir, top: iy - ir, width: ir * 2, height: ir * 2 }}
        >
          {icon}
        </div>
      )}
      {p && portrait && (
        <div
          className="TexturePlate-slot"
          style={{ left: p[0] - p[2], top: p[1] - p[2], width: p[2] * 2, height: p[2] * 2 }}
        >
          {portrait}
        </div>
      )}
      <div className="TexturePlate-content">
        <div className="TexturePlate-label">{children}</div>
        {aside}
      </div>
    </div>
  );
};

export default TexturePlate;
