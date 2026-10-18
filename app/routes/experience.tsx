import { pageMeta } from '~/data';
import ExperiencePage from '~/pages/experience';

import type { Route } from './+types/experience';

export function meta({}: Route.MetaArgs) {
  return pageMeta('experience');
}

export default function Experience() {
  return <ExperiencePage />;
}
