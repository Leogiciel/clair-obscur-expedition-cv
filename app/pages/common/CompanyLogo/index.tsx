import BrandMark from '../BrandMark';
import type { Experience } from '../data';

const CompanyLogo = ({ experience }: { experience: Experience }) => {
  const { logo, company } = experience;
  if ('icon' in logo) return <BrandMark path={logo.icon.path} hex={logo.icon.hex} title={company} />;
  return <img src={logo.src} alt={company} className="h-[62%] w-[62%] object-contain" />;
};

export default CompanyLogo;
