import './style.scss';

interface DiamondCardDividerProps {
  className?: string;
  style?: React.CSSProperties;
}

const DiamondCardDivider = ({className = '', style}: DiamondCardDividerProps) => (
  <div className={`DiamondCardDivider ${className}`} style={style} aria-hidden/>
);

export default DiamondCardDivider;
