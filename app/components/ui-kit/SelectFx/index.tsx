import { publicUrl } from '~/publicUrl';

import Strip from './Strip';
import measures from './measures.json';
import './style.scss';

export type SelectFxKind = keyof typeof measures;

interface SelectFxProps {
  kind: SelectFxKind;
  active: boolean;
  // The video shows no selected state for weapon slots: the effect grows with the plate around its center.
  grow?: number;
  // Box to stretch the effect to, when the element is not the one it was measured on (list rows).
  fit?: { width: number; height: number };
}

type Measures = (typeof measures)[SelectFxKind];

const stretch = (m: Measures, sx: number, sy: number): Measures => ({
  ...m,
  left: m.left * sx,
  top: m.top * sy,
  width: m.width * sx,
  height: m.height * sy,
  flows: m.flows.map((f) => ({
    ...f,
    left: f.left * sx,
    top: f.top * sy,
    width: f.width * sx,
    height: f.height * sy,
    tile: f.tile * sx,
    speed: f.speed * sx
  })),
  smear: {
    ...m.smear,
    left: m.smear.left * sx,
    top: m.smear.top * sy,
    width: m.smear.width * sx,
    height: m.smear.height * sy,
    drift: m.smear.drift * sx
  },
  origin: [m.origin[0] * sx, m.origin[1] * sy]
});

// Captured from the game video by scripts/ui-kit/extract/select-fx.py.
// The left smear goes under the plate: the parent must isolate its stacking context (Screen-item).
// Its two copies are offset by half a life and cross-fade, so density stays constant and the motif never repeats.

const SelectFx = ({ kind, active, grow = 1, fit }: SelectFxProps) => {
  const base = measures[kind];
  const m = fit ? stretch(base, fit.width / base.size[0], fit.height / base.size[1]) : base;
  const { smear, asset } = m;
  const state = active ? 'SelectFx--active' : '';
  // Scale around the box center, expressed in each layer's coordinates.
  const grown = (left: number, top: number): React.CSSProperties => ({
    transformOrigin: `${m.origin[0] - left}px ${m.origin[1] - top}px`,
    transform: active && grow !== 1 ? `scale(${grow})` : undefined
  });

  return (
    <>
      <div
        className={`SelectFx SelectFx-smear SelectFx-smear--${kind} ${state}`}
        style={{
          left: smear.left,
          top: smear.top,
          width: smear.width,
          height: smear.height,
          ...grown(smear.left, smear.top)
        }}
        aria-hidden
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="SelectFx-drift"
            style={
              {
                '--drift': `${smear.drift / 2}px`,
                animationDuration: `${smear.life}s`,
                animationDelay: `${(-i * smear.life) / 2}s`
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div
        className={`SelectFx ${state}`}
        style={{
          left: m.left,
          top: m.top,
          width: m.width,
          height: m.height,
          backgroundImage: `url('${publicUrl(`ui/tex/fx-${asset}.webp`)}')`,
          ...grown(m.left, m.top)
        }}
        aria-hidden
      >
        {m.flows.map((flow, i) => (
          <div
            key={i}
            className="SelectFx-flow"
            style={{
              left: flow.left,
              top: flow.top,
              width: flow.width,
              height: flow.height,
              maskImage: `url('${publicUrl(`ui/tex/fx-${asset}-mask-${i}.webp`)}')`
            }}
          >
            <Strip
              src={publicUrl(`ui/tex/fx-${asset}-flow-${i}.webp`)}
              tile={flow.tile}
              speed={flow.speed}
              width={flow.width}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default SelectFx;
