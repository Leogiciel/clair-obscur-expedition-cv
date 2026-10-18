import SkillsPage from '~/pages/skills';

import type { Route } from './+types/skills';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Skills — Yellow Obscur: Expedition 34' },
    { name: 'description', content: 'Skills of Olivier Nguyen' }
  ];
}

export default function Skills() {
  return <SkillsPage />;
}
