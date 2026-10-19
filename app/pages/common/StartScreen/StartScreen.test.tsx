// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import StartScreen from '.';

// The share of clips downloaded, driven by each test; the drawing layers do not matter here.
let progress = 0;
vi.mock('../Character/clips', () => ({ clipsProgress: () => progress }));
vi.mock('./ExpeditionLogo', () => ({ default: () => null }));
vi.mock('./TitleParticles', () => ({ default: () => null }));

const renderAt = () => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <StartScreen /> },
      { path: '/overview', element: <p>Overview</p> }
    ],
    { initialEntries: ['/'] }
  );
  render(<RouterProvider router={router} />);
  return router;
};
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  progress = 0;
  Object.defineProperty(document, 'fonts', { configurable: true, value: { status: 'loaded' } });
});
// Testing Library only cleans up by itself with Vitest's globals, which this project leaves off.
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('StartScreen', () => {
  it('shows the loading share until every clip is in memory', () => {
    renderAt();
    progress = 0.5;
    advance(250);
    // The fonts count for one part in nineteen: 0.5 of the clips is 53 %.
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('53');
    expect(screen.queryByText('Press Any Button')).toBeNull();
  });

  it('ignores keys while loading, so nobody enters before the camera moves are ready', () => {
    const router = renderAt();
    fireEvent.keyDown(window, { key: 'Enter' });
    advance(2000);
    expect(router.state.location.pathname).toBe('/');
  });

  it('enters the overview on any key once loaded', () => {
    const router = renderAt();
    progress = 1;
    advance(250);
    expect(screen.getByText('Press Any Button')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'x' });
    advance(1000);
    expect(router.state.location.pathname).toBe('/overview');
    expect(document.documentElement.hasAttribute('data-start')).toBe(false);
  });

  it('lets the visitor in after a while even if some clips never arrive', () => {
    const router = renderAt();
    progress = 0.9;
    advance(26000);
    fireEvent.pointerDown(window);
    advance(1000);
    expect(router.state.location.pathname).toBe('/overview');
  });

  it('keeps keys from reaching the menu behind it', () => {
    renderAt();
    const behind = vi.fn();
    window.addEventListener('keydown', behind);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(behind).not.toHaveBeenCalled();
    window.removeEventListener('keydown', behind);
  });
});
