import './style.scss';

const SectionTitle = ({children, x, y}: {children: string; x: number; y: number}) => (
  <h2 className="SectionTitle absolute" style={{left: x, top: y}}>
    <span>{children.charAt(0)}</span>
    {children.slice(1)}
  </h2>
);

export default SectionTitle;
