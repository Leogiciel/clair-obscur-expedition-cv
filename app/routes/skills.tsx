import { pageMeta } from '~/data';
import SkillsPage from '~/pages/skills';

export function meta() {
  return pageMeta('skills');
}

export default function Skills() {
  return <SkillsPage />;
}
