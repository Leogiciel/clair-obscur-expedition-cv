import DevKitPage from '~/pages/devkit';

export function meta() {
  return [{ title: 'UI kit' }, { name: 'robots', content: 'noindex' }];
}

export default function DevKit() {
  return <DevKitPage />;
}
