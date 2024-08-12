import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createOrGetUser } from '@/db/actions' // Adjust import path as needed

export function AuthStateHandler({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const [isHandled, setIsHandled] = useState(false)

    useEffect(() => {
        const handleUserCreation = async () => {
            if (isLoaded && user && !isHandled) {
                try {
                    await createOrGetUser(
                        user.id,
                        user.primaryEmailAddress?.emailAddress || '',
                        user.imageUrl
                    )
                    setIsHandled(true)
                } catch (error) {
                    console.error('Error creating/getting user:', error)
                    // Handle error (e.g., show a notification to the user)
                }
            }
        }

        handleUserCreation()
    }, [isLoaded, user, isHandled])

    return <>{children}</>
}
