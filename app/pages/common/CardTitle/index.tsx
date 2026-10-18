import './style.scss';

interface CardTitleProps {
  size?: number;
  as?: 'span' | 'p' | 'div';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const CardTitle = ({ size, as: Tag = 'span', className = '', style, children }: CardTitleProps) => (
  <Tag className={`CardTitle ${className}`} style={{ fontSize: size, ...style }}>
    {children}
  </Tag>
);

export default CardTitle;
