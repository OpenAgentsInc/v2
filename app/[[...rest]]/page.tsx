"use client"
import { Authenticated, Unauthenticated } from "convex/react";
import { HomeAuthed } from '@/components/home'
import { Lander } from '@/components/landing/Lander'

export default function Page() {
  return (
    <>
      <Unauthenticated>
        <Lander />
      </Unauthenticated>
      <Authenticated>
        <HomeAuthed />
      </Authenticated>
    </>
  )
}
