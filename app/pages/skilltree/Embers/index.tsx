import './style.scss';

// The red petals floating in the game's skill tree background (design/skill-tree-screen.png). Positions, sizes and
// timings are fixed so the server and client render the same markup.
const EMBERS = [
  {x: 260, y: 980, size: 22, delay: 0, duration: 14, drift: 60},
  {x: 410, y: 1240, size: 14, delay: -3, duration: 11, drift: -40},
  {x: 640, y: 1120, size: 18, delay: -7, duration: 16, drift: 30},
  {x: 900, y: 1300, size: 26, delay: -2, duration: 18, drift: -70},
  {x: 1080, y: 1010, size: 12, delay: -9, duration: 12, drift: 50},
  {x: 1270, y: 1260, size: 20, delay: -5, duration: 15, drift: -30},
  {x: 1460, y: 1150, size: 16, delay: -11, duration: 13, drift: 40},
  {x: 1690, y: 1320, size: 24, delay: -6, duration: 17, drift: -60},
  {x: 1880, y: 1080, size: 12, delay: -1, duration: 12, drift: 30},
  {x: 2120, y: 1240, size: 18, delay: -8, duration: 15, drift: -50},
  {x: 2330, y: 1050, size: 14, delay: -4, duration: 14, drift: 40},
  {x: 140, y: 1330, size: 16, delay: -12, duration: 19, drift: 50},
];

const Embers = () => (
  <div className="Embers" aria-hidden>
    {EMBERS.map((e, i) => (
      <span
        key={i}
        className="Embers-petal"
        style={{left: e.x, top: e.y, width: e.size, height: e.size * 0.75, animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s`, '--drift': `${e.drift}px`} as React.CSSProperties}
      />
    ))}
  </div>
);

export default Embers;
