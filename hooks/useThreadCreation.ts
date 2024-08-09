import { useState, useCallback, useRef, useEffect } from 'react';

export function useThreadCreation(initialId?: number) {
    const [threadId, setThreadId] = useState<number | null>(initialId || null);
    const isCreatingThread = useRef(false);
    const hasInitialized = useRef(false);

    const createNewThread = useCallback(async () => {
        if (threadId || isCreatingThread.current) {
            console.log(`Thread already exists or is being created. id: ${threadId}`);
            return threadId;
        }

        isCreatingThread.current = true;

        try {
            const response = await fetch('/api/thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to create thread');
            const { threadId: newThreadId } = await response.json();
            const numericThreadId = Number(newThreadId);
            if (isNaN(numericThreadId)) {
                throw new Error('Invalid thread ID received from server');
            }
            console.log(`Using thread id: ${numericThreadId}`);
            setThreadId(numericThreadId);
            return numericThreadId;
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
                createNewThread();
            }
        }
    }, [threadId, createNewThread]);

    return { threadId, createNewThread };
}