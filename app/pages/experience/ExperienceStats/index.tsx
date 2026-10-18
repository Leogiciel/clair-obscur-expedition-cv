import type { Experience } from '~/data';

import Label from '../../common/Label';
import Num from '../../common/Num';

const ExperienceStats = ({ experience }: { experience: Experience }) => {
  // The duration sits in the card's corner (MonthsBlock), so the stats hold what it doesn't say.
  const stats = [
    ...(experience.figure ? [experience.figure] : []),
    { value: String(experience.stack.length), label: 'Stack' }
  ];
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
