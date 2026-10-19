// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { FIT_STAGE_SCRIPT, STAGE_H, STAGE_W, fitStage, useFitStage } from './size';

const resize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};
const scale = () => document.documentElement.style.getPropertyValue('--stage-scale');

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
    const fromScript = scale();
    document.documentElement.removeAttribute('style');
    fitStage();
    expect(scale()).toBe(fromScript);
    expect(Number(fromScript)).toBeCloseTo(Math.min(width / STAGE_W, height / STAGE_H));
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
