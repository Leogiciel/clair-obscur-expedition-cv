import TextureStatsTop from '~/components/ui-kit/TextureStatsTop';
import TextureStatsBar from '~/components/ui-kit/TextureStatsTop/TextureStatsBar';
import TitleRule from '~/components/ui-kit/TitleRule';
import {useState} from 'react';
import {CHARACTER} from '../data';
import Tooltip from '../Tooltip';
import CardTitle from '../CardTitle';
import Label from '../Label';
import Num from '../Num';
import CharacterRadarChart from './RadarChart';
import './style.scss';

const CharacterStats = ({className = ''}: {className?: string}) => {
  const [hint, setHint] = useState<number | null>(null);
  const stat = hint === null ? null : CHARACTER.combat[hint];
  return (
  <TextureStatsTop className={`CharacterStats ${className}`}>
    <div className="absolute inset-x-0 top-0 pl-4 pr-[34px] pt-[9px]">
      <TitleRule title={CHARACTER.name} variant="name" as="h1" className="[&_.TitleRule-title]:whitespace-nowrap [&_.TitleRule-title]:text-[42px] [&_.TitleRule-row]:pl-[12px]"/>
    </div>
    <div className="CharacterStats-level absolute left-[9px] top-[87px]">
      <span className="CharacterStats-label">Level</span>
      <span className="CharacterStats-num CharacterStats-num--big">{CHARACTER.level}</span>
    </div>
    <TextureStatsBar variant="xp" value={CHARACTER.xp.value} maxValue={CHARACTER.xp.max} className="absolute left-[74px] top-[125px]"/>
    <TextureStatsBar variant="plain" tone="health" value={CHARACTER.health.value} maxValue={CHARACTER.health.max} className="absolute left-[22px] top-[181px]"/>
    <h2 className="CharacterStats-title absolute left-[16px] top-[220px]">
      <span>C</span>ombat <span>S</span>tats
    </h2>
    <dl className="CharacterStats-grid absolute left-[18px] top-[258px]">
      {CHARACTER.combat.map((s, i) => (
        <div
          key={s.label}
          className="CharacterStats-stat flex items-baseline justify-between"
          tabIndex={0}
          aria-describedby={hint === i ? 'stat-hint' : undefined}
          onMouseEnter={() => setHint(i)}
          onMouseLeave={() => setHint(null)}
          onFocus={() => setHint(i)}
          onBlur={() => setHint(null)}
        >
          <dt>{s.label}</dt>
          <dd className="CharacterStats-num">{s.value}</dd>
        </div>
      ))}
    </dl>
    <h2 className="CharacterStats-title absolute left-[16px] top-[388px]">
      <span>A</span>ttributes
    </h2>
    <CharacterRadarChart/>
    {stat && (
      <Tooltip left={-500} top={230} width={480} height={170}>
        <div id="stat-hint" className="absolute left-[4px] top-[2px] w-[390px]">
          <CardTitle size={30} as="div" style={{letterSpacing: '0.03em'}}>{stat.label}</CardTitle>
          <div className="mt-[10px] flex items-baseline gap-[14px]">
            <Num size={44}>{stat.value}</Num>
            <Label size={24}>{stat.hint}</Label>
          </div>
        </div>
      </Tooltip>
    )}
  </TextureStatsTop>
  );
};

export default CharacterStats;
