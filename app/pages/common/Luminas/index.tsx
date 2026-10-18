import {Link} from 'react-router';
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
// an equipped picto provides for free. The panel opens the Luminas screen.
const ROWS = 3;

const Luminas = () => {
  const pictos = useLoadout((s) => s.pictos);
  const active = useLoadout((s) => s.luminas);
  const equipped = pictos.filter((id) => id !== null);
  const rows = [...equipped, ...active.filter((id) => !equipped.includes(id))].map(pictoById);
  return (
    <Link to="/luminas" data-nav className="Luminas" aria-label="Luminas">
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
    </Link>
  );
};

export default Luminas;
