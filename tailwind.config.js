/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./types.ts",
        "./components/**/*.{tsx,ts}",
        "./hooks/**/*.{tsx,ts}",
        "./services/**/*.{tsx,ts}",
        "./utils/**/*.{tsx,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Custom colors for the app
                primary: '#3b82f6',
                secondary: '#8b5cf6',
            },
        },
    },
    plugins: [],
}
