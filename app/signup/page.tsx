import localFont from 'next/font/local'
import { SignIn, SignedIn, SignUp, SignedOut, UserButton } from '@clerk/nextjs'
import cn from 'clsx'

const apfel = localFont({
    src: '../fonts/ApfelGrotezk-Regular.woff2',
})

export default function Page() {
    return (
        <>
            <SignedOut>
                <main className={cn(apfel.className, 'pointer-events-none select-none text-white h-screen w-screen bg-black flex items-center justify-center')}>
                    <div className='w-full max-w-md p-6'>
                        <div className="font-mono pointer-events-auto">
                            <SignUp
                                signInUrl='/'
                            />
                        </div>
                    </div>
                </main>
            </SignedOut>
            <SignedIn>
                <main className="h-screen flex items-center justify-center">
                    <UserButton />
                </main>
            </SignedIn>
        </>
    )
}


