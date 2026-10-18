import { pageMeta } from '~/data';
import SkillsPage from '~/pages/skills';

import type { Route } from './+types/skills';

export function meta({}: Route.MetaArgs) {
  return pageMeta('skills');
}

export default function Skills() {
  return <SkillsPage />;
}
