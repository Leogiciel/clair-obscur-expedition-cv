const Num = ({ children, size = 30 }: { children: React.ReactNode; size?: number }) => (
  <span
    style={{ fontFamily: 'var(--font-number)', fontSize: size, lineHeight: 0.9, color: 'var(--ui-text)' }}
  >
    {children}
  </span>
);

export default Num;
