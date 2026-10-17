import measures from './measures.json';
import './style.scss';

export type SelectFxKind = keyof typeof measures;

interface SelectFxProps {
  kind: SelectFxKind;
  active: boolean;
  // The video shows no selected state for weapon slots: the effect grows with the plate around its center.
  grow?: number;
}

// Captured from the game video by scripts/ui-kit/extract/select-fx.py.
// The left smear goes under the plate: the parent must isolate its stacking context (Screen-item).
// Its two copies are offset by half a life and cross-fade, so density stays constant and the motif never repeats.

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

const SelectFx = ({kind, active, grow = 1}: SelectFxProps) => {
  const m = measures[kind];
  const {smear, asset} = m;
  const state = active ? 'SelectFx--active' : '';
  // Scale around the box center, expressed in each layer's coordinates.
  const grown = (left: number, top: number): React.CSSProperties => ({
    transformOrigin: `${m.origin[0] - left}px ${m.origin[1] - top}px`,
    transform: active && grow !== 1 ? `scale(${grow})` : undefined,
  });

  return (
    <>
      <div
        className={`SelectFx SelectFx-smear ${state}`}
        style={{left: smear.left, top: smear.top, width: smear.width, height: smear.height, ...grown(smear.left, smear.top)}}
        aria-hidden
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="SelectFx-drift"
            style={{'--drift': `${smear.drift / 2}px`, animationDuration: `${smear.life}s`, animationDelay: `${-i * smear.life / 2}s`} as React.CSSProperties}
          />
        ))}
      </div>
      <div
        className={`SelectFx ${state}`}
        style={{left: m.left, top: m.top, width: m.width, height: m.height, backgroundImage: `url('/ui/tex/fx-${asset}.webp')`, ...grown(m.left, m.top)}}
        aria-hidden
      >
        {m.flows.map((flow, i) => (
          <div
            key={i}
            className="SelectFx-flow"
            style={{left: flow.left, top: flow.top, width: flow.width, height: flow.height, maskImage: `url('/ui/tex/fx-${asset}-mask-${i}.webp')`}}
          >
            <Strip src={`/ui/tex/fx-${asset}-flow-${i}.webp`} tile={flow.tile} speed={flow.speed} width={flow.width}/>
          </div>
        ))}
      </div>
    </>
  );
};

export default SelectFx;
