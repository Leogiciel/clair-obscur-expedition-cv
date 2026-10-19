import { SLAB } from './slab';
import './style.scss';

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
