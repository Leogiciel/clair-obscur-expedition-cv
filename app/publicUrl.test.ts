import { describe, expect, it, vi } from 'vitest';

describe('publicUrl', () => {
  // GitHub Pages serves the site from the repository's subfolder: a root-absolute path would miss every file.
  it('resolves a public file under the folder the site is served from', async () => {
    vi.stubEnv('BASE_URL', '/clair-obscur-expedition-cv/');
    vi.resetModules();
    const { publicUrl } = await import('./publicUrl');
    expect(publicUrl('ui/start-ink.webp')).toBe('/clair-obscur-expedition-cv/ui/start-ink.webp');
  });

  it('resolves at the root otherwise', async () => {
    vi.stubEnv('BASE_URL', '/');
    vi.resetModules();
    const { publicUrl } = await import('./publicUrl');
    expect(publicUrl('favicon.ico')).toBe('/favicon.ico');
  });
});
