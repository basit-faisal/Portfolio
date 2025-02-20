import React, { useEffect, useRef } from 'react';

const Background = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const animate = () => {
      if (!svgRef.current) return;
      
      const paths = svgRef.current.querySelectorAll('path.animate-draw');
      paths.forEach((path, index) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        path.style.animation = `draw 2s ${index * 0.2}s forwards ease-out`;
      });
    };

    animate();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="absolute w-[200%] h-[200%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
            <stop offset="50%" stopColor="rgba(34, 197, 94, 1)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur="3s"
              repeatCount="indefinite"
            />
          </linearGradient>

          <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 1)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="3s"
              repeatCount="indefinite"
              begin="1.5s"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur="3s"
              repeatCount="indefinite"
              begin="1.5s"
            />
          </linearGradient>
        </defs>

        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <g className="mathematical-curves" transform="translate(100, 100) scale(0.8)">
          <path
            d="M 100 300 Q 200 100 300 300 T 500 300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-draw"
          />
          <path
            d="M 200 400 L 400 200 L 600 400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-draw"
          />
          <path
            d="M 300 150 C 400 50 500 250 600 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-draw"
          />

          <path
            d="M 100 300 Q 200 100 300 300 T 500 300"
            fill="none"
            stroke="url(#greenGlow)"
            strokeWidth="6"
            className="glow-path"
          />
          <path
            d="M 200 400 L 400 200 L 600 400"
            fill="none"
            stroke="url(#redGlow)"
            strokeWidth="6"
            className="glow-path"
          />
        </g>
        
        {[...Array(10)].map((_, i) => (
          <circle
            key={i}
            cx={200 + i * 40}
            cy={300 - Math.sin(i * 0.5) * 100}
            r="4"
            fill="currentColor"
            className="animate-pulse"
          />
        ))}
      </svg>

      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-draw {
          opacity: 0.6;
        }
        .glow-path {
          opacity: 1;
          filter: blur(3px);
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
};

export default Background;