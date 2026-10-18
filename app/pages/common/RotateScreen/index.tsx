import './style.scss';

// Phones held upright get the stage shrunk to unreadable: this screen asks to turn them, in the start screen's look
// (gold outline, Marcellus SC, the ink plume). Shown by a media query alone, so it is right from the server render.
const RotateScreen = () => (
  <div className="RotateScreen" role="alert">
    <svg className="RotateScreen-phone" viewBox="0 0 120 120" width="120" height="120" aria-hidden>
      <g fill="none" stroke="#d6bf92" strokeWidth="3" strokeLinejoin="round">
        <rect x="38" y="14" width="44" height="92" rx="8" />
        <path d="M54 22 H66" strokeLinecap="round" />
        <circle cx="60" cy="96" r="3" />
      </g>
    </svg>
    <p className="RotateScreen-title">Rotate Your Device</p>
    <p className="RotateScreen-hint">This CV is laid out like a game menu: it reads in landscape.</p>
  </div>
);

export default RotateScreen;
