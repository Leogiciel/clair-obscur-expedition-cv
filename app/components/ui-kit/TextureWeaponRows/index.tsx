import './style.scss';

export type TextureWeaponRowsVariant = 'selected' | 'normal';

// Measured by scripts/ui-kit/extract/weapon-rows.py (px, 1x). left/right: fixed 3-slice parts.
// icon: [x, y, width, height] where the weapon was painted. name: [left, right] margins of the name
// area. aside: distance from the right edge to the "Level" column center.
const TEXTURES: Record<TextureWeaponRowsVariant, {
  src: string;
  width: number;
  height: number;
  left: number;
  right: number;
  center: number;
  icon: [number, number, number, number];
  name: [number, number];
  aside: number;
}> = {
  selected: {
    src: '/ui/tex/weapon-rows-selected.webp', width: 488, height: 92, left: 150, right: 88,
    center: 46, icon: [60, 8, 72, 72], name: [140, 158], aside: 92,
  },
  normal: {
    src: '/ui/tex/weapon-rows-normal.webp', width: 420, height: 74, left: 100, right: 135,
    center: 37, icon: [34, 4, 64, 64], name: [96, 144], aside: 81,
  },
};

interface TextureWeaponRowsProps {
  variant?: TextureWeaponRowsVariant;
  width?: number;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureWeaponRows = ({variant = 'normal', width, icon, aside, className = '', style, children}: TextureWeaponRowsProps) => {
  const t = TEXTURES[variant];
  const w = Math.max(width ?? t.width, t.left + t.right);
  const [ix, iy, iw, ih] = t.icon;
  const vars = {
    width: w,
    height: t.height,
    '--tex': `url('${t.src}')`,
    '--tex-left': `${t.left}px`,
    '--tex-right': `${t.right}px`,
    '--slice-left': t.left,
    '--slice-right': t.right,
    '--center': `${t.center}px`,
    '--name-left': `${t.name[0]}px`,
    '--name-right': `${t.name[1]}px`,
    '--aside': `${t.aside}px`,
    ...style,
  } as React.CSSProperties;
  return (
    <div className={`TextureWeaponRows TextureWeaponRows--${variant} ${className}`} style={vars}>
      <div className="TextureWeaponRows-tex" aria-hidden/>
      {icon && (
        <div className="TextureWeaponRows-icon" style={{left: ix, top: iy, width: iw, height: ih}}>{icon}</div>
      )}
      <div className="TextureWeaponRows-name">{children}</div>
      {aside && <div className="TextureWeaponRows-aside">{aside}</div>}
    </div>
  );
};

export default TextureWeaponRows;
