import { pageMeta } from '~/data';
import SkillTreePage from '~/pages/skilltree';

import type { Route } from './+types/skilltree';

export function meta({}: Route.MetaArgs) {
  return pageMeta('skillTree');
}

export default function SkillTree() {
  return <SkillTreePage />;
}
