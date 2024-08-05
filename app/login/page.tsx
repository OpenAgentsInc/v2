import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const { userId } = auth()

  if (userId) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      {/* Replace LoginForm with Clerk's SignIn component */}
      <SignIn />
    </main>
  )
}