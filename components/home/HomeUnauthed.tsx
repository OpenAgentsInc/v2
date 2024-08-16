import { SignIn } from '@clerk/nextjs'

export const HomeUnauthed = () => {
  return (
    <main className={'pointer-events-none select-none text-white h-screen w-screen bg-black flex items-center justify-center'}>
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
