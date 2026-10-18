import PictosPage from '~/pages/pictos';

import type { Route } from './+types/pictos';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Pictos — Yellow Obscur: Expedition 34' },
    { name: 'description', content: 'Qualities of Olivier Nguyen' }
  ];
}

export default function Pictos() {
  return <PictosPage />;
}
