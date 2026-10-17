import './style.scss';

// On the 2510×1380 capture the component box sits at (118, 816), pixel-aligned with the game;
// all measures below are relative to that corner.

const TEX_W = 522;
const TEX_H = 130;
// 3-slice: smear + weapon slot left (228 px), "Level" column + bevelled tip right (268 px); only
// the 26 px flat in between (capture x 346–372) stretches, along the brush strokes.
const LEFT = 228;
const RIGHT = 268;
// Where the spear was painted (shaft from (63, 16) to (63+87, 113)): [x, y, width, height].
const ICON: [number, number, number, number] = [60, 12, 96, 104];

interface TextureMainWeaponProps {
  width?: number;
  icon?: React.ReactNode;
  level?: React.ReactNode;
  levelLabel?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureMainWeapon = ({width, icon, level, levelLabel = 'Level', className = '', style, children}: TextureMainWeaponProps) => {
  const w = Math.max(width ?? TEX_W, LEFT + RIGHT);
  const [ix, iy, iw, ih] = ICON;
  const vars = {width: w, height: TEX_H, ...style} as React.CSSProperties;
  return (
    <div className={`TextureMainWeapon ${className}`} style={vars}>
      <div className="TextureMainWeapon-tex" aria-hidden/>
      {icon && (
        <div className="TextureMainWeapon-icon" style={{left: ix, top: iy, width: iw, height: ih}}>{icon}</div>
      )}
      <div className="TextureMainWeapon-name">{children}</div>
      {level !== undefined && (
        <div className="TextureMainWeapon-level">
          <span className="TextureMainWeapon-levelLabel">{levelLabel}</span>
          <span className="TextureMainWeapon-levelValue">{level}</span>
        </div>
      )}
    </div>
  );
};

export default TextureMainWeapon;
