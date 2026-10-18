import './style.scss';

// Texture from scripts/ui-kit/extract/weapon-screen.py (capture: x 100, y 278).
const TEX_WIDTH = 658;
const TEX_HEIGHT = 818;

interface TextureListPanelProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Meant to sit right under TextureTitleSort's title rule.
const TextureListPanel = ({
  width = TEX_WIDTH,
  height = TEX_HEIGHT,
  className = '',
  style,
  children
}: TextureListPanelProps) => (
  <div className={`TextureListPanel ${className}`} style={{ width, height, ...style }}>
    <div className="TextureListPanel-tex" aria-hidden />
    <div className="TextureListPanel-list">{children}</div>
  </div>
);

export default TextureListPanel;
