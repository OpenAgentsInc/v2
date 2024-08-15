"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDocumentForm } from "./UploadDocumentForm"
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function CreateDocumentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [fileId, setFileId] = useState<Id<"_storage"> | null>(null);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);

  const handleOpenDialog = async () => {
    const newFileId = await generateUploadUrl();
    setFileId(newFileId as Id<"_storage">);
    setIsOpen(true);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpenDialog}>Upload Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a Document</DialogTitle>
          <DialogDescription>
            Upload a team document for you to search over in the future.
          </DialogDescription>

          {fileId && (
            <UploadDocumentForm
              onUpload={() => setIsOpen(false)}
              fileId={fileId}
            />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}