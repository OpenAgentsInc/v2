// components/FullScreenGrid.tsx
'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useCameraAnimation } from '@/hooks/useCameraAnimation'
import { Grid } from './Grid'

// const Grid = dynamic(() => import('@/components/canvas/Grid').then((mod) => mod.Grid), { ssr: false })

function CameraAnimation() {
    useCameraAnimation()
    return null
}

export function GridScene() {
    return (
        <Suspense fallback={null}>
            <Grid />
            <CameraAnimation />
        </Suspense>
    )
}

