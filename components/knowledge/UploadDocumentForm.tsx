"use client";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LoadingButton } from "./LoadingButton"

const formSchema = z.object({
  title: z.string().min(1).max(250),
  fileId: z.string(),
});

export function UploadDocumentForm({
  onUpload,
  fileId,
}: {
  onUpload: () => void;
  fileId: Id<"_storage">;
}) {
  const createDocument = useMutation(api.documents.createDocument);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fileId: fileId,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await createDocument({
      title: values.title,
      fileId: values.fileId as Id<"_storage">,
    });
    onUpload();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Expense Report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          isLoading={form.formState.isSubmitting}
          loadingText="Uploading..."
        >
          Upload
        </LoadingButton>
      </form>
    </Form>
  );
}
