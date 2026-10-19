// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { FIT_STAGE_SCRIPT, STAGE_H, STAGE_W, ZOOM_MIN, fitStage, useFitStage } from './size';

const resize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};
const read = (name: string) => document.documentElement.style.getPropertyValue(name);
// What the stage shows at: its zoom, times the transform that shrinks it further.
// The backdrop's scale; the interface's zoom times its shrink must match it.
const scale = () => {
  const shrink = /scale\((.+)\)/.exec(read('--stage-shrink'))?.[1];
  const ui = Number(read('--stage-zoom')) * (shrink ? Number(shrink) : 1);
  expect(ui).toBeCloseTo(Number(read('--stage-scale')), 10);
  return read('--stage-scale');
};

afterEach(() => document.documentElement.removeAttribute('style'));

describe('stage scale', () => {
  // The pre-paint script and React set it in turn (a stale prerendered page once lost the script's value): both
  // must agree on every window shape.
  it.each([
    [844, 390],
    [1440, 900],
    [2510, 1380],
    [1024, 1366]
  ])('is the same from the pre-paint script and from React at %i × %i', (width, height) => {
    resize(width, height);
    // The very string root.tsx inlines in the page, run as the browser runs it.
    const listen = vi.spyOn(window, 'addEventListener');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(FIT_STAGE_SCRIPT)();
    // The script listens for resizes for the page's lifetime: not past this test.
    for (const [type, listener] of listen.mock.calls) window.removeEventListener(type, listener);
    const vars = () => ['--stage-scale', '--stage-zoom', '--stage-shrink'].map(read);
    const fromScript = vars();
    document.documentElement.removeAttribute('style');
    fitStage();
    expect(vars()).toEqual(fromScript);
    expect(Number(scale())).toBeCloseTo(Math.min(width / STAGE_W, height / STAGE_H));
  });

  // WebKit raises zoomed text to 9 px: the interface's smallest text, 15 px, must not be zoomed below that.
  it('zooms no further than the smallest text allows on a phone, and shrinks the rest with a transform', () => {
    resize(844, 390);
    fitStage();
    expect(15 * Number(read('--stage-zoom'))).toBeGreaterThanOrEqual(9 - 1e-9);
    expect(read('--stage-shrink')).toMatch(/^scale\(0\.\d+\)$/);
    expect(Number(read('--stage-zoom'))).toBe(ZOOM_MIN);
  });

  it('uses zoom alone when the window is large enough', () => {
    resize(1920, 1080);
    fitStage();
    expect(read('--stage-shrink')).toBe('none');
  });

  it('fits the stage in the window without cropping it', () => {
    resize(844, 390);
    fitStage();
    const k = Number(scale());
    expect(STAGE_W * k).toBeLessThanOrEqual(844);
    expect(STAGE_H * k).toBeCloseTo(390);
  });
});

describe('useFitStage', () => {
  it('sets the scale back once React has dropped the script’s, and follows the window until unmounted', () => {
    // A hydration mismatch rebuilds <html> without the style the pre-paint script set.
    resize(1440, 900);
    const { unmount } = renderHook(useFitStage);
    expect(Number(scale())).toBeCloseTo(Math.min(1440 / STAGE_W, 900 / STAGE_H));

    resize(844, 390);
    window.dispatchEvent(new Event('resize'));
    expect(Number(scale())).toBeCloseTo(390 / STAGE_H);

    unmount();
    resize(2510, 1380);
    window.dispatchEvent(new Event('resize'));
    expect(Number(scale())).toBeCloseTo(390 / STAGE_H);
  });
});
