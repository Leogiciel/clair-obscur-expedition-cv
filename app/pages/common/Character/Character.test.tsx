// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Character from '.';
import { LOOPS, TRANSITIONS } from './sources';

// Every clip is already in memory, under its own file's URL.
vi.mock('./clips', () => ({
  clipUrl: (url: string) => url,
  clipsVersion: () => 0,
  preloadClips: () => {},
  subscribeClips: () => () => {}
}));

let reducedMotion = false;
const matchMedia = (query: string) =>
  ({
    matches: query.includes('reduced-motion') ? reducedMotion : false,
    addEventListener: () => {},
    removeEventListener: () => {}
  }) as unknown as MediaQueryList;

// The clips attached to a <video>, by their name in sources.ts.
const attached = (container: HTMLElement) => {
  const names = new Map(Object.entries({ ...LOOPS, ...TRANSITIONS }).map(([name, url]) => [url, name]));
  return [...container.querySelectorAll('video[src]')].map((v) => names.get(v.getAttribute('src')!)).sort();
};

beforeEach(() => {
  reducedMotion = false;
  vi.stubGlobal('matchMedia', matchMedia);
  // jsdom has no media playback.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue();
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockReturnValue();
});
// Testing Library only cleans up by itself with Vitest's globals, which this project leaves off.
afterEach(cleanup);

describe('Character', () => {
  it('attaches only the clips the screen can play next', () => {
    const { container } = render(<Character shot="skilltree" />);
    expect(attached(container)).toEqual(['skills', 'skilltree', 'skilltree-skills']);
  });

  it('lets go of the screen it left once the move has ended', () => {
    // An instant cut ends the move at once.
    reducedMotion = true;
    const { container, rerender } = render(<Character shot="skills" />);
    rerender(<Character shot="skilltree" />);
    expect(attached(container)).toEqual(['skills', 'skilltree', 'skilltree-skills']);
  });

  it('keeps the screen it leaves while the move plays', () => {
    const { container, rerender } = render(<Character shot="skills" />);
    rerender(<Character shot="skilltree" />);
    expect(attached(container)).toContain('skills-skilltree');
  });

  it('keeps the return move when the visitor goes back before the move has ended', () => {
    const { container, rerender } = render(<Character shot="overview" />);
    rerender(<Character shot="skills" />);
    rerender(<Character shot="overview" />);
    expect(attached(container)).toContain('skills-overview');
  });
});
