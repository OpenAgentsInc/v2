import localFont from 'next/font/local'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import cn from 'clsx'

const apfel = localFont({
    src: './fonts/ApfelGrotezk-Regular.woff2',
})

export default function Page() {
    return (
        <>
            <SignedOut>
                <main className={cn(apfel.className, 'pointer-events-none select-none text-white h-screen w-screen bg-black')}>
                    <div className='mx-auto flex w-full flex-col items-center p-12 lg:w-4/5'>
                        <div className='relative w-full py-6'>
                            <h2 className={cn(apfel.className, 'mb-3 text-xl font-bold')}>
                                Create an account or log in
                            </h2>
                            <p className={cn(apfel.className, 'mb-8')}>
                                Drag, scroll, pinch, and rotate the canvas to explore the 3D scene.
                            </p>
                        </div>
                    </div>
                </main>
            </SignedOut>
            <SignedIn>
                <main className="p-4">
                    <UserButton />
                </main>
            </SignedIn>
        </>
    )
}
