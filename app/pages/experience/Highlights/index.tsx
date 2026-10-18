import CardTitle from '../../common/CardTitle';
import Label from '../../common/Label';

const Highlights = ({items, className = ''}: {items: string[]; className?: string}) => (
  <section aria-label="Highlights" className={`w-[580px] ${className}`}>
    <CardTitle size={32} as="div">Highlights</CardTitle>
    <ul className="mt-[14px] flex flex-col gap-[10px]">
      {items.map((item) => (
        <li key={item} className="flex gap-[12px]">
          <span className="mt-[9px] size-[8px] shrink-0 rotate-45 bg-[var(--ui-gold)]" aria-hidden/>
          <Label size={22} style={{lineHeight: 1.25}}>{item}</Label>
        </li>
      ))}
    </ul>
  </section>
);

export default Highlights;
