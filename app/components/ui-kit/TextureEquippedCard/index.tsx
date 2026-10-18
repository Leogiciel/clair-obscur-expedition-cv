import './style.scss';

interface TextureEquippedCardProps {
  title?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Texture from scripts/ui-kit/extract/weapon-screen.py.
const TextureEquippedCard = ({ title, aside, className = '', style, children }: TextureEquippedCardProps) => (
  <div className={`TextureEquippedCard ${className}`} style={style}>
    <div className="TextureEquippedCard-tex" aria-hidden />
    {title && <div className="TextureEquippedCard-title">{title}</div>}
    {aside && <div className="TextureEquippedCard-aside">{aside}</div>}
    <div className="TextureEquippedCard-content">{children}</div>
  </div>
);

export default TextureEquippedCard;
