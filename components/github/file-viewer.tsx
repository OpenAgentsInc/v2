"use client"

import React, { useState } from 'react';

interface FileViewerProps {
    content: string;
    filename: string;
}

export function FileViewer({ content = '', filename }: FileViewerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const previewLines = content.split('\n').slice(0, 5).join('\n');

    return (
        <div className="border rounded p-4 max-w-[400px]">
            <h3 className="font-bold mb-2">{filename}</h3>
            {content ? (
                <>
                    <pre className="bg-gray-100 p-2 rounded mb-2 overflow-x-auto">
                        <code>{isOpen ? content : previewLines}</code>
                    </pre>
                    {content.split('\n').length > 5 && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-blue-500 hover:underline"
                        >
                            {isOpen ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </>
            ) : (
                <p>No content available</p>
            )}
        </div>
    );
}
