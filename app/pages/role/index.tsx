import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import TextureListPanel from '~/components/ui-kit/TextureListPanel';
import TextureWeaponRows from '~/components/ui-kit/TextureWeaponRows';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';
import TextureCard from '~/components/ui-kit/TextureCard';
import TextureEquippedCard from '~/components/ui-kit/TextureEquippedCard';
import KeyHint from '~/components/ui-kit/KeyHint';
import PaintFlow from '~/components/ui-kit/PaintFlow';
import Stage from '../common/Stage';
import {Grade, Label, Num, PartyBar} from '../common/ui';
import CharacterStats from '../home/CharacterStats';
import {ROLES, type Role} from '../home/data';

// Measured on the video: selected row at (200, 310), normal at (244, 404); centers 85px apart.
const FIRST_CENTER = 356;
const PITCH = 85;
const ROW = {
  selected: {x: 200, center: 46, width: 488, height: 92, top: 10},
  normal: {x: 244, center: 37, width: 420, height: 74, top: 6},
};

const RoleStats = ({role}: {role: Role}) => (
  <>
    <span className="flex flex-col items-center gap-1"><Label size={27}>Years</Label><Num size={62}>{role.years}</Num></span>
    <span className="flex flex-col items-center gap-1"><Label size={27}>Team</Label><Num size={62}>{role.team}</Num></span>
    <span className="flex flex-col items-center gap-1"><Label size={22}>Leadership</Label><Grade>{role.leadership}</Grade></span>
    <span className="flex flex-col items-center gap-1"><Label size={22}>Delivery</Label><Grade>{role.delivery}</Grade></span>
  </>
);

const LevelBlock = ({level}: {level: number}) => (
  <span className="flex flex-col items-center"><Label size={26}>Level</Label><Num size={56}>{level}</Num></span>
);

const RolePage = () => {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState(true);
  const role = ROLES[cursor];
  const current = ROLES[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') setCursor((c) => Math.min(ROLES.length - 1, c + 1));
      else if (e.key === 'ArrowUp') setCursor((c) => Math.max(0, c - 1));
      else if (e.key === 'y' || e.key === 'Y') setTooltip((t) => !t);
      else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') navigate('/');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <Stage>
      <PartyBar/>

      <TextureListPanel className="absolute left-[100px] top-[278px]"/>
      <TextureTitleSort
        title="Role"
        className="absolute left-[4px] top-[193px]"
        sortKey={<KeyHint keyLabel="X" tone="x" className="[&_.KeyHint-key]:size-[40px] [&_.KeyHint-key]:text-[20px]"/>}
        sort="Chronological"
        aside={<KeyHint keyLabel="R" label="Descending" className="[&_.KeyHint-label]:text-[30px]"/>}
      />

      <ul aria-label="Roles">
        {ROLES.map((r, i) => {
          const variant = i === cursor ? 'selected' : 'normal';
          const g = ROW[variant];
          const top = FIRST_CENTER + i * PITCH - g.center;
          return (
            <li
              key={r.id}
              className={`Screen-item ${hovered === i ? 'Screen-item--active' : ''}`}
              style={{left: g.x, top, width: g.width, height: g.height}}
              tabIndex={0}
              aria-current={i === cursor}
              onMouseEnter={() => { setCursor(i); setHovered(i); }}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => { setCursor(i); setHovered(i); }}
              onBlur={() => setHovered(null)}
            >
              <div className="Screen-slide">
                <TextureWeaponRows variant={variant} aside={<span className="flex flex-col items-center"><Label size={22}>Level</Label><Num size={40}>{r.level}</Num></span>}>
                  <Label size={r.title.length > 14 ? 28 : 34}>{r.title}</Label>
                </TextureWeaponRows>
              </div>
              <PaintFlow active={hovered === i} splashX={variant === 'selected' ? 60 : 40} center={g.center} fringe={{left: 90, right: 60, top: g.top - 12}}/>
            </li>
          );
        })}
      </ul>

      {tooltip && (
        <TextureCard className="absolute left-[740px] top-[296px] h-[216px] w-[560px]">
          <div className="absolute left-[14px] top-[-22px] h-[192px] w-[470px]">
            <div className="Screen-cardTitle absolute left-[62px] top-[30px]">{role.title}</div>
            <div className="Screen-label absolute left-[64px] top-[74px]" style={{fontSize: 20, opacity: 0.75}}>{role.company} · {role.period}</div>
            <span className="absolute left-[424px] top-[-6px]"><LevelBlock level={role.level}/></span>
            <div className="absolute left-[8px] top-[94px] grid w-[450px] grid-cols-4 text-center"><RoleStats role={role}/></div>
          </div>
        </TextureCard>
      )}

      <CharacterStats className="absolute left-[1880px] top-[80px] h-[700px] w-[490px]"/>

      <TextureEquippedCard
        className="absolute left-[1830px] top-[918px]"
        title={<span className="Screen-cardTitle" style={{fontSize: 36}}>{current.title}</span>}
        aside={<LevelBlock level={current.level}/>}
      >
        <RoleStats role={current}/>
      </TextureEquippedCard>

      <div className="Screen-hints absolute left-[1965px] top-[1293px]">
        <button type="button" className="contents" onClick={() => setTooltip((t) => !t)}>
          <KeyHint keyLabel="Y" tone="y" label={tooltip ? 'Hide Tooltip' : 'Show Tooltip'}/>
        </button>
        <button type="button" className="contents" onClick={() => navigate('/')}>
          <KeyHint keyLabel="B" tone="b" label="Back"/>
        </button>
      </div>
    </Stage>
  );
};

export default RolePage;
