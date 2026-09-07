/**
 * Decorative CRT layers: scanlines, a slow rolling band, vignette and a subtle
 * flicker. Purely visual, so it never intercepts pointer events.
 */
const CRTOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
    {/* Horizontal scanlines */}
    <div
      className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)'
      }}
    />

    {/* Aperture-grille style vertical mask */}
    <div
      className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, rgba(255,0,0,0.6) 0px, rgba(0,255,0,0.6) 1px, rgba(0,0,255,0.6) 2px, transparent 3px)'
      }}
    />

    {/* Slow rolling refresh band */}
    <div className="absolute inset-x-0 h-1/3 animate-scanline-drift bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />

    {/* Screen-edge vignette */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 88%, rgba(0,0,0,0.55) 100%)'
      }}
    />

    {/* Phosphor flicker */}
    <div className="absolute inset-0 animate-crt-flicker bg-white/[0.03]" />
  </div>
);

export default CRTOverlay;
