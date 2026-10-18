import SkillTreePage from '~/pages/skilltree';

import type { Route } from './+types/skilltree';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Skill Tree — Yellow Obscur: Expedition 34' },
    { name: 'description', content: 'Learning path of Olivier Nguyen' }
  ];
}

export default function SkillTree() {
  return <SkillTreePage />;
}
