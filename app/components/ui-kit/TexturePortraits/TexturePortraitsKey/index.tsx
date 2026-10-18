import { publicUrl } from '~/publicUrl';

import './style.scss';

// RB leans the other way from LB, hence two textures.
interface TexturePortraitsKeyProps {
  side?: 'left' | 'right';
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TexturePortraitsKey = ({
  side = 'left',
  width = 52,
  className = '',
  style,
  children
}: TexturePortraitsKeyProps) => (
  <span
    className={`TexturePortraitsKey ${className}`}
    style={
      {
        width,
        '--tex': `url('${publicUrl(`ui/tex/portraits-key-${side}.webp`)}')`,
        ...style
      } as React.CSSProperties
    }
  >
    <span className="TexturePortraitsKey-tex" aria-hidden />
    <span className="TexturePortraitsKey-label">{children}</span>
  </span>
);

export default TexturePortraitsKey;
