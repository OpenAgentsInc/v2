import { useState, useCallback, useRef, useEffect } from 'react';

export function useThreadCreation(initialId?: string) {
    const [threadId, setThreadId] = useState<string | null>(initialId || null);
    const isCreatingThread = useRef(false);
    const hasInitialized = useRef(false);

    const createNewThread = useCallback(async () => {
        if (threadId || isCreatingThread.current) {
            console.log(`Thread already exists or is being created. id: ${threadId}`);
            return threadId;
        }

        console.log("Attempting to create new thread...");
        isCreatingThread.current = true;

        try {
            const response = await fetch('/api/thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to create thread');
            const { threadId: newThreadId } = await response.json();
            console.log(`New thread created with id: ${newThreadId}`);
            setThreadId(newThreadId);
            return newThreadId;
        } catch (error) {
            console.error('Error creating new thread:', error);
            throw error;
        } finally {
            isCreatingThread.current = false;
        }
    }, [threadId]);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (!threadId && !isCreatingThread.current) {
                console.log("No thread id found, creating new thread...");
                createNewThread();
            }
        }
    }, [threadId, createNewThread]);

    return { threadId, createNewThread };
}
