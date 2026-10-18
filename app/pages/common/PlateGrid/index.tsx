import SelectFx from '~/components/ui-kit/SelectFx';
import TexturePlate, { type TexturePlateVariant, plateBox } from '~/components/ui-kit/TexturePlate';

import './style.scss';

export interface PlateGridLayout {
  // Rows align on their icon diamond's left edge and top rule; `length` runs from that edge to the chevron tip.
  columns: { x: number; length: number }[];
  firstRow: number;
  pitch: number;
  rows: number;
}

interface PlateGridProps<T> {
  label: string;
  items: T[];
  layout: PlateGridLayout;
  hovered: number | null;
  onHover: (i: number | null) => void;
  onPick: (i: number) => void;
  variant: (item: T, i: number) => TexturePlateVariant;
  itemLabel: (item: T) => string;
  icon: (item: T) => React.ReactNode;
  portrait?: (item: T) => React.ReactNode;
  aside: (item: T) => React.ReactNode;
  children: (item: T) => React.ReactNode;
}

// Hovered rows get the home screen's selection (grow, darker plate, paint) stretched to the row: the Skills slot
// effect, measured on a plate of nearly the same proportions. The hovered row goes under its neighbours so its
// smear slides under them.
// Columns are filled top to bottom, as in the game's lists.
const PlateGrid = <T,>({
  label,
  items,
  layout,
  hovered,
  onHover,
  onPick,
  variant,
  itemLabel,
  icon,
  portrait,
  aside,
  children
}: PlateGridProps<T>) => (
  <ul aria-label={label} className="PlateGrid" onMouseLeave={() => onHover(null)}>
    {items.map((item, i) => {
      const column = layout.columns[Math.floor(i / layout.rows)];
      const v = variant(item, i);
      const box = plateBox(v, column.length);
      return (
        <li
          key={itemLabel(item)}
          className="absolute"
          style={{
            left: column.x + box.left,
            top: layout.firstRow + (i % layout.rows) * layout.pitch + box.top,
            zIndex: i === hovered ? 0 : 1
          }}
        >
          <button
            type="button"
            className={`PlateGrid-item Screen-item ${i === hovered ? 'Screen-item--active' : ''}`}
            style={
              {
                width: box.width,
                height: box.height,
                '--slide': '0px',
                '--sel-scale': 1.1
              } as React.CSSProperties
            }
            aria-current={i === hovered}
            aria-label={itemLabel(item)}
            onMouseEnter={() => onHover(i)}
            onFocus={() => onHover(i)}
            onClick={() => onPick(i)}
          >
            <div className="Screen-slide">
              <TexturePlate
                variant={v}
                width={box.width}
                icon={icon(item)}
                portrait={portrait?.(item)}
                aside={aside(item)}
              >
                {children(item)}
              </TexturePlate>
            </div>
            <SelectFx kind="skill" active={i === hovered} fit={{ width: box.width, height: box.height }} />
          </button>
        </li>
      );
    })}
  </ul>
);

export default PlateGrid;
