import { TECH, type TechId } from '~/data';

import Label from '../../common/Label';
import TechIcon from '../../common/TechIcon';

const StackIcons = ({ stack, className = '' }: { stack: TechId[]; className?: string }) => (
  <ul aria-label="Stack" className={`flex w-[470px] flex-wrap gap-x-[6px] gap-y-[10px] ${className}`}>
    {stack.map((id) => (
      <li key={id} className="flex w-[72px] flex-col items-center gap-[4px]">
        <span className="grid size-[48px] place-items-center rounded-full bg-[rgb(0_0_0_/_0.55)]">
          <TechIcon id={id} />
        </span>
        <Label size={15} className="text-center leading-tight opacity-80">
          {TECH[id].name}
        </Label>
      </li>
    ))}
  </ul>
);

export default StackIcons;
