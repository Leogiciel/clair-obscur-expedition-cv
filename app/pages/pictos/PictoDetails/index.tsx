import DiamondCardDivider from '~/components/ui-kit/TextureDiamondCard/DiamondCardDivider';
import Label from '../../common/Label';
import Num from '../../common/Num';
import CardTitle from '../../common/CardTitle';
import type {Picto} from '../../common/data';

// Same layout as the game's picto cards: two stats, level on the right, then the effect under a divider.
const PictoDetails = ({picto}: {picto: Picto}) => (
  <>
    <div className="absolute left-[2px] top-0"><CardTitle size={36} style={{letterSpacing: '0.03em'}}>{picto.name}</CardTitle></div>
    {picto.stats.map((s, i) => (
      <span key={s.label} className="absolute top-[43px] flex w-[100px] flex-col items-center gap-[10px]" style={{left: 18 + i * 99}}>
        <Label size={i ? 15 : 22}>{s.label}</Label>
        <Num size={30}>{s.value}</Num>
      </span>
    ))}
    <span className="absolute left-[337px] top-[43px] flex w-[100px] flex-col items-center"><Label size={22}>Level</Label><Num size={40}>{picto.level}</Num></span>
    <DiamondCardDivider className="absolute left-[16px] top-[107px] w-[250px]"/>
    <Label as="p" size={26} className="absolute left-[27px] top-[116px] w-[345px]" style={{lineHeight: 1.1}}>{picto.description}</Label>
  </>
);

export default PictoDetails;
