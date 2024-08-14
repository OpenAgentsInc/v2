import { api } from "@/convex/_generated/api"
import { Button } from "../ui/button"
import { useMutation } from "convex/react"

export const Knowledge = () => {
  const createDocument = useMutation(api.documents.createDocument)
  const handleClick = async () => {
    await createDocument({ title: 'Hello world' })
  }
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Button onClick={handleClick}>Click me</Button>
    </div>
  )
}
