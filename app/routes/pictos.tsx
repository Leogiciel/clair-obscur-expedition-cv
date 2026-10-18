import { pageMeta } from '~/data';
import PictosPage from '~/pages/pictos';

import type { Route } from './+types/pictos';

export function meta({}: Route.MetaArgs) {
  return pageMeta('pictos');
}

export default function Pictos() {
  return <PictosPage />;
}
