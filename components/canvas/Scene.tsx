'use client'

import { useRef, MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, View } from '@react-three/drei'
import { GridScene } from './GridScene'

interface SceneProps {
    [key: string]: any;
}

export default function Scene(props: SceneProps) {
    const viewRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    // Everything defined in here will persist between route changes, only children are swapped
    return (
        <>
            <View className='pointer-events-none absolute left-0 top-0 z-[-1] h-full w-full' track={viewRef}>
                <GridScene />
            </View>
            <Canvas shadows {...props} eventSource={document.body} eventPrefix='client'>
                <View.Port />
                <Preload all />
            </Canvas>
            <div ref={viewRef} />
        </>
    )
}
