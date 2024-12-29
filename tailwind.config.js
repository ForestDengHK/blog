/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontWeight: '700',
              fontSize: '2.25em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h2: {
              fontWeight: '600',
              fontSize: '1.75em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h3: {
              fontWeight: '600',
              fontSize: '1.5em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            pre: {
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1em',
              borderRadius: '0.375rem',
              marginTop: '1em',
              marginBottom: '1em',
            },
            code: {
              color: '#e2e8f0',
              backgroundColor: '#1e293b',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 