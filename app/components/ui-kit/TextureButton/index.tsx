import './style.scss';

// Texture from scripts/ui-kit/extract/main-right.py; the 410 × 86 box sits at (1915, 786) in the
// 2510 × 1380 capture.

const TEX_WIDTH = 410;

interface TextureButtonProps {
  width?: number;
  icon?: React.ReactNode;
  marked?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureButton = ({width = TEX_WIDTH, icon, marked = false, onClick, className = '', style, children}: TextureButtonProps) => (
  <button type="button" className={`TextureButton ${className}`} style={{width, ...style}} onClick={onClick}>
    <span className="TextureButton-tex" aria-hidden/>
    {icon && <span className="TextureButton-icon">{icon}</span>}
    <span className="TextureButton-label">{children}</span>
    {marked && <span className="TextureButton-dot" aria-hidden/>}
  </button>
);

export default TextureButton;
