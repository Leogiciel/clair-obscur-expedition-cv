import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import TextureListPanel from '~/components/ui-kit/TextureListPanel';
import TextureWeaponRows from '~/components/ui-kit/TextureWeaponRows';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';
import TextureCard from '~/components/ui-kit/TextureCard';
import TextureEquippedCard from '~/components/ui-kit/TextureEquippedCard';
import KeyHint from '~/components/ui-kit/KeyHint';
import PaintFlow from '~/components/ui-kit/PaintFlow';
import Label from '../common/Label';
import Num from '../common/Num';
import CardTitle from '../common/CardTitle';
import {ROLES} from '../common/data';
import RoleStats from './RoleStats';
import LevelBlock from './LevelBlock';

// Measured on the video: selected row at (200, 310), normal at (244, 404); centers 85px apart.
const FIRST_CENTER = 356;
const PITCH = 85;
const ROW = {
  selected: {x: 200, center: 46, width: 488, height: 92, top: 10},
  normal: {x: 244, center: 37, width: 420, height: 74, top: 6},
};

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
    <>
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
            <CardTitle as="div" className="absolute left-[62px] top-[30px]">{role.title}</CardTitle>
            <Label as="div" size={20} className="absolute left-[64px] top-[74px]" style={{opacity: 0.75}}>{role.company} · {role.period}</Label>
            <span className="absolute left-[424px] top-[-6px]"><LevelBlock level={role.level}/></span>
            <div className="absolute left-[8px] top-[94px] grid w-[450px] grid-cols-4 text-center"><RoleStats role={role}/></div>
          </div>
        </TextureCard>
      )}

      <TextureEquippedCard
        className="absolute left-[1830px] top-[918px]"
        title={<CardTitle size={36}>{current.title}</CardTitle>}
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
    </>
  );
};

export default RolePage;
