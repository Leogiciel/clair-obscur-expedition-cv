const Label = ({children, size = 15, className = ''}: {children: React.ReactNode; size?: number; className?: string}) => (
  <span className={className} style={{fontFamily: 'var(--font-label)', fontWeight: 500, fontSize: size, lineHeight: 1}}>{children}</span>
);

export default Label;
