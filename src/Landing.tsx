/**
 * Owns the transition from the 3D CRT to the Windows 95 desktop.
 *
 * The 3D scene is an entrance, never a dependency: deep links, machines
 * without WebGL, and anyone who skips the intro all land straight on the DOM
 * portfolio, which is fully functional on its own.
 */
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import RetroDesktop from './retro/RetroDesktop';
import { sections, type SectionId } from './data/sections';

const CRTStage = lazy(() => import('./three/CRTStage'));

/** 'leaving' is the reverse of 'flying': the desktop powering back down. */
type Stage = 'scene' | 'flying' | 'desktop' | 'leaving';

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Landing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Probed once. Calling this per render would build a throwaway canvas and
  // GL context every time.
  const [webglAvailable] = useState(supportsWebGL);

  // Resolved once: a deep link like #/projects should not replay the intro,
  // and neither should a browser that cannot render it.
  const [stage, setStage] = useState<Stage>(() =>
    location.pathname !== '/' || !webglAvailable ? 'desktop' : 'scene'
  );
  const [reducedMotion] = useState(prefersReducedMotion);
  const [sceneMounted, setSceneMounted] = useState(stage !== 'desktop');
  /** Once the machine has booted, powering back out shouldn't replay the POST. */
  const [hasBooted, setHasBooted] = useState(false);

  /** Icon picked on the CRT, opened once the camera finishes its approach. */
  const pendingSection = useRef<SectionId | null>(null);

  const enter = useCallback((section: SectionId | null) => {
    pendingSection.current = section;
    setStage((current) => (current === 'scene' ? 'flying' : current));
  }, []);

  const skip = useCallback(() => {
    setStage('desktop');
    setSceneMounted(false);
    // Skipping still counts as powered on: shutting down later should return
    // to the desktop view, not replay a POST the user chose to skip.
    setHasBooted(true);
  }, []);

  /** Start > Shut Down: close the desktop and pull back out to the room. */
  const shutDown = useCallback(() => {
    if (!webglAvailable) return;
    navigate('/');
    setSceneMounted(true);
    setStage('leaving');
  }, [navigate, webglAvailable]);

  const onReturn = useCallback(() => {
    pendingSection.current = null;
    setStage('scene');
  }, []);

  // Any key press is a reasonable "turn it on" gesture for a computer.
  useEffect(() => {
    if (stage !== 'scene') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip();
      else if (event.key === 'Enter' || event.key === ' ') enter(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, enter, skip]);

  const onArrive = useCallback(() => {
    // Open the window the user actually pointed at on the CRT, so the icon
    // they clicked in 3D is the one already open when the DOM takes over.
    const section = sections.find((item) => item.id === pendingSection.current);
    if (section) navigate(section.path);

    setStage('desktop');
    setHasBooted(true);
    // Let the cross-fade finish before releasing the WebGL context.
    window.setTimeout(() => setSceneMounted(false), 700);
  }, [navigate]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {(stage === 'desktop' || stage === 'leaving') && (
        <motion.div
          initial={{ opacity: sceneMounted ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <RetroDesktop onShutDown={webglAvailable ? shutDown : undefined} />
        </motion.div>
      )}

      <AnimatePresence>
        {sceneMounted && (
          <motion.div
            key="crt-stage"
            initial={{ opacity: stage === 'leaving' ? 0 : 1 }}
            animate={{ opacity: stage === 'desktop' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 z-20"
          >
            <Suspense fallback={<StageLoading />}>
              <CRTStage
                phase={stage === 'flying' ? 'in' : stage === 'leaving' ? 'out' : 'idle'}
                onActivate={enter}
                onArrive={onArrive}
                onReturn={onReturn}
                reducedMotion={reducedMotion}
                skipBoot={hasBooted}
              />
            </Suspense>

            {stage === 'scene' && (
              <button
                type="button"
                onClick={skip}
                className="absolute bottom-5 right-5 z-30 bg-win-face bevel-out px-3 py-[6px] text-[13px] active:bevel-in"
              >
                Skip intro
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Shown while the three.js chunk and model stream in. */
const StageLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#0b0b11]">
    <p className="font-mono text-[15px] tracking-widest text-[#c8f0c8]">
      LOADING<span className="animate-blink">_</span>
    </p>
  </div>
);

export default Landing;
