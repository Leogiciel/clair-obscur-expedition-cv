import TextureStatsTop from '~/components/ui-kit/TextureStatsTop';
import TextureStatsBar from '~/components/ui-kit/TextureStatsTop/TextureStatsBar';
import TitleRule from '~/components/ui-kit/TitleRule';
import {CHARACTER} from '../data';
import CharacterRadarChart from './RadarChart';
import './style.scss';

const CharacterStats = ({className = ''}: {className?: string}) => (
  <TextureStatsTop className={`CharacterStats ${className}`}>
    <div className="absolute inset-x-0 top-0 pl-4 pr-[34px] pt-[9px]">
      <TitleRule title={CHARACTER.name} variant="name" as="h1" className="[&_.TitleRule-title]:whitespace-nowrap [&_.TitleRule-title]:text-[42px] [&_.TitleRule-row]:pl-[12px]"/>
    </div>
    <div className="CharacterStats-level absolute left-[9px] top-[87px]">
      <span className="CharacterStats-label">Level</span>
      <span className="CharacterStats-num CharacterStats-num--big">{CHARACTER.level}</span>
    </div>
    <TextureStatsBar variant="xp" value={CHARACTER.xp.value} maxValue={CHARACTER.xp.max} className="absolute left-[74px] top-[125px]"/>
    <TextureStatsBar variant="plain" value={CHARACTER.secondary.value} maxValue={CHARACTER.secondary.max} className="absolute left-[22px] top-[181px]"/>
    <h2 className="CharacterStats-title absolute left-[16px] top-[220px]">
      <span>C</span>ombat <span>S</span>tats
    </h2>
    <dl className="CharacterStats-grid absolute left-[18px] top-[258px]">
      {CHARACTER.combat.map((stat) => (
        <div key={stat.label} className="flex items-baseline justify-between">
          <dt>{stat.label}</dt>
          <dd className="CharacterStats-num">{stat.value}</dd>
        </div>
      ))}
    </dl>
    <h2 className="CharacterStats-title absolute left-[16px] top-[388px]">
      <span>A</span>ttributes
    </h2>
    <CharacterRadarChart/>
  </TextureStatsTop>
);

export default CharacterStats;
