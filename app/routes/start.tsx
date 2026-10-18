import StartScreen from '~/pages/common/StartScreen';

import type { Route } from './+types/start';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Olivier Nguyen: Expedition 35' },
    { name: 'description', content: 'The CV of Olivier Nguyen, as a Clair Obscur menu' }
  ];
}

export default function Start() {
  return <StartScreen />;
}
