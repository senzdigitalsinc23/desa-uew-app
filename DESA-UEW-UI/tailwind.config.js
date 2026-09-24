/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        uew: {
          // Official UEW Academic Palette
          navy: '#162238',       // Main dark header navy
          navyDark: '#0E1726',   // Deep academic navy
          blue: '#1E2F4D',       // Slate navy
          royal: '#1B355B',      // Rich corporate blue
          heading: '#1D3570',    // Deep indigo heading blue (from UEW website)
          red: '#A8181D',        // Deeper, elegant university crimson red
          redHover: '#881014',   // Darker red for hover/active
          redDivider: '#D42227', // Red divider accent (from UEW website)
          redSoft: '#FDF2F2',    // Soft subtle red for badges/tags
          gold: '#D4AF37',       // Crest gold
          goldDark: '#B8860B',
          goldLight: '#F5E6A3',
          light: '#F4F7FB',      // Clean page background
          card: '#FFFFFF',       // Card surfaces
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -2px rgba(168, 24, 29, 0.4), 0 0 10px -2px rgba(168, 24, 29, 0.2)',
        'glow-navy': '0 0 30px -5px rgba(22, 34, 56, 0.35)',
        'avatar-frame': '0 10px 30px -5px rgba(22, 34, 56, 0.25), 0 0 0 4px #FFFFFF, 0 0 0 7px #A8181D',
        'card-lift': '0 20px 40px -12px rgba(22, 34, 56, 0.15)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'uew-gradient': 'linear-gradient(135deg, #0E1726 0%, #162238 50%, #1D3570 100%)',
        'uew-gradient-red': 'linear-gradient(135deg, #A8181D 0%, #881014 100%)',
        'uew-gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        'uew-gradient-hero': 'linear-gradient(160deg, #0E1726 0%, #162238 35%, #1D3570 70%, #1E2F4D 100%)',
        'uew-gradient-warm': 'linear-gradient(135deg, #162238 0%, #A8181D 100%)',
      },
    },
  },
  plugins: [],
}
