module.exports = {
  purge: {
    content: ["./src/**/*.{jsx,tsx}"],
  },
  darkMode: "class",
  theme: {
    extend: {
      animation: {},
      keyframes: {},
    },
  },
  variants: {
    extend: {
      animation: ["hover"],
    },
  },
  plugins: [],
}
