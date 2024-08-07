import dynamic from 'next/dynamic'
import { Suspense } from 'react'
// import { Grid } from '@/components/canvas/Grid'

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


export default function FullScreenGrid() {
    return (
        <div className='h-screen w-full bg-black'>
            <View className='h-full w-full' orbit>
                <Suspense fallback={null}>
                    <Grid />
                </Suspense>
            </View>
        </div>
    )
}
