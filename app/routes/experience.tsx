import ExperiencePage from '~/pages/experience';

import type { Route } from './+types/experience';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Experience — Yellow Obscur: Expedition 34' },
    { name: 'description', content: 'Work experience of Olivier Nguyen' }
  ];
}

export default function Experience() {
  return <ExperiencePage />;
}
