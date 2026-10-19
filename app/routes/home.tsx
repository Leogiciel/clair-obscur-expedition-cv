import { pageMeta } from '~/data';
import HomePage from '~/pages/home';

export function meta() {
  return pageMeta('overview');
}

export default function Home() {
  return <HomePage />;
}
