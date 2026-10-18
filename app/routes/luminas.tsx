import { pageMeta } from '~/data';
import LuminasPage from '~/pages/luminas';

import type { Route } from './+types/luminas';

export function meta({}: Route.MetaArgs) {
  return pageMeta('luminas');
}

export default function Luminas() {
  return <LuminasPage />;
}
