import './style.scss';

interface NumProps {
  size?: number;
  as?: 'span' | 'p' | 'div';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Num = ({size, as: Tag = 'span', className = '', style, children}: NumProps) => (
  <Tag className={`Num ${className}`} style={{fontSize: size, ...style}}>{children}</Tag>
);

export default Num;
