/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'diff-added': '#d4edda',
        'diff-added-dark': '#c3e6cb',
        'diff-removed': '#f8d7da',
        'diff-removed-dark': '#f5c6cb',
        'diff-modified': '#fff3cd',
        'diff-modified-dark': '#ffeaa7',
        'editor-bg': '#1e1e1e',
        'editor-sidebar': '#252526',
        'editor-border': '#3c3c3c',
        'editor-text': '#d4d4d4',
        'editor-line-number': '#858585',
      },
    },
  },
  plugins: [],
}
