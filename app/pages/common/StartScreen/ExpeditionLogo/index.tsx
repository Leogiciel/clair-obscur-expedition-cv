// The logo's "Expedition" and its number, in one drawing so both share the gold and its wear (measured on
// design/ref/loading/ref-stage.png, stage pixels). The "35" follows the construction of the game's "33": every stroke
// is a thick one paired with a parallel hairline. On top, a broken bar over a hairline; the 3 drops a 45° diagonal,
// the 5 a near-upright stem, each with its hairline beside it, and both end in the same near-closed bowl (130 × 112,
// worn by chips, a dark line engraved inside it). Strokes are filled outlines so they can taper like the game's
// brushed gold.

type Point = [number, number];

// Outline of a stroke along `points`, `width(t)` wide at the share t of its length.
const stroke = (points: Point[], width: (t: number) => number) => {
  const left: Point[] = [];
  const right: Point[] = [];
  points.forEach(([x, y], i) => {
    const [px, py] = points[Math.max(0, i - 1)];
    const [nx, ny] = points[Math.min(points.length - 1, i + 1)];
    const len = Math.hypot(nx - px, ny - py) || 1;
    const half = width(i / (points.length - 1)) / 2;
    const ox = (-(ny - py) / len) * half;
    const oy = ((nx - px) / len) * half;
    left.push([x + ox, y + oy]);
    right.push([x - ox, y - oy]);
  });
  return `M${[...left, ...right.reverse()].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`;
};

const line = (from: Point, to: Point, steps = 24): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => [
    from[0] + ((to[0] - from[0]) * i) / steps,
    from[1] + ((to[1] - from[1]) * i) / steps
  ]);

// Clockwise elliptical arc, angles in degrees from the positive x axis (y pointing down).
const arc = ([cx, cy]: Point, [rx, ry]: Point, from: number, to: number, steps = 64): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

// Thin at both ends, full in the middle, like a brush lifted at the start and the end of the stroke.
const swell =
  (max: number, min = 1.5) =>
  (t: number) =>
    min + (max - min) * Math.sin(Math.PI * t) ** 0.7;
// A stroke and its hairline, `gap` px apart on the side given by the stroke's normal.
const paired = (from: Point, to: Point, width: number, gap: number, hairline = 4) => {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const nx = (-(to[1] - from[1]) / len) * gap;
  const ny = ((to[0] - from[0]) / len) * gap;
  return [
    stroke(line(from, to), swell(width, width * 0.45)),
    stroke(line([from[0] + nx, from[1] + ny], [to[0] + nx, to[1] + ny]), swell(hairline, 0.8))
  ];
};
// A horizontal bar broken into segments, each with its hairline under it.
const brokenBar = (y: number, segments: [number, number][], width: number) =>
  segments.flatMap(([x0, x1]) => paired([x0, y], [x1, y], width, width + 4, 3));

const TOP = 579;
// The bowl shared by both digits: one worn ring (the chips in the mask wear it, rather than clean cuts), thin where it
// leaves its stroke, full round the right and bottom, tapering into a tail that curls up past its left.
const BOWL_RADII: Point = [130, 112];
const bowl = (centre: Point, from: number, to: number) =>
  stroke(
    arc(centre, BOWL_RADII, from, to, 32),
    (t) => 4 + 24 * Math.min(1, t * 6) * (t > 0.8 ? (1 - t) / 0.2 : 1) ** 0.6
  );
const STROKES = [
  ...brokenBar(
    TOP,
    [
      [1000, 1100],
      [1112, 1236],
      [1262, 1400],
      [1412, 1512]
    ],
    10
  ),
  // The 3: diagonal, then the bowl from its top round to the tail.
  ...paired([1244, TOP + 2], [1128, 697], 36, -26),
  bowl([1130, 795], -92, 208),
  // The 5: a near-upright stem under the bar, then the same bowl from the stem's foot round to the tail.
  ...paired([1318, TOP + 4], [1306, 712], 32, -24),
  bowl([1390, 795], -132, 160),
  // Jagged shards breaking off past the number's right, like the spark off the game's second 3.
  'M1546,662L1568,622L1582,618L1562,652Z',
  'M1590,606L1626,574L1634,580L1600,612Z',
  'M1572,708L1588,676L1600,680L1580,706Z'
];

