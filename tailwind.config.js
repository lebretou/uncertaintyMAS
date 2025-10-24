/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uncertainty: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#EF4444',
        },
      },
      boxShadow: {
        'halo-low': '0 0 20px rgba(16, 185, 129, 0.6)',
        'halo-medium': '0 0 20px rgba(245, 158, 11, 0.6)',
        'halo-high': '0 0 20px rgba(239, 68, 68, 0.6)',
      },
    },
  },
  plugins: [],
}
