import HomePage from '~/pages/home';

import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Yellow Obscur: Expedition 34' },
    { name: 'description', content: 'Welcome to CV of Olivier Nguyen' }
  ];
}

export default function Home() {
  return <HomePage />;
}
