import TexturePlate, {plateBox, type TexturePlateVariant} from '~/components/ui-kit/TexturePlate';

export interface PlateGridLayout {
  // Rows align on their icon diamond's left edge and top rule; `length` runs from that edge to the chevron tip.
  columns: {x: number; length: number}[];
  firstRow: number;
  pitch: number;
  rows: number;
}

interface PlateGridProps<T> {
  label: string;
  items: T[];
  layout: PlateGridLayout;
  cursor: number;
  onCursor: (i: number) => void;
  variant: (item: T, i: number) => TexturePlateVariant;
  itemLabel: (item: T) => string;
  icon: (item: T) => React.ReactNode;
  portrait?: (item: T) => React.ReactNode;
  aside: (item: T) => React.ReactNode;
  children: (item: T) => React.ReactNode;
}

// Columns are filled top to bottom, as in the game's lists.
const PlateGrid = <T,>({label, items, layout, cursor, onCursor, variant, itemLabel, icon, portrait, aside, children}: PlateGridProps<T>) => (
  <ul aria-label={label}>
    {items.map((item, i) => {
      const column = layout.columns[Math.floor(i / layout.rows)];
      const v = variant(item, i);
      const box = plateBox(v, column.length);
      return (
        <li
          key={itemLabel(item)}
          className="absolute"
          style={{left: column.x + box.left, top: layout.firstRow + (i % layout.rows) * layout.pitch + box.top}}
          tabIndex={0}
          aria-current={i === cursor}
          aria-label={itemLabel(item)}
          onMouseEnter={() => onCursor(i)}
          onFocus={() => onCursor(i)}
        >
          <TexturePlate variant={v} width={box.width} icon={icon(item)} portrait={portrait?.(item)} aside={aside(item)}>
            {children(item)}
          </TexturePlate>
        </li>
      );
    })}
  </ul>
);

export default PlateGrid;
