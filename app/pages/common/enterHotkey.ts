// A focused button or link already acts on Enter (the browser clicks it): a screen-wide Enter shortcut then stands
// down and leaves the key's default alone, or the key would act twice (opening a slot and confirming it at once).
// A, the game's key, is unaffected.
const focusTakesEnter = () =>
  document.activeElement instanceof HTMLElement &&
  document.activeElement.matches('button, a[href], input, select, textarea, [role="button"]');

const enterHotkey = (callback: () => void) => ({
  hotkey: 'Enter' as const,
  callback: (event: KeyboardEvent) => {
    if (focusTakesEnter()) return;
    event.preventDefault();
    callback();
  },
  options: { preventDefault: false }
});

export default enterHotkey;
