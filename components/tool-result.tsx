import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolResultProps {
    toolName: string;
    args: any;
    result: any;
    state: 'partial-call' | 'call' | 'result';
}

const truncateLines = (str: string, maxLines: number) => {
    const lines = str.split('\n');
    if (lines.length <= maxLines) return str;
    return lines.slice(0, maxLines).join('\n') + '\n...';
};

const prettyPrintJson = (obj: any): string => {
    const prettyJson = JSON.stringify(obj, (key, value) => {
        if (key === 'token') return '[REDACTED]';
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 47) + '...';
        }
        return value;
    }, 2);
    return truncateLines(prettyJson, 5);
};

const getToolParams = (toolName: string, args: any): string => {
    const filteredArgs = Object.entries(args).filter(([key]) => !['token', 'repoContext', 'content'].includes(key));
    return filteredArgs.map(([key, value]) => `${key}: ${typeof value === 'string' ? value : '[complex value]'}`).join(', ');
};

export const ToolResult: React.FC<ToolResultProps> = ({ toolName, args, result, state }) => {
    const [currentState, setCurrentState] = useState(state);
    const [currentResult, setCurrentResult] = useState(result);

    useEffect(() => {
        setCurrentState(state);
        setCurrentResult(result);
    }, [state, result]);

    const filteredArgs = { ...args };
    delete filteredArgs.token;
    delete filteredArgs.repoContext;
    delete filteredArgs.content;

    const renderResult = () => {
        if (currentState === 'result' && currentResult) {
            if (typeof currentResult === 'object' && currentResult !== null) {
                if ('summary' in currentResult) {
                    return currentResult.summary;
                }
            }
            return prettyPrintJson(currentResult);
        }
        if (currentState === 'call') {
            return `Calling ${toolName}...`;
        }
        return prettyPrintJson(filteredArgs);
    };

    const renderStateIcon = () => {
        if (currentState === 'call') {
            return <Loader2 className="animate-spin w-5 h-5" />;
        } else if (currentState === 'result') {
            return <CheckCircle2 className="text-white w-6 h-6" />;
        }
        return null;
    };

    const showFileContents = toolName === 'rewrite_file' && currentState === 'result' && currentResult?.newContent && currentResult?.oldContent;

    const handleViewContents = () => {
        // Implement the logic to show file contents diff
        // This might involve using a state management solution or a modal
        console.log('View contents clicked');
    };

    return (
        <div className="mt-5 px-4 text-sm text-white">
            <div className={cn("bg-gray-800 text-white rounded border border-gray-700 overflow-hidden")}>
                <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
                    <span className="font-bold">{toolName}</span>
                    <span className="text-xs">{args.path}</span>
                </div>
                <div className="p-2 pt-1 relative">
                    <div className="absolute top-2 right-2">
                        {renderStateIcon()}
                    </div>
                    <div>
                        <span>{getToolParams(toolName, args)}</span>
                    </div>
                    <pre className="whitespace-pre-wrap overflow-x-auto mt-1">
                        {renderResult()}
                    </pre>
                    {showFileContents && (
                        <div className="mt-2 flex space-x-4">
                            <button onClick={handleViewContents} className="flex items-center text-white hover:bg-gray-700 px-3 py-1 rounded border border-gray-600 transition-colors duration-200">
                                <GitCompare className="w-4 h-4 mr-2" />
                                View changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
