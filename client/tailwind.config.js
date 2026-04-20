/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff8eb",
          100: "#ffe8c2",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        moss: {
          500: "#0f766e",
          600: "#0d5b57",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.18), transparent 24%), radial-gradient(circle at bottom, rgba(56, 189, 248, 0.16), transparent 30%)",
      },
    },
  },
  plugins: [],
};
