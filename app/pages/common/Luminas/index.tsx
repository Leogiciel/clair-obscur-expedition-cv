import {useState} from 'react';
import {Link} from 'react-router';
import SelectFx from '~/components/ui-kit/SelectFx';
import TextureLowerPanel from '~/components/ui-kit/TextureLowerPanel';
import TextureLuminas from '~/components/ui-kit/TextureLuminas';
import TextureLuminasRow from '~/components/ui-kit/TextureLuminas/TextureLuminasRow';
import Glyph from '../Glyph';
import Label from '../Label';
import Num from '../Num';
import CardTitle from '../CardTitle';
import './style.scss';
import useLoadout from '../store/useLoadout';
import {LUMINA_POINTS, luminaCost, luminaPointsSpent, pictoById} from '../data';

// As in the game: points spent over the budget, then the active Luminas with their cost; the gold dot marks the ones
// an equipped picto provides for free.
const HEADER = {width: 470, height: 84};
const ROWS = 3;

const Luminas = () => {
  const pictos = useLoadout((s) => s.pictos);
  const active = useLoadout((s) => s.luminas);
  const equipped = pictos.filter((id) => id !== null);
  const rows = [...equipped, ...active.filter((id) => !equipped.includes(id))].map(pictoById);
  const [selected, setSelected] = useState(false);
  const on = () => setSelected(true);
  const off = () => setSelected(false);
  return (
    <Link
      to="/luminas"
      data-nav
      className={`Luminas Screen-item ${selected ? 'Screen-item--active' : ''}`}
      style={{'--slide': '0px', '--sel-scale': 1.03} as React.CSSProperties}
      aria-label="Luminas"
      onMouseEnter={on}
      onMouseLeave={off}
      onFocus={on}
      onBlur={off}
    >
      <div className="Screen-slide">
        <TextureLowerPanel>
          <TextureLuminas
            className="absolute left-[-10px] top-0"
            title={<CardTitle size={45} className="relative top-[-5px] pl-[52px]" style={{color: '#d6d0c2'}}>Luminas</CardTitle>}
            counter={<Num size={52} style={{letterSpacing: '0.08em', color: 'var(--el-cyan)'}}>{luminaPointsSpent(active, pictos)}/{LUMINA_POINTS}</Num>}
            counterIcon={<span className="block h-[40px] w-[40px]" aria-hidden/>}
          >
            {rows.slice(0, ROWS).map((p) => (
              <TextureLuminasRow key={p.id} marked={equipped.includes(p.id)} icon={<Glyph element={p.element}/>} aside={<Num size={30}>{luminaCost(p)}</Num>}>
                <Label size={32}>{p.name}</Label>
              </TextureLuminasRow>
            ))}
          </TextureLuminas>
        </TextureLowerPanel>
      </div>
      <SelectFx kind="skill" active={selected} fit={HEADER}/>
    </Link>
  );
};

export default Luminas;
