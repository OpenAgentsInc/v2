import React, { useState, useCallback } from 'react';
import { VisualRepresentation } from './types';

interface DropAreaProps {
    onDrop: (newRepresentations: VisualRepresentation[]) => void;
    children: React.ReactNode;
    maxFiles: number;
}

export const DropArea: React.FC<DropAreaProps> = ({ onDrop, children, maxFiles }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const newRepresentations: VisualRepresentation[] = [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const fileName = file.name.split('.').slice(0, -1).join('.');
                const fileExtension = file.name.split('.').pop()?.toUpperCase();
                newRepresentations.push({
                    id: Date.now().toString(),
                    charCount: content.length,
                    content,
                    fileName,
                    fileExtension
                });

                if (newRepresentations.length === files.length) {
                    onDrop(newRepresentations.slice(0, maxFiles));
                }
            };
            reader.readAsText(file);
        });
    }, [onDrop, maxFiles]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-start w-full relative"
        >
            {isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-white pointer-events-none z-10"></div>
            )}
            {children}
        </div>
    );
};
