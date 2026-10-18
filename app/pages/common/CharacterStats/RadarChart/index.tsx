import './style.scss';

// Measured on the video, in capture px, origin = top-left corner of the stats column.

interface Attribute {
  label: string;
  value: number;
  // Label anchor (center x, top y); the value renders 33px below.
  at: [number, number];
}

// Vertex order: top, then clockwise.
const ATTRIBUTES: Attribute[] = [
  { label: 'Vitality', value: 28, at: [245, 397] },
  { label: 'Might', value: 24, at: [372, 497] },
  { label: 'Agility', value: 31, at: [330, 637] },
  { label: 'Defense', value: 22, at: [157, 637] },
  { label: 'Luck', value: 26, at: [105, 499] }
];

const CENTER: [number, number] = [242, 552];
const RINGS = [86, 50, 25];
// Game scale: a value of 5 gives a polygon radius of about 9px.
const VALUE_SCALE = 86 / 48;

const vertex = (i: number, r: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [CENTER[0] + r * Math.cos(a), CENTER[1] + r * Math.sin(a)];
};
const polygon = (radius: (i: number) => number) =>
  ATTRIBUTES.map((_, i) => vertex(i, radius(i)).join(',')).join(' ');

const CharacterRadarChart = ({ className = '' }: { className?: string }) => (
  <div className={`CharacterRadarChart ${className}`}>
    <svg className="CharacterRadarChart-svg" width="490" height="700" aria-hidden>
      {RINGS.map((r) => (
        <polygon key={r} className="CharacterRadarChart-ring" points={polygon(() => r)} />
      ))}
      {ATTRIBUTES.map((_, i) => {
        const [x, y] = vertex(i, RINGS[0]);
        return <circle key={i} className="CharacterRadarChart-dot" cx={x} cy={y} r="3.5" />;
      })}
      <polygon
        className="CharacterRadarChart-value"
        points={polygon((i) => Math.max(4, ATTRIBUTES[i].value * VALUE_SCALE))}
      />
    </svg>
    <dl>
      {ATTRIBUTES.map((a) => (
        <div key={a.label} className="CharacterRadarChart-label" style={{ left: a.at[0], top: a.at[1] }}>
          <dt>{a.label}</dt>
          <dd>{a.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export default CharacterRadarChart;
