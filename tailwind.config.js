/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#EEF6F9',
            100: '#D5E8EF',
            200: '#A9CFDD',
            300: '#6FAFC6',
            400: '#3A8AAA',
            500: '#1B6E95',
            600: '#0A5A80',
            700: '#064568',
            800: '#053752',
            900: '#042A40',
          },
          teal: {
            50: '#EBF9F6',
            100: '#CDF1E8',
            200: '#9BE3D2',
            300: '#5FCDB5',
            400: '#2BB59B',
            500: '#079C83',
            600: '#068570',
            700: '#056D5F',
            800: '#04564C',
            900: '#03403A',
          },
          green: {
            50: '#EFFBF4',
            100: '#D3F5E2',
            200: '#A5EACA',
            300: '#6FDAA5',
            400: '#43C98A',
            500: '#29B879',
            600: '#1E9A63',
            700: '#187C50',
            800: '#13623F',
            900: '#0E4A30',
          },
        },
        ink: '#17324D',
        muted: '#64748B',
        line: '#E2E8F0',
        canvas: '#F6FAFB',
        warning: '#D69E2E',
        danger: '#D64545',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(6,69,104,0.04), 0 8px 24px -12px rgba(6,69,104,0.12)',
        lift: '0 2px 4px rgba(6,69,104,0.06), 0 24px 48px -16px rgba(6,69,104,0.25)',
      },
    },
  },
  plugins: [],
};