// The dark line engraved along the inside of the bowl.
const BOWL_INLINE = [
  stroke(arc([1130, 795], [125, 107], -60, 190, 48), swell(2.5, 0.5)),
  stroke(arc([1390, 795], [125, 107], -100, 150, 48), swell(2.5, 0.5))
];

// Slashes cut through the letters, as on the game's worn logo (the X, D, N, O and the number's top).
const SLASHES = [
  [
    [838, 470],
    [890, 412]
  ],
  [
    [1166, 420],
    [1212, 375]
  ],
  [
    [1528, 500],
    [1574, 448]
  ],
  [
    [1688, 430],
    [1744, 390]
  ],
  [
    [1180, 600],
    [1230, 560]
  ]
].map(([from, to]) => stroke(line(from as Point, to as Point, 8), swell(4, 1)));

// The wear: slashes, short cracks (turbulence veins, kept only inside sparse patches) and chips cut through the gold in the
// mask; the glyph edges are roughened by a slight displacement, and each part shades from pale champagne to a dull bronze.
const ExpeditionLogo = () => (
  <svg width="2510" height="1380" className="ExpeditionLogo" aria-hidden>
    <defs>
      <linearGradient id="expedition-title" x1="0" y1="389" x2="0" y2="508" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ece2cb" />
        <stop offset="0.45" stopColor="#cdbb98" />
        <stop offset="1" stopColor="#8f7b5c" />
      </linearGradient>
      <linearGradient id="expedition-number" x1="0" y1="575" x2="0" y2="910" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ece2cb" />
        <stop offset="0.4" stopColor="#cdbb98" />
        <stop offset="1" stopColor="#8f7b5c" />
      </linearGradient>
      <filter id="expedition-surface" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="17" result="grain" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="grain"
          scale="2"
          xChannelSelector="R"
          yChannelSelector="G"
          result="rough"
        />
      </filter>
      <filter id="expedition-cracks" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="turbulence" baseFrequency="0.009 0.028" numOctaves="1" seed="5" />
        <feColorMatrix type="luminanceToAlpha" />
        <feComponentTransfer result="veins">
          <feFuncA
            type="table"
            tableValues="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
          />
        </feComponentTransfer>
        <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="8" />
        <feColorMatrix type="luminanceToAlpha" />
        <feComponentTransfer result="patches">
          <feFuncA type="discrete" tableValues="0 0 0 1 1 1" />
        </feComponentTransfer>
        <feComposite in="veins" in2="patches" operator="in" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="expedition-chips" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="21" />
        <feColorMatrix type="luminanceToAlpha" />
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1" />
        </feComponentTransfer>
      </filter>
      <mask id="expedition-wear" maskUnits="userSpaceOnUse" x="0" y="0" width="2510" height="1380">
        <rect width="2510" height="1380" fill="#fff" />
        <rect width="2510" height="1380" filter="url(#expedition-cracks)" />
        <rect width="2510" height="1380" fill="#000" filter="url(#expedition-chips)" />
        {BOWL_INLINE.map((d) => (
          <path key={d} d={d} fill="#000" />
        ))}
        <g fill="#000">
          {SLASHES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </mask>
    </defs>
    <g mask="url(#expedition-wear)" filter="url(#expedition-surface)">
      <text
        x="1257"
        y="508"
        textAnchor="middle"
        fill="url(#expedition-title)"
        style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 168,
          fontWeight: 400,
          letterSpacing: '0.028em'
        }}
      >
        EXPEDITION
      </text>
      <g fill="url(#expedition-number)">
        {STROKES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  </svg>
);

export default ExpeditionLogo;
