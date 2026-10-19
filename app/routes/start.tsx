import { pageMeta } from '~/data';
import StartScreen from '~/pages/common/StartScreen';

export function meta() {
  return pageMeta('start');
}

export default function Start() {
  return <StartScreen />;
}
