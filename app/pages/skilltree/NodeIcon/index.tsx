import type { NodeIcon as Icon } from '~/data';

import TechIcon from '../../common/TechIcon';

// Leadership nodes have no logo: cyan sigils in the picto style (a banner for Lead, a crown for CTO / Founder).
const SIGILS: Record<'lead' | 'cto', string> = {
  lead: 'M12 3 V21 M12 4 H20 L17.5 7.5 L20 11 H12',
  cto: 'M4 17 L5.5 8 L9.5 12 L12 6 L14.5 12 L18.5 8 L20 17 Z M4 20 H20'
};

const NodeIcon = ({ icon }: { icon: Icon }) =>
  icon === 'lead' || icon === 'cto' ? (
    <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden>
      <path
        d={SIGILS[icon]}
        fill="none"
        stroke="#3fd3cf"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <TechIcon id={icon} />
  );

export default NodeIcon;
