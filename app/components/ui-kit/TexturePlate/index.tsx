import './style.scss';
import { TEXTURES, type TexturePlateVariant } from './textures';

export type { TexturePlateVariant };

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
