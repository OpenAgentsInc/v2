"use client"

import dynamic from 'next/dynamic'
import { Suspense, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const Grid = dynamic(() => import('@/components/canvas/Grid').then((mod) => mod.Grid), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
    ssr: false,
    loading: () => (
        <div className='flex h-screen w-full items-center justify-center'>
            <svg className='h-8 w-8 animate-spin text-white' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
            </svg>
        </div>
    ),
})

function CameraAnimation() {
    const { camera } = useThree()
    const startPosition = useRef(new Vector3(0, 50, 0))
    const endPosition = useRef(new Vector3(0, 10, 0))
    const animationDuration = 3 // seconds
    const startTime = useRef(Date.now())

    useEffect(() => {
        camera.position.copy(startPosition.current)
        camera.lookAt(0, 0, 0)
    }, [camera])

    useFrame(() => {
        const elapsedTime = (Date.now() - startTime.current) / 1000
        if (elapsedTime < animationDuration) {
            const t = elapsedTime / animationDuration
            camera.position.lerpVectors(startPosition.current, endPosition.current, t)
        } else {
            camera.position.copy(endPosition.current)
        }
        camera.lookAt(0, 0, 0)
    })

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
