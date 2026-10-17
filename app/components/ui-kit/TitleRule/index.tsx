import './style.scss';

interface TitleRuleProps {
  title: string;
  // The painted section rule lives in TextureTitleSort.
  variant?: 'section' | 'name';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  children?: React.ReactNode;
}

const TitleRule = ({title, variant = 'section', as: Tag = 'h2', className = '', children}: TitleRuleProps) => {
  return (
    <div className={`TitleRule TitleRule--${variant} ${className}`}>
      <div className="TitleRule-row">
        <Tag className="TitleRule-title">
          <span className="TitleRule-initial">{title.charAt(0)}</span>
          {title.slice(1)}
        </Tag>
        {children}
      </div>
    </div>
  );
};

export default TitleRule;
