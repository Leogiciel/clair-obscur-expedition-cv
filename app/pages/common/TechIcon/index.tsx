import {TECH, type Tech, type TechId} from '../data';
import BrandMark from '../BrandMark';

// Initials for techs without a mark: short names stay whole (SQL, AWS), longer ones keep their capitals.
const initials = (name: string) => (name.length <= 4 ? name : name.replace(/[^A-Z]/g, '').slice(0, 3) || name.slice(0, 2));

const TechIcon = ({id}: {id: TechId}) => {
  const tech: Tech = TECH[id];
  if (tech.src) return <img src={tech.src} alt={tech.name} className="h-[60%] w-[60%] object-contain"/>;
  return tech.icon ? <BrandMark path={tech.icon.path} hex={tech.icon.hex} title={tech.name}/> : <BrandMark text={initials(tech.name)} title={tech.name}/>;
};

export default TechIcon;
