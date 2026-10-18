export type Mode = 'stack' | 'overlay';

const Section = ({
  title,
  refSrc,
  w,
  h,
  mode,
  children
}: {
  title: string;
  refSrc: string;
  w: number;
  h: number;
  mode: Mode;
  children: React.ReactNode;
}) => (
  <section className="mb-14">
    <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-neutral-500">
      {title} · {w}×{h}
    </h2>
    <div
      className={mode === 'overlay' ? 'relative' : 'flex flex-col gap-4'}
      style={mode === 'overlay' ? { width: w, height: h } : undefined}
    >
      <img
        src={`/design/ref/${refSrc}`}
        width={w}
        height={h}
        alt=""
        className={mode === 'overlay' ? 'absolute inset-0 z-10 opacity-50' : ''}
      />
      <div
        data-recreation
        className="ui-grain ui-film relative overflow-visible bg-black"
        style={{ width: w, height: h }}
      >
        {children}
      </div>
    </div>
  </section>
);

export default Section;
