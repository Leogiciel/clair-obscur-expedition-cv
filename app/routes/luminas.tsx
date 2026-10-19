import { pageMeta } from '~/data';
import LuminasPage from '~/pages/luminas';

export function meta() {
  return pageMeta('luminas');
}

export default function Luminas() {
  return <LuminasPage />;
}
