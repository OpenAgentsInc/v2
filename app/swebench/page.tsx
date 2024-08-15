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
import SWEBenchModal from "@/components/swebench/SWEBenchModal";

const SWEBenchTable: React.FC<{ data: any[] }> = ({ data }) => (
  <Table>
    <TableCaption>A list of SWE Bench data entries for psf/requests.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Instance ID</TableHead>
        <TableHead>Base Commit</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Version</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item._id} className="cursor-pointer">
          <TableCell className="font-medium">{item.instance_id}</TableCell>
          <TableCell>{item.base_commit}</TableCell>
          <TableCell>{item.created_at}</TableCell>
          <TableCell>{item.version}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

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
      <h1 className="text-2xl font-bold text-white mb-4">SWE-Bench Verified (psf/requests)</h1>
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        const row = target.closest('tr');
        if (row) {
          const index = Array.from(row.parentNode.children).indexOf(row);
          handleRowClick(sweData[index]);
        }
      }}>
        <SWEBenchTable data={sweData} />
      </div>
      <SWEBenchModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedItem={selectedItem}
      />
    </div>
  );
}