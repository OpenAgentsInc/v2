// hooks/useCameraAnimation.ts
import { useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import { useControls, button } from 'leva'

const SHOW_CONTROLS = false

export function useCameraAnimation() {
    const { camera } = useThree()
    const defaultConfig = {
        startX: 0, startY: 1, startZ: -10,
        endX: 0, endY: 10, endZ: 0,
        mass: 10, tension: 200, friction: 100
    }

    const [config, setConfig] = SHOW_CONTROLS ? useControls(() => ({
        startX: { value: defaultConfig.startX, min: -10, max: 10, step: 0.1 },
        startY: { value: defaultConfig.startY, min: 0, max: 20, step: 0.1 },
        startZ: { value: defaultConfig.startZ, min: -10, max: 0, step: 0.1 },
        endX: { value: defaultConfig.endX, min: -10, max: 10, step: 0.1 },
        endY: { value: defaultConfig.endY, min: 0, max: 20, step: 0.1 },
        endZ: { value: defaultConfig.endZ, min: -10, max: 0, step: 0.1 },
        mass: { value: defaultConfig.mass, min: 0.1, max: 10, step: 0.1 },
        tension: { value: defaultConfig.tension, min: 1, max: 200, step: 1 },
        friction: { value: defaultConfig.friction, min: 1, max: 100, step: 1 },
        Restart: button(() => restartAnimation())
    })) : [defaultConfig, () => { }]

    const [spring, api] = useSpring(() => ({
        from: { x: config.startX, y: config.startY, z: config.startZ },
        to: { x: config.endX, y: config.endY, z: config.endZ },
        config: {
            mass: config.mass,
            tension: config.tension,
            friction: config.friction,
        },
    }))

    const restartAnimation = useCallback(() => {
        api.start({
            from: { x: config.startX, y: config.startY, z: config.startZ },
            to: { x: config.endX, y: config.endY, z: config.endZ },
            config: {
                mass: config.mass,
                tension: config.tension,
                friction: config.friction,
            },
        })
    }, [api, config])

    useEffect(() => {
        restartAnimation()
    }, [restartAnimation])

    useFrame(() => {
        camera.position.set(spring.x.get(), spring.y.get(), spring.z.get())
        camera.lookAt(0, 0, 0)
    })

    return restartAnimation
}
