// components/FullScreenGrid.tsx
'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useCameraAnimation } from '@/hooks/useCameraAnimation'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const Grid = dynamic(() => import('@/components/canvas/Grid').then((mod) => mod.Grid), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
    ssr: false,
    loading: () => (
        <div className='fixed top-4 left-4 z-50'>
            <LoadingSpinner />
        </div>
    )
})

function CameraAnimation() {
    useCameraAnimation()
    return null
}

export default function FullScreenGrid() {
    return (
        <div className='h-screen w-full bg-black'>
            <View className='h-full w-full' orbit={false}>
                <Suspense fallback={null}>
                    <Grid />
                    <CameraAnimation />
                </Suspense>
            </View>
        </div>
    )
}
