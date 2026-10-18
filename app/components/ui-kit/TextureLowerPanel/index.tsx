import './style.scss';

// Textures from scripts/ui-kit/extract/main-right.py. The backdrop continues stats-backdrop.webp (same
// width and x alignment): the 580 × 390 box sits at (1860, 900) in the 2510 × 1380 capture, right under
// TextureStatsTop.

interface TextureLowerPanelProps {
  height?: number;
  backdrop?: boolean;
  line?: boolean;
  // Default 180 = y 1080 in the capture.
  lineTop?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureLowerPanel = ({
  height = 390,
  backdrop = true,
  line = true,
  lineTop = 180,
  className = '',
  style,
  children
}: TextureLowerPanelProps) => (
  <div
    className={`TextureLowerPanel ${className}`}
    style={{ height, '--line-top': `${lineTop}px`, ...style } as React.CSSProperties}
  >
    {backdrop && <div className="TextureLowerPanel-backdrop" aria-hidden />}
    {line && <div className="TextureLowerPanel-line" aria-hidden />}
    <div className="TextureLowerPanel-content">{children}</div>
  </div>
);

export default TextureLowerPanel;
