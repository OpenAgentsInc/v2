/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                sans: ['JetBrains Mono'],
                mono: ['JetBrains Mono']
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                }
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                hide: {
                    from: { opacity: "1" },
                    to: { opacity: "0" },
                },
                slideDownAndFade: {
                    from: { opacity: "0", transform: "translateY(-6px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideLeftAndFade: {
                    from: { opacity: "0", transform: "translateX(6px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                slideUpAndFade: {
                    from: { opacity: "0", transform: "translateY(6px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideRightAndFade: {
                    from: { opacity: "0", transform: "translateX(-6px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                accordionOpen: {
                    from: { height: "0px" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                accordionClose: {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0px" },
                },
                dialogOverlayShow: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                dialogContentShow: {
                    from: { opacity: "0", transform: "translate(-50%, -45%) scale(0.95)" },
                    to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
                },
                "slide-up-fade": {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0px)" },
                },
                "slide-down-fade": {
                    from: { opacity: "0", transform: "translateY(-26px)" },
                    to: { opacity: "1", transform: "translateY(0px)" },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideDownAndFade: "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideLeftAndFade: "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideUpAndFade: "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideRightAndFade: "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                accordionOpen: "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
                accordionClose: "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
                dialogOverlayShow: "dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                dialogContentShow: "dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-down-fade": "slide-down-fade ease-in-out",
                "slide-up-fade": "slide-up-fade ease-in-out",
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100%',
                    }
                },
            }
        }
    },
    plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
}
