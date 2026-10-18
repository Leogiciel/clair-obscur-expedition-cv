import TextureSortSlab, { SLAB } from './TextureSortSlab';
import './style.scss';

// Measured by scripts/ui-kit/extract/title-sort.py (px, 1x).
// Rule: fade-in | vertical tick + knot (fixed) | solid rule (stretched) | fade-out (fixed).
const RULE = { src: '/ui/tex/title-sort-rule.webp', width: 764, height: 100, left: 170, right: 168 };
// Default placement, from the title-sort.png reference.
const LAYOUT = { slabLeft: 436, slabTop: 7, titleLeft: 171, titleBaseline: 71, asideGap: 6 };

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

const TextureTitleSort = ({
  title,
  as: Tag = 'h2',
  width = RULE.width,
  sort,
  sortKey,
  sortWidth = SLAB.width,
  sortLeft = LAYOUT.slabLeft,
  aside,
  className = '',
  style
}: TextureTitleSortProps) => {
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
    ...style
  } as React.CSSProperties;
  const hasSort = sort !== undefined || sortKey !== undefined;
  return (
    <div className={`TextureTitleSort ${className}`} style={vars}>
      <div className="TextureTitleSort-rule" aria-hidden />
      <Tag className="TextureTitleSort-title">
        <span className="TextureTitleSort-initial">{title.charAt(0)}</span>
        {title.slice(1)}
      </Tag>
      {hasSort && (
        <TextureSortSlab
          width={sortWidth}
          keyHint={sortKey}
          className="TextureTitleSort-sort"
          style={{ left: sortLeft, top: LAYOUT.slabTop }}
        >
          {sort}
        </TextureSortSlab>
      )}
      {aside && (
        <div
          className="TextureTitleSort-aside"
          style={{ left: sortLeft + sortWidth + LAYOUT.asideGap, top: LAYOUT.slabTop + SLAB.center }}
        >
          {aside}
        </div>
      )}
    </div>
  );
};

export default TextureTitleSort;
