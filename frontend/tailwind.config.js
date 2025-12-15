/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': '#111827',
        'bg-secondary': '#1F2937',
        'accent-primary': '#67E8F9',
        'accent-secondary': '#A78BFA',
        'gradient-indigo': '#4F46E5',
        'gradient-cyan': '#22D3EE',
        'gradient-violet': '#8B5CF6',
        'text-primary': '#D1D5DB',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
