import { auth, SignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const { userId } = auth()

  if (userId) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      <SignUp />
    </main>
  )
}