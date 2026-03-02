/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // ← Add your animation here
      animation: {
        'gradient-x': 'gradient-x 18s ease infinite',
        // you can add more animations later if needed
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%':    { 'background-position': '100% 50%' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },

      // Optional: nicer rounded corners, shadows, etc.
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },

  plugins: [],
}
