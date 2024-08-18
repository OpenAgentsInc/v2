import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface SWEBenchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: any;
}

const SWEBenchModal: React.FC<SWEBenchModalProps> = ({ isOpen, onOpenChange, selectedItem }) => {
  if (!selectedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>SWE Bench Entry Details</DialogTitle>
          <DialogDescription>
            Detailed information for the selected SWE Bench entry.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Problem Statement</h3>
            <p className="whitespace-pre-wrap">{selectedItem.problem_statement}</p>
          </div>
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="grid gap-4">
              {Object.entries(selectedItem).map(([key, value]) => {
                if (key === 'problem_statement') return null;
                return (
                  <div key={key} className="grid grid-cols-3 items-start gap-4">
                    <Label htmlFor={key} className="text-right">
                      {key}
                    </Label>
                    <div id={key} className="col-span-2 break-words">
                      {typeof value === 'string' ? (
                        <p className="whitespace-pre-wrap">{value}</p>
                      ) : (
                        JSON.stringify(value, null, 2)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SWEBenchModal;