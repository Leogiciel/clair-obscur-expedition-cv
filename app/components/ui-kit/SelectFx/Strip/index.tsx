import './style.scss';

// Scrolls one tile per cycle so the seamless motif loops without a jump.
const Strip = ({src, tile, speed, width}: {src: string; tile: number; speed: number; width: number}) => (
  <div
    className="SelectFx-strip"
    style={{
      width: width + tile,
      backgroundImage: `url('${src}')`,
      '--tile': `${tile}px`,
      animationDuration: `${tile / speed}s`,
    } as React.CSSProperties}
  />
);

export default Strip;
