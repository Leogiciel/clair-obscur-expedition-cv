import { describe, expect, it } from 'vitest';

import { SITE_TITLE, pageMeta } from './site';

describe('pageMeta', () => {
  it('prefixes the page to the site title', () => {
    expect(pageMeta('skills')[0]).toEqual({ title: `Skills — ${SITE_TITLE}` });
  });

  it('shows the site title alone on the start screen', () => {
    expect(pageMeta('start')[0]).toEqual({ title: SITE_TITLE });
  });

  it('describes every page', () => {
    for (const page of [
      'start',
      'overview',
      'experience',
      'pictos',
      'luminas',
      'skills',
      'skillTree'
    ] as const)
      expect(pageMeta(page)[1]).toEqual({
        name: 'description',
        content: expect.stringContaining('Olivier Nguyen')
      });
  });
});
