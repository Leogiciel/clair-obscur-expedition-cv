// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import { FIT_STAGE_SCRIPT, STAGE_H, STAGE_W, fitStage } from './size';

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
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(FIT_STAGE_SCRIPT)();
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
