// Marks darker than this (relative luminance) would vanish on the dark slots, so they use the UI text colour.
const DARK = 0.2;
const LIGHT = '#e8e2d0';

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

interface BrandMarkProps {
  // 24 × 24 path (Simple Icons) and its brand colour, or a short text when there is no mark.
  path?: string;
  hex?: string;
  text?: string;
  title: string;
}

const BrandMark = ({path, hex = 'e8e2d0', text, title}: BrandMarkProps) => {
  const fill = luminance(hex) < DARK ? LIGHT : `#${hex}`;
  return (
    <svg viewBox="0 0 24 24" width="60%" height="60%" role="img" aria-label={title}>
      {path ? (
        <path d={path} fill={fill}/>
      ) : (
        <text x="12" y="12" dy="0.35em" textAnchor="middle" fontSize={!text || text.length <= 2 ? 11 : text.length > 3 ? 7 : 9} fontFamily="var(--font-label)" fontWeight="600" fill={LIGHT}>
          {text}
        </text>
      )}
    </svg>
  );
};

export default BrandMark;
