/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff4eb",
          100: "#ffd9bf",
          200: "#ffbc8b",
          500: "#f47b20",
          600: "#dc6510",
          700: "#b9500e",
        },
        moss: {
          500: "#5a6e5d",
          600: "#415147",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(62, 44, 31, 0.12)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(193, 139, 88, 0.22), transparent 26%), radial-gradient(circle at top right, rgba(90, 110, 93, 0.12), transparent 22%), radial-gradient(circle at bottom, rgba(126, 78, 53, 0.08), transparent 28%)",
      },
    },
  },
  plugins: [],
};
