import './style.scss';

// Textures from scripts/ui-kit/extract/luminas.py; 1x px measured on design/ref/luminas.png.

const HEAD_HEIGHT = 92;
// 69px row pitch for a 71px texture.
const ROW_OVERLAP = 2;

interface TextureLuminasProps {
  width?: number;
  headWidth?: number;
  title?: React.ReactNode;
  titleIcon?: React.ReactNode;
  counter?: React.ReactNode;
  counterIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureLuminas = ({width = 476, headWidth = 278, title, titleIcon, counter, counterIcon, className = '', style, children}: TextureLuminasProps) => {
  const vars = {width, '--head-h': `${HEAD_HEIGHT}px`, '--head-w': `${headWidth}px`, '--row-overlap': `${ROW_OVERLAP}px`, ...style} as React.CSSProperties;
  return (
    <div className={`TextureLuminas ${className}`} style={vars}>
      <div className="TextureLuminas-head" aria-hidden/>
      <div className="TextureLuminas-header">
        <div className="TextureLuminas-title">
          {titleIcon}
          {title}
        </div>
        {(counter || counterIcon) && (
          <div className="TextureLuminas-counter">
            {counter}
            {counterIcon}
          </div>
        )}
      </div>
      <div className="TextureLuminas-rows">{children}</div>
    </div>
  );
};

interface TextureLuminasRowProps {
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  marked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const TextureLuminasRow = ({icon, aside, marked, className = '', style, children}: TextureLuminasRowProps) => (
  <div className={`TextureLuminasRow ${className}`} style={style}>
    <div className="TextureLuminasRow-tex" aria-hidden/>
    {icon && <div className="TextureLuminasRow-slot">{icon}</div>}
    <div className="TextureLuminasRow-content">
      <div className="TextureLuminasRow-label">{children}</div>
      {aside}
    </div>
    {marked && <div className="TextureLuminasRow-dot" aria-hidden/>}
  </div>
);

export default TextureLuminas;
