"use client"
import Hero from "@/components/landing/ui/Hero"
import { Navigation } from "@/components/landing/ui/Navbar"
import './landing.css'

export function Lander() {
  return (
    <>
      <Navigation />
      <main className="flex flex-col overflow-hidden">
        <Hero />
      </main>
    </>
  )
}
