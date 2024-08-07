'use client'
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSpringValue } from '@react-spring/three'
import { useControls, button } from 'leva'
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
    const { camera } = useThree()
    const [
        {
            startX, startY, startZ,
            endX, endY, endZ,
            mass, tension, friction,
        },
    ] = useControls(() => ({
        startX: { value: -10, min: -10, max: 10, step: 0.1 },
        startY: { value: 1, min: 0, max: 20, step: 0.1 },
        startZ: { value: -10, min: -10, max: 0, step: 0.1 },
        endX: { value: -2, min: -10, max: 10, step: 0.1 },
        endY: { value: 10, min: 0, max: 20, step: 0.1 },
        endZ: { value: 0, min: -10, max: 0, step: 0.1 },
        mass: { value: 10, min: 0.1, max: 10, step: 0.1 },
        tension: { value: 200, min: 1, max: 200, step: 1 },
        friction: { value: 100, min: 1, max: 100, step: 1 },
        Restart: button(() => restartAnimation())
    }))

    const cameraPositionX = useSpringValue(startX)
    const cameraPositionY = useSpringValue(startY)
    const cameraPositionZ = useSpringValue(startZ)

    const restartAnimation = useCallback(() => {
        // Immediately set the camera and spring values to the start position
        camera.position.set(startX, startY, startZ)
        cameraPositionX.set(startX)
        cameraPositionY.set(startY)
        cameraPositionZ.set(startZ)
        // Then start the animation to the end position
        cameraPositionX.start(endX, { config: { mass, tension, friction } })
        cameraPositionY.start(endY, { config: { mass, tension, friction } })
        cameraPositionZ.start(endZ, { config: { mass, tension, friction } })
    }, [camera, cameraPositionX, cameraPositionY, cameraPositionZ, startX, startY, startZ, endX, endY, endZ, mass, tension, friction])

    useEffect(() => {
        restartAnimation()
    }, [restartAnimation])

    useFrame(() => {
        camera.position.set(cameraPositionX.get(), cameraPositionY.get(), cameraPositionZ.get())
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
