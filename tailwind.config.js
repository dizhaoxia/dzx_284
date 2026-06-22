/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: '#FF7A45',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        success: '#95E77E',
        danger: '#FF6B6B',
        purple: '#A78BFA',
        pink: '#F472B6',
      },
      fontFamily: {
        cute: ['"ZCOOL KuaiLe"', '"Ma Shan Zheng"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'rainbow': 'rainbow 2s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rainbow: {
          '0%': { color: '#FF6B6B' },
          '25%': { color: '#FFE66D' },
          '50%': { color: '#95E77E' },
          '75%': { color: '#4ECDC4' },
          '100%': { color: '#FF6B6B' },
        },
      },
    },
  },
  plugins: [],
};
