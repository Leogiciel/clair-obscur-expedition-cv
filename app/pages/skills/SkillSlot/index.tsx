import TextureMainSkill from '~/components/ui-kit/TextureMainSkill';
import SelectFx from '~/components/ui-kit/SelectFx';
import TechIcon from '../../common/TechIcon';
import type {Skill} from '../../common/data';

interface SkillSlotProps {
  skill: Skill | null;
  index: number;
  focused: boolean;
  left: number;
  top: number;
  onFocus: () => void;
  onLeave: () => void;
  onOpen: () => void;
}

// Same slot and selection effect as on the home screen; the focused slot goes under its neighbours so its smear
// slides under their level badges.
const SkillSlot = ({skill, index, focused, left, top, onFocus, onLeave, onOpen}: SkillSlotProps) => (
  <button
    type="button"
    className={`Screen-item ${focused ? 'Screen-item--active' : ''}`}
    style={{left, top, width: 406, height: 80, zIndex: focused ? 0 : 1, '--slide': '0px', '--sel-scale': 1.1} as React.CSSProperties}
    aria-label={`Skill slot ${index + 1}: ${skill ? skill.name : 'empty'}`}
    aria-current={focused}
    onMouseEnter={onFocus}
    onFocus={onFocus}
    onMouseLeave={onLeave}
    onBlur={onLeave}
    onClick={onOpen}
  >
    <div className="Screen-slide">
      {skill ? (
        <TextureMainSkill icon={<TechIcon id={skill.id}/>} level={skill.level}>{skill.name}</TextureMainSkill>
      ) : (
        <TextureMainSkill empty/>
      )}
    </div>
    <SelectFx kind="skill" active={focused}/>
  </button>
);

export default SkillSlot;
