import localFont from 'next/font/local'
import cn from 'clsx'

const apfel = localFont({
    src: './fonts/ApfelGrotezk-Regular.woff2',
})

export default function Page() {
    return (
        <main className={cn(apfel.className, 'text-white h-screen w-screen bg-black')}>
            <div className='mx-auto flex w-full flex-col items-center p-12 lg:w-4/5'>
                <div className='relative w-full py-6'>
                    <h2 className={cn(apfel.className, 'mb-3 text-xl font-bold')}>
                        Events are propagated
                    </h2>
                    <p className={cn(apfel.className, 'mb-8')}>
                        Drag, scroll, pinch, and rotate the canvas to explore the 3D scene.
                    </p>
                </div>
            </div>
        </main>
    )
}
