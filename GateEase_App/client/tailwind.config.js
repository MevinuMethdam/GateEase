/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#CFFF04', // අර ලස්සන Lime Green පාට
                'primary-hover': '#bce600',
                'dark-bg': '#0A0A0A', // සම්පූර්ණ කළු පසුබිම
                'dark-card': '#141414', // කාඩ් වලට දෙන අඳුරු පාට
                'dark-input': '#1A1A1A',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // මේ UI එකට Inter font එක ගොඩක් ලස්සනයි
            }
        },
    },
    plugins: [],
}