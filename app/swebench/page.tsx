"use client"
import React, { useState, useMemo } from 'react';
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

const truncate = (str: string, n: number) => {
  return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
};

interface SWEBenchItem {
  _id: string;
  instance_id: string;
  problem_statement: string;
  created_at: string;
  version: string;
}

const SWEBenchTable: React.FC<{ data: SWEBenchItem[] }> = ({ data }) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data]);

  return (
    <Table>
      <TableCaption>A list of SWE Bench data entries for psf/requests (newest to oldest).</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px]">ID</TableHead>
          <TableHead>Problem Statement</TableHead>
          <TableHead className="w-[100px]">Created</TableHead>
          <TableHead className="w-[80px]">Version</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={item._id} className="cursor-pointer">
            <TableCell className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {item.instance_id}
            </TableCell>
            <TableCell className="max-w-0 w-full">
              <div className="truncate">
                {item.problem_statement}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">
              {new Date(item.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">
              {truncate(item.version, 10)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function SWEBenchPage() {
  const sweData = useQuery(api.swebench.getAllSWEData);
  const [selectedItem, setSelectedItem] = useState<SWEBenchItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (sweData === undefined) {
    return <p className="text-white">Loading...</p>;
  }

  const handleRowClick = (item: SWEBenchItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">SWE-Bench Verified Samples (psf/requests)</h1>
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        const row = target.closest('tr');
        if (row && row.parentNode) {
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