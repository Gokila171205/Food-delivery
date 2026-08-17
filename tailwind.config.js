/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#fc8019",
        secondary: "#3d4152",
        lightText: "#686b78",
        border: "#d4d5d9"
      }
    },
  },
  plugins: [],
}
