import './style.scss';

// Measured by scripts/ui-kit/extract/title-sort.py (px, 1x).
// Rule: fade-in | vertical tick + knot (fixed) | solid rule (stretched) | fade-out (fixed).
const RULE = {src: '/ui/tex/title-sort-rule.webp', width: 764, height: 100, left: 170, right: 168};
// Slab: light smear + badge (fixed) | body (stretched) | fringes + bevelled tip (fixed).
// key: center and radius of the hollow badge.
const SLAB = {src: '/ui/tex/title-sort-slab.webp', width: 396, height: 66, left: 105, right: 76, key: [68, 32, 25], labelLeft: 105, labelRight: 50, center: 31};
// Default placement, from the title-sort.png reference.
const LAYOUT = {slabLeft: 436, slabTop: 7, titleLeft: 171, titleBaseline: 71, asideGap: 6};

interface TextureSortSlabProps {
  width?: number;
  keyHint?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const TextureSortSlab = ({width = SLAB.width, keyHint, className = '', style, children}: TextureSortSlabProps) => {
  const [kx, ky, kr] = SLAB.key;
  const vars = {
    width,
    height: SLAB.height,
    '--tex': `url('${SLAB.src}')`,
    '--tex-left': `${SLAB.left}px`,
    '--tex-right': `${SLAB.right}px`,
    '--slice-left': SLAB.left,
    '--slice-right': SLAB.right,
    ...style,
  } as React.CSSProperties;
  return (
    <div className={`TextureSortSlab ${className}`} style={vars}>
      <div className="TextureSortSlab-tex" aria-hidden/>
      {keyHint && (
        <div className="TextureSortSlab-key" style={{left: kx - kr, top: ky - kr, width: kr * 2, height: kr * 2}}>{keyHint}</div>
      )}
      <div className="TextureSortSlab-label" style={{left: SLAB.labelLeft, right: SLAB.labelRight, top: SLAB.center}}>{children}</div>
    </div>
  );
};

interface TextureTitleSortProps {
  title: string;
  as?: 'h1' | 'h2' | 'h3';
  width?: number;
  sort?: React.ReactNode;
  sortKey?: React.ReactNode;
  sortWidth?: number;
  sortLeft?: number;
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TextureTitleSort = ({title, as: Tag = 'h2', width = RULE.width, sort, sortKey, sortWidth = SLAB.width, sortLeft = LAYOUT.slabLeft, aside, className = '', style}: TextureTitleSortProps) => {
  const vars = {
    width,
    height: RULE.height,
    '--tex': `url('${RULE.src}')`,
    '--tex-left': `${RULE.left}px`,
    '--tex-right': `${RULE.right}px`,
    '--slice-left': RULE.left,
    '--slice-right': RULE.right,
    '--title-left': `${LAYOUT.titleLeft}px`,
    '--title-baseline': `${LAYOUT.titleBaseline}px`,
    ...style,
  } as React.CSSProperties;
  const hasSort = sort !== undefined || sortKey !== undefined;
  return (
    <div className={`TextureTitleSort ${className}`} style={vars}>
      <div className="TextureTitleSort-rule" aria-hidden/>
      <Tag className="TextureTitleSort-title">
        <span className="TextureTitleSort-initial">{title.charAt(0)}</span>
        {title.slice(1)}
      </Tag>
      {hasSort && (
        <TextureSortSlab width={sortWidth} keyHint={sortKey} className="TextureTitleSort-sort" style={{left: sortLeft, top: LAYOUT.slabTop}}>
          {sort}
        </TextureSortSlab>
      )}
      {aside && (
        <div className="TextureTitleSort-aside" style={{left: sortLeft + sortWidth + LAYOUT.asideGap, top: LAYOUT.slabTop + SLAB.center}}>{aside}</div>
      )}
    </div>
  );
};

export default TextureTitleSort;
