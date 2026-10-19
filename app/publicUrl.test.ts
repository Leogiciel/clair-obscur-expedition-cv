import { describe, expect, it } from 'vitest';

import { publicUrl } from './publicUrl';

describe('publicUrl', () => {
  it('resolves a public file under the base the site is served from', () => {
    expect(publicUrl('ui/start-ink.webp')).toBe(`${import.meta.env.BASE_URL}ui/start-ink.webp`);
    expect(publicUrl('favicon.ico').endsWith('/favicon.ico')).toBe(true);
  });
});
