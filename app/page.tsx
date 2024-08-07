'use client'

import dynamic from 'next/dynamic'
import { Suspense, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import * as THREE from 'three'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const Grid = dynamic(() => import('@/components/canvas/Grid').then((mod) => mod.Grid), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
    ssr: false,
    loading: () => <LoadingSpinner />
})

function CameraAnimation() {
    const { camera } = useThree()
    const startPosition = useRef(new THREE.Vector3(0, 10, -3.5))  // Adjusted for a steeper angle (about 70 degrees)

    const { cameraPosition } = useSpring({
        from: { cameraPosition: [0, 10, -3.5] },
        to: { cameraPosition: [0, 10, 0] },
        config: { mass: 1, tension: 50, friction: 30 },  // Adjusted for even slower motion
        duration: 30000,  // 30 seconds for a very slow motion
    })

    useEffect(() => {
        camera.position.copy(startPosition.current)
        camera.lookAt(0, 0, 0)
    }, [camera])

    useFrame(() => {
        camera.position.set(...cameraPosition.get())
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
