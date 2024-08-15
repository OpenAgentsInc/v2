"use client"

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FileViewerProps {
    content: string;
    filename: string;
}

export function FileViewer({ content = '', filename }: FileViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const previewLines = content.split('\n').slice(0, 5).join('\n');

    return (
        <div className={cn(
            'border rounded p-4 max-w-[640px]',
            'bg-background text-foreground'
        )}>
            <h3 className="font-bold mb-2">{filename}</h3>
            {content ? (
                <>
                    <pre className={cn(
                        'p-2 rounded mb-2 overflow-x-auto',
                        'bg-muted text-muted-foreground'
                    )}>
                        <code>{isOpen ? content : previewLines}</code>
                    </pre>
                    {content.split('\n').length > 5 && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                'text-primary hover:underline',
                                'transition-colors duration-200'
                            )}
                        >
                            {isOpen ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </>
            ) : (
                <p className="text-muted-foreground">No content available</p>
            )}
        </div>
    );
}
