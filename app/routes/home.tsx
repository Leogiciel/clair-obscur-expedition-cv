import { pageMeta } from '~/data';
import HomePage from '~/pages/home';

import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return pageMeta('overview');
}

export default function Home() {
  return <HomePage />;
}
