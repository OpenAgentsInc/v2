import { Id } from "@/convex/_generated/dataModel";

export type Document = {
  _id: Id<"documents">;
  _creationTime: number;
  title: string;
  tokenIdentifier: string;
  fileId: Id<"_storage">;
};
