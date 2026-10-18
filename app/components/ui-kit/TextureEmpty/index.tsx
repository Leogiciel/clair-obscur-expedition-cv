import './style.scss';

// Textures from scripts/ui-kit/extract/empty.py. NATIVE: in-game diamond box (tip to tip ≈ 166px
// at the rule's midline). SLICE: fixed corners (the 4 tips) of empty-square.webp, the unrotated 131px square.
const NATIVE = 185;
const SLICE = 16;

interface TextureEmptyProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureEmpty = ({ size = NATIVE, className = '', style, children }: TextureEmptyProps) => {
  const native = size === NATIVE;
  // Rotated square must cover the same box: side = diagonal / √2, kept odd (like the texture) so the
  // center stays on a pixel.
  const side = Math.round(size / Math.SQRT2 / 2) * 2 + 1;
  const vars = {
    width: size,
    height: size,
    '--side': `${side}px`,
    '--slice': SLICE,
    '--slice-px': `${SLICE}px`,
    ...style
  } as React.CSSProperties;
  return (
    <div
      className={`TextureEmpty ${native ? 'TextureEmpty--native' : 'TextureEmpty--scaled'} ${className}`}
      style={vars}
    >
      <div className="TextureEmpty-tex" aria-hidden />
      <div className="TextureEmpty-content">{children}</div>
    </div>
  );
};

export default TextureEmpty;
