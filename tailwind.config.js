/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FFFFFF",
                "background-light": "#fcfcfc",
                "background-dark": "#121212",
                "surface-dark": "#1e1e1e",
                "surface-light": "#f2f2f2",
                "border-dark": "#2e2e2e",
                "border-light": "#e5e5e5",
                "accent-mono-light": "#e4e4e7",
                "accent-mono-dark": "#3f3f46",
                "text-muted-dark": "#a1a1aa",
                "text-muted-light": "#71717a",
                // Shadcn/Base overrides or compatibility if needed, but prioritized user's colors
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                lg: "0.75rem",
                xl: "1rem",
                '2xl': "1.5rem",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms") // code.html uses this plugin
    ],
}
