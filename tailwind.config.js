/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Індиго для кнопок і акцентів
        secondary: '#E5E7EB', // Світло-сірий для фону
        textPrimary: '#1F2937', // Темний колір для тексту
      },
    },
  },
  plugins: [],
}