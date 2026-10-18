// LinkedIn's "in" redrawn as a picto sigil: thin cyan strokes in a kite, like the game's crests.
const LinkedInMark = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <g fill="none" stroke="#3fd3cf" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3 L41 22 L22 41 L3 22 Z" strokeWidth="1.6" opacity="0.7"/>
      <circle cx="15" cy="14.5" r="1.8" fill="#3fd3cf" stroke="none"/>
      <path d="M15 19.5 V31"/>
      <path d="M21 31 V19.5 M21 23.5 C21.5 20.5 24 19.2 26.5 19.5 C29 19.8 30 21.6 30 24 V31"/>
      <path d="M11 34.5 H33" strokeWidth="1.4" opacity="0.8"/>
    </g>
  </svg>
);

export default LinkedInMark;
