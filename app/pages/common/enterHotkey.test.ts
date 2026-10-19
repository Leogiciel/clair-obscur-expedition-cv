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

  it.each([
    ['a link', '<a href="/skills">Skills</a>'],
    ['a text field', '<input />'],
    ['an element acting as a button', '<div role="button" tabindex="0">Slot</div>']
  ])('stands down on %s too', (_, html) => {
    document.body.innerHTML = html;
    document.body.querySelector<HTMLElement>('*')!.focus();
    const action = vi.fn();
    press(action);
    expect(action).not.toHaveBeenCalled();
  });

  it('still acts when focus is on an element that does not take Enter', () => {
    document.body.innerHTML = '<div tabindex="0">Panel</div>';
    document.querySelector('div')!.focus();
    const action = vi.fn();
    press(action);
    expect(action).toHaveBeenCalledOnce();
  });
});
