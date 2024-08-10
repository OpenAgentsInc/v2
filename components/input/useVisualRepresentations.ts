import { useState, useCallback } from "react";

export interface VisualRepresentation {
    id: string;
    charCount: number;
    content: string;
    fileName?: string;
    fileExtension?: string;
}

export const useVisualRepresentations = (maxRepresentations: number) => {
    const [visualRepresentations, setVisualRepresentations] = useState<VisualRepresentation[]>([]);

    const addVisualRepresentation = useCallback((content: string, fileName?: string, fileExtension?: string) => {
        if (visualRepresentations.length < maxRepresentations) {
            setVisualRepresentations(prev => [
                ...prev,
                { id: Date.now().toString(), charCount: content.length, content, fileName, fileExtension }
            ]);
            return true;
        }
        return false;
    }, [visualRepresentations, maxRepresentations]);

    const deleteVisualRepresentation = useCallback((id: string) => {
        setVisualRepresentations(prev => prev.filter(vr => vr.id !== id));
    }, []);

    return { visualRepresentations, addVisualRepresentation, deleteVisualRepresentation, setVisualRepresentations };
};
