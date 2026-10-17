import './style.scss';

interface LabelProps {
  size?: number;
  as?: 'span' | 'p' | 'div';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Label = ({size, as: Tag = 'span', className = '', style, children}: LabelProps) => (
  <Tag className={`Label ${className}`} style={{fontSize: size, ...style}}>{children}</Tag>
);

export default Label;
