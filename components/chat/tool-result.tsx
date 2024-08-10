import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileViewer } from '@/components/github/file-viewer';

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
    const filteredArgs = Object.entries(args).filter(([key]) => !['token', 'repoContext', 'content', 'path'].includes(key));
    return filteredArgs.map(([key, value]) => `${key}: ${typeof value === 'string' ? value : '[complex value]'}`).join(', ');
};

export const ToolResult: React.FC<ToolResultProps> = ({ toolName, args, result, state }) => {
    const [currentState, setCurrentState] = useState(state);
    const [currentResult, setCurrentResult] = useState(result);
    const [showOldContent, setShowOldContent] = useState(false);

    useEffect(() => {
        setCurrentState(state);
        setCurrentResult(result);
    }, [state, result]);

    const filteredArgs = { ...args };
    delete filteredArgs.token;
    delete filteredArgs.repoContext;
    delete filteredArgs.content;
    delete filteredArgs.path;

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
            return <Loader2 className="animate-spin w-5 h-5 text-foreground" />;
        } else if (currentState === 'result') {
            return <CheckCircle2 className="text-foreground w-6 h-6" />;
        }
        return null;
    };

    const showFileContents = toolName === 'rewrite_file' && currentState === 'result' && currentResult?.newContent && currentResult?.oldContent;

    const handleViewContents = () => {
        setShowOldContent(!showOldContent);
    };

    return (
        <div className="mt-6 mb-4 px-4 text-sm text-foreground">
            <div className={cn("bg-background text-foreground rounded border border-border overflow-hidden")}>
                <div className="flex justify-between items-center p-2 bg-secondary border-b border-border">
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
                    {showFileContents ? (
                        <>
                            <FileViewer
                                content={showOldContent ? currentResult.oldContent : currentResult.newContent}
                                filename={args.path}
                            />
                            <div className="mt-2 flex space-x-4">
                                <button onClick={handleViewContents} className="flex items-center text-foreground hover:bg-secondary px-3 py-1 rounded border border-border transition-colors duration-200">
                                    <GitCompare className="w-4 h-4 mr-2" />
                                    {showOldContent ? 'View new content' : 'View old content'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <pre className="whitespace-pre-wrap overflow-x-auto mt-1">
                            {renderResult()}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};
