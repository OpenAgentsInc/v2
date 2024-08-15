"use client"
import React, { useState } from 'react';
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SWEBenchPage() {
  const sweData = useQuery(api.swebench.getAllSWEData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (sweData === undefined) {
    return <p className="text-white">Loading...</p>;
  }

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">SWE-Bench Verified</h1>
      <Table>
        <TableCaption>A list of SWE Bench data entries.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Instance ID</TableHead>
            <TableHead>Repo</TableHead>
            <TableHead>Base Commit</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sweData.map((item) => (
            <TableRow key={item._id} onClick={() => handleRowClick(item)} className="cursor-pointer">
              <TableCell className="font-medium">{item.instance_id}</TableCell>
              <TableCell>{item.repo}</TableCell>
              <TableCell>{item.base_commit}</TableCell>
              <TableCell>{item.created_at}</TableCell>
              <TableCell>{item.version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] w-full max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>SWE Bench Entry Details</DialogTitle>
            <DialogDescription>
              Detailed information for the selected SWE Bench entry.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(80vh-120px)] pr-4">
            <div className="grid gap-4 py-4">
              {selectedItem && Object.entries(selectedItem).map(([key, value]) => (
                <div key={key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={key} className="text-right">
                    {key}
                  </Label>
                  <div id={key} className="col-span-3 break-words">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
