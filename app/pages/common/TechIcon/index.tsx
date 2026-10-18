import { TECH, type Tech, type TechId } from '~/data';

import BrandMark from '../BrandMark';

// Initials for techs without a mark: short names stay whole (SQL, AWS), longer ones keep their capitals.
const initials = (name: string) =>
  name.length <= 4 ? name : name.replace(/[^A-Z]/g, '').slice(0, 3) || name.slice(0, 2);

// Decorative: every screen writes the technology's name next to its icon (the skill tree's buttons carry it as their
// label), so naming the icon too made screen readers say it twice.
const TechIcon = ({ id, muted = false }: { id: TechId; muted?: boolean }) => {
  const tech: Tech = TECH[id];
  if (tech.src)
    return (
      <img
        src={tech.src}
        alt=""
        className="h-[55%] w-[55%] object-contain"
        style={muted ? { filter: 'grayscale(1) brightness(0.7)' } : undefined}
      />
    );
  return tech.icon ? (
    <BrandMark path={tech.icon.path} hex={tech.icon.hex} title={tech.name} muted={muted} decorative />
  ) : (
    <BrandMark text={initials(tech.name)} title={tech.name} muted={muted} decorative />
  );
};

export default TechIcon;
