import type {Route} from './+types/luminas';
import LuminasPage from '~/pages/luminas';

export function meta({}: Route.MetaArgs) {
  return [
    {title: 'Luminas — Yellow Obscur: Expedition 34'},
    {name: 'description', content: 'Qualities of Olivier Nguyen'},
  ];
}

export default function Luminas() {
  return <LuminasPage/>;
}
