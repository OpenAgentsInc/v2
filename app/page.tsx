import dynamic from 'next/dynamic'
import { Loading } from '@/components/dom/Loading'
import localFont from 'next/font/local'
import cn from 'clsx'

const Common = dynamic(() => import('@/components/canvas/Common'), { ssr: false })
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })
const Torus = dynamic(() => import('@/components/canvas/Torus'), { ssr: false })
const Dog = dynamic(() => import('@/components/canvas/Dog'), { ssr: false })
const Duck = dynamic(() => import('@/components/canvas/Duck'), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View'), { ssr: false, loading: Loading })

const apfel = localFont({
    src: './fonts/ApfelGrotezk-Regular.woff2',
})

const instrument = localFont({
    src: './fonts/InstrumentSerif-Regular.woff2',
})

export default function Page() {
    return (
        <main className={apfel.className}>
            <div className='h-dvh overflow-x-hidden uppercase'>
                <div className='absolute inset-4'>
                    <span className={cn(instrument.className, 'absolute top-0 left-0 text-2xl leading-2xl tracking-tight')}>
                        next
                    </span>
                    <span className={cn(apfel.className, 'absolute top-0 left-1/2 -translate-x-1/2 text-xl leading-xl')}>
                        next + react three fiber
                    </span>
                    <span className={cn(instrument.className, 'absolute top-0 right-0 text-2xl leading-2xl')}>THREE</span>
                    <span
                        className={cn(
                            instrument.className,
                            'absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl leading-2xl tracking-tight',
                        )}
                    >
                        starter
                    </span>
                    <div className='torus absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                        <p className='description absolute left-full top-1/2 -translate-y-1/2 text-xs'>
                            A minimalist starter for Next, React-three-fiber and Threejs.
                        </p>
                        <View className='size-full'>
                            <Torus />
                        </View>
                    </div>
                </div>
            </div>
            <div className='mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row  lg:w-4/5'>
                {/* first row */}
                <div className='relative h-64 w-full py-6 sm:w-1/2 md:my-12 md:mb-40'>
                    <h2 className={'mb-3 text-xl font-bold'}>Events are propagated</h2>
                    <p className='mb-8'>Drag, scroll, pinch, and rotate the canvas to explore the 3D scene.</p>
                </div>
                <div className='relative my-12 h-64 w-full py-6 sm:w-1/2 md:mb-40'>
                    <View className='relative h-full sm:w-full'>
                        <Dog href='/blob' scale={2} rotation={[0.0, -0.3, 0]} />
                        <Common color='lightpink' controls enableZoom={true} />
                    </View>
                </div>
                {/* second row */}
                <div className='relative my-12 h-64 w-full py-6 sm:w-1/2'>
                    <View className='monolith relative h-full sm:w-full'>
                        <Duck scale={1.5} />
                        <Common color='lightblue' controls />
                    </View>
                </div>
                <div className='h-64 w-full p-6 sm:w-1/2'>
                    <h2 className='mb-3 text-xl font-bold'>Dom and 3D are synchronized</h2>
                    <p className='mb-8'>
                        3D Divs are renderer through the View component. It uses gl.scissor to cut the viewport into segments. You
                        tie a view to a tracking div which then controls the position and bounds of the viewport. This allows you to
                        have multiple views with a single, performant canvas. These views will follow their tracking elements,
                        scroll along, resize, etc.
                    </p>
                </div>
            </div>
        </main>
    )
}

