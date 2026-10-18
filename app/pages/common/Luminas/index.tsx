import TextureLowerPanel from '~/components/ui-kit/TextureLowerPanel';
import TextureLuminas from '~/components/ui-kit/TextureLuminas';
import TextureLuminasRow from '~/components/ui-kit/TextureLuminas/TextureLuminasRow';
import Glyph from '../Glyph';
import Label from '../Label';
import Num from '../Num';
import CardTitle from '../CardTitle';
import useLoadout from '../store/useLoadout';
import {LUMINA_SLOTS, pictoById} from '../data';

const Luminas = () => {
  const equipped = useLoadout((s) => s.pictos).filter((id) => id !== null).map(pictoById);
  return (
    <TextureLowerPanel className="absolute left-[1860px] top-[900px]">
      <TextureLuminas
        className="absolute left-[-10px] top-0"
        title={<CardTitle size={45} className="relative top-[-5px] pl-[52px]" style={{color: '#d6d0c2'}}>Luminas</CardTitle>}
        counter={<Num size={52} style={{letterSpacing: '0.08em', color: 'var(--el-cyan)'}}>{equipped.length}/{LUMINA_SLOTS}</Num>}
        counterIcon={<span className="block h-[40px] w-[40px]" aria-hidden/>}
      >
        {equipped.slice(0, 2).map((p) => (
          <TextureLuminasRow key={p.id} marked icon={<Glyph element={p.element}/>} aside={<Num size={30}>{p.level}</Num>}>
            <Label size={32}>{p.name}</Label>
          </TextureLuminasRow>
        ))}
      </TextureLuminas>
    </TextureLowerPanel>
  );
};

export default Luminas;
