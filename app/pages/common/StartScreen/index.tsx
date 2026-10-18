import { useEffect, useState } from 'react';

import ExpeditionLogo from './ExpeditionLogo';
import TitleParticles from './TitleParticles';
import './style.scss';

type Phase = 'loading' | 'ready' | 'leaving' | 'gone';

// Set once the visitor has pressed a button; root.tsx reads it before the first paint so a reload skips the screen.
export const STARTED_KEY = 'cv-started';
// Past this, the screen lets the visitor in even if some clips are still loading (they keep loading behind).
const MAX_WAIT_MS = 25000;
const POLL_MS = 200;
const LEAVE_MS = 700;
// The game prints its build number in the bottom right corner; this one is the CV's.
const BUILD = '35.10';

// A clip counts as loaded once it is buffered to its end: a camera move only plays if it can run without stalling.
const loaded = (video: HTMLVideoElement) =>
  video.readyState === 4 ||
  (video.duration > 0 &&
    video.buffered.length > 0 &&
    video.buffered.end(video.buffered.length - 1) >= video.duration - 0.05);

const progress = () => {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('.Screen video')];
  const fonts = document.fonts.status === 'loaded' ? 1 : 0;
  return (videos.filter(loaded).length + fonts) / (videos.length + 1);
};

// The game's title screen (design/ref/loading): the logo over drifting petals while every clip of the stage behind
// loads, so camera moves never fall back to a cut; then "Press Any Button" pulses and any key, click or tap enters.
const StartScreen = () => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [share, setShare] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STARTED_KEY)) {
        delete document.documentElement.dataset.start;
        setPhase('gone');
        return;
      }
    } catch {
      // Storage blocked: the screen simply shows on every visit.
    }
    const since = performance.now();
    const timer = window.setInterval(() => {
      const done = progress();
      setShare(done);
      if (done >= 1 || performance.now() - since > MAX_WAIT_MS) {
        window.clearInterval(timer);
        setPhase('ready');
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'loading' && phase !== 'ready') return;
    const enter = () => {
      if (phase !== 'ready') return;
      try {
        sessionStorage.setItem(STARTED_KEY, '1');
      } catch {
        // Storage blocked: nothing to remember.
      }
      // The menu behind shows again as the screen fades out.
      delete document.documentElement.dataset.start;
      setPhase('leaving');
      window.setTimeout(() => setPhase('gone'), LEAVE_MS);
    };
    // Captured before the screens' shortcuts, so no key reaches the menu behind while this screen is up.
    const onKey = (event: KeyboardEvent) => {
      event.stopImmediatePropagation();
      event.preventDefault();
      enter();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', enter);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', enter);
    };
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`StartScreen${phase === 'leaving' ? ' StartScreen--leaving' : ''}`}
      role="dialog"
      aria-modal
      aria-label="Start screen"
    >
      <div className="StartScreen-smoke" aria-hidden />
      <TitleParticles />

      <h1 className="StartScreen-logo">
        <span className="StartScreen-house">Olivier Nguyen</span>
        <span className="StartScreen-rule" aria-hidden />
        <span className="sr-only">Expedition 35</span>
        <ExpeditionLogo />
      </h1>

      <div
        className={`StartScreen-loading${phase === 'loading' ? '' : ' StartScreen-loading--done'}`}
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(share * 100)}
      >
        <span className="StartScreen-loadingLabel">
          Loading <span className="StartScreen-loadingValue">{Math.round(share * 100)}%</span>
        </span>
        <span className="StartScreen-loadingTrack">
          <span className="StartScreen-loadingFill" style={{ transform: `scaleX(${share})` }} />
        </span>
      </div>
      <p
        className={`StartScreen-prompt${phase === 'loading' ? '' : ' StartScreen-prompt--shown'}`}
        aria-live="polite"
      >
        {phase === 'loading' ? '' : 'Press Any Button'}
      </p>
      <span className="StartScreen-build" aria-hidden>
        {BUILD}
      </span>
    </div>
  );
};

export default StartScreen;
