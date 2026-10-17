import './style.scss';

interface TextureCardProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Texture from scripts/ui-kit/extract-borders.py; it overflows the card, so content goes in the inner area.
const TextureCard = ({className = '', style, children}: TextureCardProps) => (
  <div className={`TextureCard ${className}`} style={style}>
    <div className="TextureCard-tex" aria-hidden/>
    <div className="TextureCard-content">{children}</div>
  </div>
);

export default TextureCard;
