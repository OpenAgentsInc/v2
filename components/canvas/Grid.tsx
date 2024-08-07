"use client"
import React from 'react'
import * as THREE from 'three'
import { extend, Object3DNode } from '@react-three/fiber'
import { shaderMaterial, MeshReflectorMaterial } from '@react-three/drei'

const FadingGridMaterial = shaderMaterial(
    {
        fadeDistance: 15,
        gridColor: new THREE.Color(0xffffff)
    },
    // Vertex shader
    `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment shader
    `
    uniform float fadeDistance;
    uniform vec3 gridColor;
    varying vec3 vPosition;
    void main() {
      float dist = length(vPosition.xz);
      float alpha = 1.0 - smoothstep(0.0, fadeDistance, dist);
      gl_FragColor = vec4(gridColor, alpha * 0.5);
    }
  `
)
extend({ FadingGridMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            fadingGridMaterial: Object3DNode<any, any>
        }
    }
}

export function Grid() {
    return (
        <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
                <planeGeometry args={[50, 50]} />
                <MeshReflectorMaterial
                    resolution={2048}
                    mixBlur={1}
                    mixStrength={80}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#202020"
                    metalness={0.8}
                    mirror={0}
                />
            </mesh>
            <gridHelper args={[50, 100]} position={[0, 0.002, 0]}>
                <fadingGridMaterial attach="material" transparent />
            </gridHelper>
        </group>
    )
}
