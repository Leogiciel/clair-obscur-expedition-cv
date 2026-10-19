import { pageMeta } from '~/data';
import ExperiencePage from '~/pages/experience';

export function meta() {
  return pageMeta('experience');
}

export default function Experience() {
  return <ExperiencePage />;
}
