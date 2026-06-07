/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['"Stardos Stencil"', '"Noto Sans SC"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', '"Noto Sans SC"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
