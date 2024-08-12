import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createOrGetUser } from '@/db/actions' // Adjust import path as needed

export function AuthStateHandler({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const [isHandled, setIsHandled] = useState(false)

    useEffect(() => {
        const handleUserCreation = async () => {
            if (isLoaded && user && !isHandled) {
                const sessionKey = `user_handled_${user.id}`
                const isHandledThisSession = sessionStorage.getItem(sessionKey)

                if (!isHandledThisSession) {
                    try {
                        await createOrGetUser(
                            user.id,
                            user.primaryEmailAddress?.emailAddress || '',
                            user.imageUrl
                        )
                        sessionStorage.setItem(sessionKey, 'true')
                        setIsHandled(true)
                    } catch (error) {
                        console.error('Error creating/getting user:', error)
                        // Handle error (e.g., show a notification to the user)
                    }
                } else {
                    setIsHandled(true)
                }
            }
        }

        handleUserCreation()
    }, [isLoaded, user, isHandled])

    return <>{children}</>
}
