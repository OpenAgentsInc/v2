// @ts-nocheck
import { useState, useCallback } from "react";

export const useFileDrop = (maxFiles: number) => {
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, currentFileCount: number, onFileRead: (content: string, fileName: string, fileExtension: string) => void) => {
        e.preventDefault();
        setIsDragging(false);

        if (currentFileCount >= maxFiles) {
            setErrorMessage(`Max of ${maxFiles}`);
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const fileName = file.name.split('.').slice(0, -1).join('.');
                const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
                onFileRead(content, fileName, fileExtension);
            };
            reader.readAsText(file);
        });
    }, [maxFiles]);

    return { isDragging, errorMessage, handleDragOver, handleDragLeave, handleDrop, setErrorMessage };
};