import { publicUrl } from '~/publicUrl';

import './style.scss';

// Measured by scripts/ui-kit/extract/title-sort.py (px, 1x).
// Slab: light smear + badge (fixed) | body (stretched) | fringes + bevelled tip (fixed).
// key: center and radius of the hollow badge.
export const SLAB = {
  src: publicUrl('ui/tex/title-sort-slab.webp'),
  width: 396,
  height: 66,
  left: 105,
  right: 76,
  key: [68, 32, 25],
  labelLeft: 105,
  labelRight: 50,
  center: 31
};

interface TextureSortSlabProps {
  width?: number;
  keyHint?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureSortSlab = ({
  width = SLAB.width,
  keyHint,
  className = '',
  style,
  children
}: TextureSortSlabProps) => {
  const [kx, ky, kr] = SLAB.key;
  const vars = {
    width,
    height: SLAB.height,
    '--tex': `url('${SLAB.src}')`,
    '--tex-left': `${SLAB.left}px`,
    '--tex-right': `${SLAB.right}px`,
    '--slice-left': SLAB.left,
    '--slice-right': SLAB.right,
    ...style
  } as React.CSSProperties;
  return (
    <div className={`TextureSortSlab ${className}`} style={vars}>
      <div className="TextureSortSlab-tex" aria-hidden />
      {keyHint && (
        <div
          className="TextureSortSlab-key"
          style={{ left: kx - kr, top: ky - kr, width: kr * 2, height: kr * 2 }}
        >
          {keyHint}
        </div>
      )}
      <div
        className="TextureSortSlab-label"
        style={{ left: SLAB.labelLeft, right: SLAB.labelRight, top: SLAB.center }}
      >
        {children}
      </div>
    </div>
  );
};

export default TextureSortSlab;
