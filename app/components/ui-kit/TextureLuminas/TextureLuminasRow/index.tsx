import './style.scss';

interface TextureLuminasRowProps {
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  marked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureLuminasRow = ({
  icon,
  aside,
  marked,
  className = '',
  style,
  children
}: TextureLuminasRowProps) => (
  <div className={`TextureLuminasRow ${className}`} style={style}>
    <div className="TextureLuminasRow-tex" aria-hidden />
    {icon && <div className="TextureLuminasRow-slot">{icon}</div>}
    <div className="TextureLuminasRow-content">
      <div className="TextureLuminasRow-label">{children}</div>
      {aside}
    </div>
    {marked && <div className="TextureLuminasRow-dot" aria-hidden />}
  </div>
);

export default TextureLuminasRow;
