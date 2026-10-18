import BrandMark from '../BrandMark';
import { TECH, type Tech, type TechId } from '../data';

// Initials for techs without a mark: short names stay whole (SQL, AWS), longer ones keep their capitals.
const initials = (name: string) =>
  name.length <= 4 ? name : name.replace(/[^A-Z]/g, '').slice(0, 3) || name.slice(0, 2);

const TechIcon = ({ id, muted = false }: { id: TechId; muted?: boolean }) => {
  const tech: Tech = TECH[id];
  if (tech.src)
    return (
      <img
        src={tech.src}
        alt={tech.name}
        className="h-[55%] w-[55%] object-contain"
        style={muted ? { filter: 'grayscale(1) brightness(0.7)' } : undefined}
      />
    );
  return tech.icon ? (
    <BrandMark path={tech.icon.path} hex={tech.icon.hex} title={tech.name} muted={muted} />
  ) : (
    <BrandMark text={initials(tech.name)} title={tech.name} muted={muted} />
  );
};

export default TechIcon;
