import { useLayoutEffect } from 'react';

// Screens are laid out at the game capture size (2510 × 1380); the whole stage is scaled to the window.
export const STAGE_W = 2510;
export const STAGE_H = 1380;

// Run by root.tsx before the first paint and on every resize: the scale is a CSS variable, so the server-rendered
// stage shows at its size on the first frame instead of waiting for hydration (which delayed the first paint).
export const FIT_STAGE_SCRIPT = `(function(){var r=document.documentElement;function f(){r.style.setProperty('--stage-scale',Math.min(innerWidth/${STAGE_W},innerHeight/${STAGE_H}))}f();addEventListener('resize',f)})()`;

const fitStage = () =>
  document.documentElement.style.setProperty(
    '--stage-scale',
    String(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
  );

// Applied again once React owns the page: when hydration does not match the prerendered HTML (GitHub Pages), React
// rebuilds the document and drops the attribute the script set on <html>, leaving the stage at its full 2510 px.
export const useFitStage = () =>
  useLayoutEffect(() => {
    fitStage();
    window.addEventListener('resize', fitStage);
    return () => window.removeEventListener('resize', fitStage);
  }, []);
