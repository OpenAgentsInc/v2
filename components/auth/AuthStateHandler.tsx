import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react" // Import the Loader2 icon from lucide-react
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { useClerk, useUser } from "@clerk/nextjs"

export function AuthStateHandler({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isHandled, setIsHandled] = useState(false)
  const createOrGetUser = useMutation(api.users.createOrGetUser.createOrGetUser)

  useEffect(() => {
    const handleUserCreation = async () => {
      if (isLoaded && user && !isHandled) {

        let email
        if (!user.emailAddresses || user.emailAddresses.length === 0) {
          console.log('User has no email addresses:', user)
          // toast.error('Failed to initialize user data. Please try refreshing the page.')
          email = "noemail-" + user.id + "@openagents.com"

          // so reset the user
          setIsHandled(true)


          return
        } else {
          email = user.emailAddresses[0].emailAddress
        }

        try {
          const result = await createOrGetUser({
            clerk_user_id: user.id,
            email,
            image: user.imageUrl,
            // name: user.fullName,
            // username: user.username
          })
          setIsHandled(true)
          // console.log('User created or retrieved successfully:', result)
        } catch (error) {
          console.error('Error creating/getting user:', error)
          toast.error('Failed to initialize user data. Please try refreshing the page.')
          signOut({ redirectUrl: '/' })
          // so reset the user
        }
      }
    }

    handleUserCreation()
  }, [isLoaded, user, isHandled, createOrGetUser])

  if (!isLoaded || (user && !isHandled)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return <>{children}</>
}
