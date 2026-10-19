import { pageMeta } from '~/data';
import PictosPage from '~/pages/pictos';

export function meta() {
  return pageMeta('pictos');
}

export default function Pictos() {
  return <PictosPage />;
}
