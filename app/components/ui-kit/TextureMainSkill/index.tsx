import './style.scss';

// 3-slice: 296 px fixed left (diamond / chevron + name area), 64 px fixed right (chevron tip);
// only the plain 46 px middle stretches.
const WIDTH = 406;
const SLICE_LEFT = 296;
const SLICE_RIGHT = 64;

interface TextureMainSkillProps {
  empty?: boolean;
  width?: number;
  icon?: React.ReactNode;
  level?: React.ReactNode;
  marked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const TextureMainSkill = ({
  empty,
  width = WIDTH,
  icon,
  level,
  marked,
  className = '',
  style,
  children
}: TextureMainSkillProps) => {
  const vars = {
    width: Math.max(width, SLICE_LEFT + SLICE_RIGHT),
    '--tex': `url('/ui/tex/main-skills-${empty ? 'empty' : 'row'}.webp')`,
    '--slice-left': SLICE_LEFT,
    '--slice-right': SLICE_RIGHT,
    '--tex-left': `${SLICE_LEFT}px`,
    '--tex-right': `${SLICE_RIGHT}px`,
    ...style
  } as React.CSSProperties;
  return (
    <div className={`TextureMainSkill ${empty ? 'TextureMainSkill--empty' : ''} ${className}`} style={vars}>
      <div className="TextureMainSkill-tex" aria-hidden />
      {!empty && icon && <div className="TextureMainSkill-icon">{icon}</div>}
      <div className="TextureMainSkill-name">{empty ? (children ?? '—') : children}</div>
      {!empty && marked && <div className="TextureMainSkill-dot" aria-hidden />}
      {!empty && level !== undefined && level !== null && (
        <div className="TextureMainSkill-badge">
          <span>{level}</span>
        </div>
      )}
    </div>
  );
};

export default TextureMainSkill;
