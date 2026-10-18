// Gold-rimmed diamond that holds a button's icon, as on the game's Edit Pictos button (design/luminas-screen.webp).
const DiamondIcon = ({children}: {children: React.ReactNode}) => (
  <span className="relative grid size-[80px] place-items-center" aria-hidden>
    <svg viewBox="0 0 80 80" width="80" height="80" className="absolute inset-0">
      <path d="M40 3 L77 40 L40 77 L3 40 Z" fill="#0d0d0b" stroke="#d9c896" strokeWidth="3"/>
    </svg>
    <span className="relative grid size-[44px] place-items-center">{children}</span>
  </span>
);

export default DiamondIcon;
