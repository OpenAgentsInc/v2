"use client"
import React from 'react';
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

export default function SWEBenchPage() {
  const sweData = useQuery(api.swebench.getAllSWEData);

  if (sweData === undefined) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">SWE Bench Data</h1>
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
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.instance_id}</TableCell>
              <TableCell>{item.repo}</TableCell>
              <TableCell>{item.base_commit}</TableCell>
              <TableCell>{item.created_at}</TableCell>
              <TableCell>{item.version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
