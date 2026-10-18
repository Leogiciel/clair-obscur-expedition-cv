// The game's Lumina point mark: a diamond whose inner stroke curls into a hook, in the cyan of the counters.
const LuminaGlyph = ({ size }: { size: number }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
    <g fill="none" stroke="var(--lumina-cyan, var(--el-cyan))" strokeWidth="2.6" strokeLinejoin="miter">
      <path d="M20 2 L38 20 L20 38 L2 20 Z" />
      <path d="M20 9 L9 20 L20 31 L31 20 L24 20 L20 24" />
    </g>
  </svg>
);

export default LuminaGlyph;
