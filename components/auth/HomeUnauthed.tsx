import localFont from 'next/font/local'
import { SignIn } from '@clerk/nextjs'
import cn from 'clsx'

const apfel = localFont({
    src: '../../app/fonts/ApfelGrotezk-Regular.woff2',
})

export const HomeUnauthed = () => {
    return (
        <main className={cn(apfel.className, 'pointer-events-none select-none text-white h-screen w-screen bg-black flex items-center justify-center')}>
            <div className='w-full max-w-md p-6'>
                <div className="font-mono pointer-events-auto">
                    <SignIn
                        signUpUrl='/signup'
                    />
                </div>
            </div>
        </main>
    )
}
