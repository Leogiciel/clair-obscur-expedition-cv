import { useLayoutEffect } from 'react';

// Screens are laid out at the game capture size (2510 × 1380); the whole stage is scaled to the window.
export const STAGE_W = 2510;
export const STAGE_H = 1380;

// WebKit (Safari, every browser on iOS) raises zoomed text to 9 px at least: on a phone, the stage zoomed to a quarter
// showed its labels at 9 px, overflowing their boxes ("Attack Power" over the next heading, the stack's names over
// each other). The interface is therefore zoomed no further than ZOOM_MIN, where its smallest text, 15 px, shows at
// 9 px, and a scale transform shrinks it the rest of the way; the picture behind it (character, petals), which has no
// text, keeps the plain zoom (Stage). Safari rasterises the transformed interface at its zoomed size: on an emulated
// iPhone, graphics memory peaks about a quarter higher than with zoom alone, far below the 1.1 GB that crashed it.
export const ZOOM_MIN = 9 / 15;

// --stage-scale: what the stage shows at; --stage-zoom and --stage-shrink: the interface's zoom and the transform
// that completes it ('none' when the zoom alone fits).
const fit = (width: number, height: number) => {
  const scale = Math.min(width / STAGE_W, height / STAGE_H);
  const zoom = Math.max(scale, ZOOM_MIN);
  return { scale, zoom, shrink: scale < zoom ? `scale(${scale / zoom})` : 'none' };
};

// Run by root.tsx before the first paint and on every resize: the scale is set by CSS variables, so the
// server-rendered stage shows at its size on the first frame instead of waiting for hydration (which delayed the
// first paint). The same computation as fit(), in the page's own script.
export const FIT_STAGE_SCRIPT = `(function(){var r=document.documentElement.style;function f(){var s=Math.min(innerWidth/${STAGE_W},innerHeight/${STAGE_H}),z=Math.max(s,${ZOOM_MIN});r.setProperty('--stage-scale',s);r.setProperty('--stage-zoom',z);r.setProperty('--stage-shrink',s<z?'scale('+s/z+')':'none')}f();addEventListener('resize',f)})()`;

export const fitStage = () => {
  const { scale, zoom, shrink } = fit(window.innerWidth, window.innerHeight);
  const root = document.documentElement.style;
  root.setProperty('--stage-scale', String(scale));
  root.setProperty('--stage-zoom', String(zoom));
  root.setProperty('--stage-shrink', shrink);
};

// Applied again once React owns the page: when hydration does not match the prerendered HTML (GitHub Pages), React
// rebuilds the document and drops the attribute the script set on <html>, leaving the stage at its full 2510 px.
export const useFitStage = () =>
  useLayoutEffect(() => {
    fitStage();
    window.addEventListener('resize', fitStage);
    return () => window.removeEventListener('resize', fitStage);
  }, []);
