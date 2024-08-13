import { JetBrains_Mono } from "next/font/google"
import localFont from 'next/font/local'

export const apfel = localFont({
    src: '../app/fonts/ApfelGrotezk-Regular.woff2',
})

export const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jetbrains-mono",
})

