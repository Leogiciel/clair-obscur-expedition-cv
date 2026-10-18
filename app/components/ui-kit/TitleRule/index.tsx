import './style.scss';

interface TitleRuleProps {
  title: string;
  // The painted section rule lives in TextureTitleSort.
  variant?: 'section' | 'name';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  children?: React.ReactNode;
}

// Every word gets the enlarged initial, as in the game's two-word names.
const TitleRule = ({title, variant = 'section', as: Tag = 'h2', className = '', children}: TitleRuleProps) => {
  return (
    <div className={`TitleRule TitleRule--${variant} ${className}`}>
      <div className="TitleRule-row">
        <Tag className="TitleRule-title">
          {title.split(' ').map((word, i) => (
            <span key={i}>
              {i > 0 && ' '}
              <span className="TitleRule-initial">{word.charAt(0)}</span>
              {word.slice(1)}
            </span>
          ))}
        </Tag>
        {children}
      </div>
    </div>
  );
};

export default TitleRule;
