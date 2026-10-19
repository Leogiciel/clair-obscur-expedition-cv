import { pageMeta } from '~/data';
import SkillTreePage from '~/pages/skilltree';

export function meta() {
  return pageMeta('skillTree');
}

export default function SkillTree() {
  return <SkillTreePage />;
}
