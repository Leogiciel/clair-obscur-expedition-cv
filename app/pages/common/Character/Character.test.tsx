// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Character from '.';
import { LOOPS, TRANSITIONS } from './sources';

// Every clip is already in memory, under its own file's URL.
const preloadClips = vi.hoisted(() => vi.fn());
vi.mock('./clips', () => ({
  clipUrl: (url: string) => url,
  clipsVersion: () => 0,
  preloadClips,
  subscribeClips: () => () => {}
}));

let reducedMotion = false;
let upright = false;
const orientationListeners = new Set<() => void>();
const matchMedia = (query: string) =>
  ({
    get matches() {
      if (query.includes('reduced-motion')) return reducedMotion;
      return query.includes('portrait') ? upright : false;
    },
    addEventListener: (_: string, listener: () => void) => orientationListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => orientationListeners.delete(listener)
  }) as unknown as MediaQueryList;
const turn = () => {
  upright = false;
  act(() => orientationListeners.forEach((listener) => listener()));
};

// The clips attached to a <video>, by their name in sources.ts.
const attached = (container: HTMLElement) => {
  const names = new Map(Object.entries({ ...LOOPS, ...TRANSITIONS }).map(([name, url]) => [url, name]));
  return [...container.querySelectorAll('video[src]')].map((v) => names.get(v.getAttribute('src')!)).sort();
};

const visibleLoops = (container: HTMLElement) =>
  attached(container).filter((name) => {
    const video = container.querySelector<HTMLVideoElement>(
      `.Character-loop video[src="${LOOPS[name as keyof typeof LOOPS]}"]`
    );
    return video?.parentElement?.style.visibility === 'visible';
  });

const moveOf = (container: HTMLElement, key: keyof typeof TRANSITIONS) =>
  container.querySelector(`video[src="${TRANSITIONS[key]}"]`)!;

beforeEach(() => {
  reducedMotion = false;
  upright = false;
  orientationListeners.clear();
  preloadClips.mockClear();
  // Nor the Web Animations API, which fades the new loop in.
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: () => ({}) });
  vi.stubGlobal('matchMedia', matchMedia);
  // jsdom has no media playback.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue();
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockReturnValue();
});
// Testing Library only cleans up by itself with Vitest's globals, which this project leaves off.
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it('lets go of the screen it left once the move has played and handed over', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { container, rerender } = render(<Character shot="skills" />);
    rerender(<Character shot="skilltree" />);
    const move = moveOf(container, 'skills-skilltree');
    fireEvent(move, new Event('loadeddata'));
    fireEvent(move, new Event('ended'));
    expect(attached(container)).toContain('skills-skilltree');
    act(() => void vi.advanceTimersByTime(250));
    expect(attached(container)).toEqual(['skills', 'skilltree', 'skilltree-skills']);
  });

  it('keeps the old loop on screen while the move is still loading', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { container, rerender } = render(<Character shot="skills" />);
    expect(visibleLoops(container)).toEqual(['skills']);
    rerender(<Character shot="skilltree" />);
    expect(visibleLoops(container)).toEqual(['skills']);
    act(() => void vi.advanceTimersByTime(500));
    expect(visibleLoops(container)).toEqual(['skilltree']);
  });

  it('cuts to the new screen when the move is not ready in time, and lets go of the old one', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { container, rerender } = render(<Character shot="skills" />);
    rerender(<Character shot="skilltree" />);
    act(() => void vi.advanceTimersByTime(500));
    expect(attached(container)).toEqual(['skills', 'skilltree', 'skilltree-skills']);
  });

  it('loads nothing on a phone held upright, until it is turned', () => {
    // Upright phones only see the screen asking to turn them: the clips would be 16 MB downloaded for nothing.
    upright = true;
    const { container } = render(<Character shot="overview" />);
    expect(attached(container)).toEqual([]);
    expect(preloadClips).not.toHaveBeenCalled();
    turn();
    expect(preloadClips).toHaveBeenCalledOnce();
    expect(attached(container)).toContain('overview');
  });
});
