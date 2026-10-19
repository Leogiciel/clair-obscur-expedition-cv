import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from 'react-router';

import { FIT_STAGE_SCRIPT } from '~/pages/common/Stage/size';
import { publicUrl } from '~/publicUrl';

import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  // The gold diamond and its 35 (design/favicon), redrawn bolder for the 16 and 32 px sizes.
  { rel: 'icon', href: publicUrl('favicon.ico'), sizes: '16x16 32x32 48x48' },
  { rel: 'apple-touch-icon', href: publicUrl('apple-touch-icon.png') },
  { rel: 'manifest', href: publicUrl('site.webmanifest') },
  // The ink plume is the largest paint of the start screen and of RotateScreen: fetched with the page, not found
  // late in their CSS.
  { rel: 'preload', href: publicUrl('ui/start-ink.webp'), as: 'image', fetchPriority: 'high' },
  // The fonts of the first screens (start screen, RotateScreen, menu titles), fetched with the page rather than
  // discovered in the CSS; Bebas Neue, for the menus' numbers only, loads when they show.
  ...['cinzel', 'eb-garamond', 'marcellus-sc'].map((font) => ({
    rel: 'preload',
    href: publicUrl(`fonts/${font}-latin.woff2`),
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const
  }))
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070707" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Expedition 35" />
        <script dangerouslySetInnerHTML={{ __html: FIT_STAGE_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
