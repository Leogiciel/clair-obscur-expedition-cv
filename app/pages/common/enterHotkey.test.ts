// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

import enterHotkey from './enterHotkey';

const press = (callback: () => void) => {
  const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
  enterHotkey(callback).callback(event);
  return event;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('enterHotkey', () => {
  it('runs the screen’s action when nothing is focused', () => {
    const action = vi.fn();
    const event = press(action);
    expect(action).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('stands down on a focused button, which Enter already clicks', () => {
    document.body.innerHTML = '<button>Slot</button>';
    document.querySelector('button')!.focus();
    const action = vi.fn();
    const event = press(action);
    expect(action).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('stands down on a focused link too', () => {
    document.body.innerHTML = '<a href="/skills">Skills</a>';
    document.querySelector('a')!.focus();
    const action = vi.fn();
    press(action);
    expect(action).not.toHaveBeenCalled();
  });
});
