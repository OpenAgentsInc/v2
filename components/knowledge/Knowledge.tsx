import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { CreateDocumentButton } from "./CreateDocumentButton"

export const Knowledge = () => {
  const documents = useQuery(api.documents.getDocuments)
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <CreateDocumentButton />
      {documents?.map((doc) => (
        <div key={doc._id}>{doc.title}</div>
      ))}
    </div>
  )
}
