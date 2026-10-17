import type {Route} from './+types/role';
import RolePage from '~/pages/role';

export function meta({}: Route.MetaArgs) {
  return [
    {title: 'Role — Yellow Obscur: Expedition 34'},
    {name: 'description', content: 'Roles of Olivier Nguyen'},
  ];
}

export default function Role() {
  return <RolePage/>;
}
