/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#CFFF04',
                'primary-hover': '#bce600',
                'dark-bg': '#0A0A0A',
                'dark-card': '#141414',
                'dark-input': '#1A1A1A',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}