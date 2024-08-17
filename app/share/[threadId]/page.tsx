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
  const thread = useQuery(api.threads.getSharedThread.getSharedThread, {
    threadId: params.threadId,
  });

  if (!thread) {
    return <div>You don&apos;t have access to view this document</div>;
  }

  return (
    <main className="p-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{thread.shareToken}</h1>
      </div>
      <div className="flex gap-12">
        <div className="bg-gray-900 p-4 rounded flex-1 h-[600px]">
        </div>
      </div>
    </main>
  );
}
