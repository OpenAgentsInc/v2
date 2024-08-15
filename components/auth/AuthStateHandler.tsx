import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useMutation } from '../convex/_generated/react'

export function AuthStateHandler({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const [isHandled, setIsHandled] = useState(false)
    const createOrGetUser = useMutation('users:createOrGet')

    useEffect(() => {
        const handleUserCreation = async () => {
            if (isLoaded && user && !isHandled) {
                try {
                    await createOrGetUser({
                        clerk_user_id: user.id,
                        email: user.emailAddresses[0].emailAddress,
                        image: user.imageUrl,
                        credits: 0,
                        createdAt: new Date().toISOString(),
                    })
                    setIsHandled(true)
                } catch (error) {
                    console.error('Error creating/getting user:', error)
                    // Handle error (e.g., show a notification to the user)
                }
            }
        }

        handleUserCreation()
    }, [isLoaded, user, isHandled, createOrGetUser])

    return <>{children}</>
}