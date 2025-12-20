/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                dark: {
                    900: '#0a0a0f',
                    800: '#0f0f14',
                    700: '#14141a',
                    600: '#1a1a22',
                    500: '#22222c',
                },
                accent: {
                    purple: '#a855f7',
                    blue: '#3b82f6',
                    green: '#22c55e',
                    orange: '#f97316',
                }
            },
        },
    },
    plugins: [],
}
