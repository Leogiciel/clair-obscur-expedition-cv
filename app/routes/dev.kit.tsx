import DevKitPage from '~/pages/devkit';

export function meta() {
  return [{ title: 'Kit UI' }, { name: 'robots', content: 'noindex' }];
}

export default function DevKit() {
  return <DevKitPage />;
}
