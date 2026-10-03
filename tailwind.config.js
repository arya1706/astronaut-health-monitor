/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05070e',
          900: '#090d16',
          850: '#0d1322',
          800: '#11192e',
          750: '#16203a',
          700: '#1d2a4a',
          600: '#2a3b66',
        },
        cyan: {
          450: '#19d5fd',
        },
        status: {
          normal: '#10b981',
          'normal-glow': 'rgba(16, 185, 129, 0.3)',
          warning: '#f59e0b',
          'warning-glow': 'rgba(245, 158, 11, 0.3)',
          critical: '#ef4444',
          'critical-glow': 'rgba(239, 68, 68, 0.4)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'Courier'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'radar-scan': 'radarScan 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2), inset 0 0 5px rgba(6, 182, 212, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)' },
        },
        radarScan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
