import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { BUILD, CHARACTER, EXPEDITION } from '~/data';

import { clipsProgress } from '../Character/clips';
import ExpeditionLogo from './ExpeditionLogo';
import TitleParticles from './TitleParticles';
import './style.scss';

type Phase = 'loading' | 'ready' | 'leaving';

// Past this, the screen lets the visitor in even if some clips are still loading (they keep loading behind).
const MAX_WAIT_MS = 25000;
const POLL_MS = 200;
// The logo dissolves over LEAVE_MS, then the overview comes up over REVEAL_MS (style.scss).
const LEAVE_MS = 800;
const REVEAL_MS = 1600;

// Every clip in memory (Character/clips), so no move between screens ever has to wait on the network.
const progress = () => {
  const fonts = document.fonts.status === 'loaded' ? 1 : 0;
  return (clipsProgress() * CLIP_WEIGHT + fonts) / (CLIP_WEIGHT + 1);
};
// The fonts are a sliver of the download next to the clips.
const CLIP_WEIGHT = 18;

// The game's title screen (design/ref/loading), the site's root: the logo over drifting petals while every clip of
// the stage behind loads, so camera moves never fall back to a cut; then "Press Any Button" pulses and any key, click
// or tap enters the overview. While it is up, data-start keeps the menu behind it from being painted.
const StartScreen = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('loading');
  const [share, setShare] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.start = '';
    return () => {
      delete document.documentElement.dataset.start;
    };
  }, []);

  useEffect(() => {
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
    if (phase === 'leaving') return;
    const enter = () => {
      if (phase !== 'ready') return;
      setPhase('leaving');
      window.setTimeout(() => {
        // The overview fades in from black; the flag outlives this screen, which unmounts with the navigation.
        const root = document.documentElement.dataset;
        root.reveal = '';
        navigate('/overview');
        window.setTimeout(() => delete root.reveal, REVEAL_MS);
      }, LEAVE_MS);
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
  }, [phase, navigate]);

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
        <span className="StartScreen-house">{CHARACTER.name}</span>
        <span className="StartScreen-rule" aria-hidden />
        <span className="sr-only">Expedition {EXPEDITION}</span>
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
