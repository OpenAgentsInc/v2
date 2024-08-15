import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

export function AuthStateHandler({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [isHandled, setIsHandled] = useState(false)
  const createOrGetUser = useMutation('users:createOrGet')

  useEffect(() => {
    const handleUserCreation = async () => {
      if (isLoaded && user && !isHandled) {
        try {
          const result = await createOrGetUser({
            clerk_user_id: user.id,
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl,
          })
          setIsHandled(true)
          console.log('User created or retrieved successfully:', result)
        } catch (error) {
          console.error('Error creating/getting user:', error)
          toast.error('Failed to initialize user data. Please try refreshing the page.')
        }
      }
    }

    handleUserCreation()
  }, [isLoaded, user, isHandled, createOrGetUser])

  if (!isLoaded || (user && !isHandled)) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}