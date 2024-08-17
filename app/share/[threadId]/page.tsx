"use client";
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function SharePage({
  params,
}: {
  params: {
    threadId: Id<"threads">;
  };
}) {
  // Fetch the shared thread using the threadId from the URL params
  const thread = useQuery(api.threads.getSharedThread.getSharedThread, {
    threadId: params.threadId,
  });

  // If the thread is not found or not shared, show an error message
  if (!thread || !thread.shareToken) {
    return (
      <div className="p-24">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-4">You don&apos;t have access to view this document. It may not exist or it hasn&apos;t been shared.</p>
      </div>
    );
  }

  return (
    <main className="p-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Shared Thread</h1>
      </div>
      <div className="flex gap-12">
        <div className="bg-gray-900 p-4 rounded flex-1 h-[600px]">
          {/* TODO: Add the actual thread content here */}
          <p className="text-white">Thread ID: {params.threadId}</p>
          <p className="text-white">Share Token: {thread.shareToken}</p>
        </div>
      </div>
    </main>
  );
}