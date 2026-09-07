/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        win: {
          // Classic Windows 95/98 system palette
          desktop: '#008080',
          face: '#c0c0c0',
          light: '#dfdfdf',
          white: '#ffffff',
          shadow: '#808080',
          dark: '#0a0a0a',
          title: '#000080',
          titleInactive: '#808080',
          text: '#222222',
          disabled: '#808080',
          screen: '#0b1a0e'
        }
      },
      fontFamily: {
        pixel: ['"Pixelated MS Sans Serif"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        mono: ['"Lucida Console"', 'Consolas', 'Monaco', 'monospace']
      },
      fontSize: {
        pixel: ['11px', '14px'],
        'pixel-lg': ['13px', '17px']
      },
      keyframes: {
        'crt-flicker': {
          '0%, 100%': { opacity: '0.10' },
          '50%': { opacity: '0.14' }
        },
        'scanline-drift': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'window-open': {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        }
      },
      animation: {
        'crt-flicker': 'crt-flicker 4s ease-in-out infinite',
        'scanline-drift': 'scanline-drift 8s linear infinite',
        'window-open': 'window-open 180ms ease-out',
        blink: 'blink 1s step-end infinite'
      }
    }
  },
  plugins: []
};
