import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { CreateDocumentButton } from "./CreateDocumentButton"
import { DocumentCard } from "./DocumentCard"

export const Knowledge = () => {
  const documents = useQuery(api.documents.getDocuments)
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">My Documents</h1>
        <CreateDocumentButton />
      </div>

      <div className="grid grid-cols-4 gap-8">
        {documents?.map((doc) => <DocumentCard document={doc} key={doc._id} />)}
      </div>
    </div>
  )
}
