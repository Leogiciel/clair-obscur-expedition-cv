import { pageMeta } from '~/data';
import StartScreen from '~/pages/common/StartScreen';

import type { Route } from './+types/start';

export function meta({}: Route.MetaArgs) {
  return pageMeta('start');
}

export default function Start() {
  return <StartScreen />;
}
