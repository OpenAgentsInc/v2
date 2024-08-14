import { api } from "@/convex/_generated/api"
import { Button } from "../ui/button"
import { useMutation, useQuery } from "convex/react"

export const Knowledge = () => {
  const createDocument = useMutation(api.documents.createDocument)
  const documents = useQuery(api.documents.getDocuments)

  const handleClick = async () => {
    await createDocument({ title: 'Hello world' })
  }
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Button onClick={handleClick}>Add</Button>
      {documents?.map((doc) => (
        <div key={doc._id}>{doc.title}</div>
      ))}
    </div>
  )
}
