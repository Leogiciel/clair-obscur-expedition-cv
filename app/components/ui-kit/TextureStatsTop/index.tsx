import './style.scss';

// Textures from scripts/ui-kit/extract/stats-top.py carry only the strokes; content is up to the page.

interface TextureStatsTopProps {
  // stats-backdrop.webp, rebuilt from the video by scripts/ui-kit/extract/stats-backdrop.py.
  backdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Frame texture 500×398 sits 8 px left and 18 px above the box (corner frays). 9-slice: 72 px top
// (rule + bevelled corner), 84 px right (corner + right post), 48 px left (faded rule start + left
// post), nothing at the bottom.
const TextureStatsTop = ({backdrop = true, className = '', style, children}: TextureStatsTopProps) => (
  <div className={`TextureStatsTop ${className}`} style={style}>
    {backdrop && (
      <div className="TextureStatsTop-backdrop" aria-hidden/>
    )}
    <div className="TextureStatsTop-tex" aria-hidden/>
    <div className="TextureStatsTop-content">{children}</div>
  </div>
);

export default TextureStatsTop;
