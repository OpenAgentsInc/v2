'use client'

import { Canvas } from '@react-three/fiber'
import { Preload, Plane } from '@react-three/drei'
import { View } from './View'
import { r3f } from '@/helpers/global'
import * as THREE from 'three'

export default function Scene({ ...props }) {
    // Everything defined in here will persist between route changes, only children are swapped
    return (
        <>
            <View className='pointer-events-none absolute left-0 top-0 z-[-1] h-[600px] w-full bg-green-300'>
                <Plane args={[2, 2]} position={[-2, 0, 0]} {...props} />
            </View>
            <Canvas {...props}
                onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}
            >
                <View.Port />
                {/* @ts-ignore */}
                <r3f.Out />
                <Preload all />
            </Canvas>
        </>
    )
}
