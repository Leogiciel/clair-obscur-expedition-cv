// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import useArrowNav from '.';

// Buttons at fixed positions on the stage (jsdom does no layout).
const Grid = ({ at }: { at: Record<string, [number, number]> }) => {
  useArrowNav('.item');
  return (
    <>
      {Object.entries(at).map(([name, [x, y]]) => (
        <button
          key={name}
          className="item"
          ref={(el) => {
            if (el) vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, y, 100, 50));
          }}
        >
          {name}
        </button>
      ))}
    </>
  );
};

const press = (key: string) => act(() => void fireEvent.keyDown(document.body, { key }));
const focused = () => document.activeElement?.textContent;

// Testing Library only cleans up by itself with Vitest's globals, which this project leaves off.
afterEach(cleanup);

describe('useArrowNav', () => {
  it('focuses the first element on the first arrow', () => {
    render(<Grid at={{ a: [0, 0], b: [200, 0] }} />);
    press('ArrowRight');
    expect(focused()).toBe('a');
  });

  it('prefers a slightly offset neighbour over a closer diagonal one', () => {
    // b is a few pixels lower than a, c is diagonal: right from a lands on b.
    render(<Grid at={{ a: [0, 0], b: [300, 6], c: [150, 150] }} />);
    press('ArrowRight');
    press('ArrowRight');
    expect(focused()).toBe('b');
  });

  it('skips a closer element more than 45° off the direction', () => {
    // c is nearer but lower than it is to the right; b, further, lies straight right.
    render(<Grid at={{ a: [0, 0], b: [200, 0], c: [50, 60] }} />);
    press('ArrowRight');
    press('ArrowRight');
    expect(focused()).toBe('b');
  });

  it('falls back to anything further that way when nothing lies within 45°', () => {
    render(<Grid at={{ a: [0, 0], b: [100, 400] }} />);
    press('ArrowRight');
    press('ArrowRight');
    expect(focused()).toBe('b');
  });

  it('stays put when nothing lies that way', () => {
    render(<Grid at={{ a: [0, 0], b: [300, 0] }} />);
    press('ArrowRight');
    press('ArrowLeft');
    expect(focused()).toBe('a');
  });

  it('activates the focused element with A', () => {
    const onClick = vi.fn();
    render(<Grid at={{ a: [0, 0] }} />);
    document.querySelector('button')!.addEventListener('click', onClick);
    press('ArrowDown');
    press('a');
    expect(onClick).toHaveBeenCalledOnce();
  });
});
