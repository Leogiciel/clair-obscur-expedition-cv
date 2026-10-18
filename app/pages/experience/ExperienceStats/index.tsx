import Label from '../../common/Label';
import Num from '../../common/Num';
import {durationOf, type Experience} from '../../common/data';

const ExperienceStats = ({experience}: {experience: Experience}) => {
  const duration = durationOf(experience);
  const stats = [duration, ...(experience.figure ? [experience.figure] : []), {value: String(experience.stack.length), label: 'Stack'}];
  return (
    <>
      {stats.map((s) => (
        <span key={s.label} className="flex flex-col items-center gap-1">
          <Label size={27}>{s.label}</Label>
          <Num size={s.value.length > 4 ? 48 : 62}>{s.value}</Num>
        </span>
      ))}
    </>
  );
};

export default ExperienceStats;
