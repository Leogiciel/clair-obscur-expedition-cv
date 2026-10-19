import { describe, expect, it } from 'vitest';

import { routeOf, shotOf } from './screen';

describe('routeOf', () => {
  it('reads a screen served as a folder (GitHub Pages) as the screen itself', () => {
    expect(routeOf('/skills/')).toBe('/skills');
    expect(routeOf('/skills')).toBe('/skills');
  });

  it('keeps the root as it is', () => {
    expect(routeOf('/')).toBe('/');
  });
});

describe('shotOf', () => {
  it('frames the character for each screen', () => {
    expect(shotOf('/skill-tree')).toBe('skilltree');
    expect(shotOf(routeOf('/pictos/'))).toBe('pictos');
  });

  it('uses the overview framing for the start screen and the overview', () => {
    expect(shotOf('/')).toBe('overview');
    expect(shotOf('/overview')).toBe('overview');
  });
});
