import Label from '../../common/Label';
import Num from '../../common/Num';
import './style.scss';

// The game's "Skill Points Available" panel (texture from scripts/ui-kit/extract/skill-points.py). Every point is
// spent, so it reads 0; the Recoat line becomes the years of experience.
const SkillPoints = ({years}: {years: number}) => (
  <div className="SkillPoints" role="status" aria-label={`0 skill points available, ${years} years of experience`}>
    <div className="SkillPoints-title">Skill Points Available</div>
    <Num size={74} className="SkillPoints-value">0</Num>
    <div className="SkillPoints-line">
      <Label size={36} style={{color: '#f4f1e8'}}>Years</Label>
      <Num size={44} style={{color: 'var(--ui-gold)'}}>{years}</Num>
    </div>
  </div>
);

export default SkillPoints;
