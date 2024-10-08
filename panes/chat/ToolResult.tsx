import { CheckCircle2, GitCompare, Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { FileViewer } from "./FileViewer"

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
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      // If it's not valid JSON, just return the string
      return obj;
    }
  }
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
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch (e) {
      return args;
    }
  }
  const filteredArgs = Object.entries(args).filter(([key]) => !['token', 'repoContext', 'content', 'path'].includes(key));
  return filteredArgs.map(([key, value]) => {
    if (typeof value === 'string') {
      return `${key}: ${value}`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return `${key}: ${value}`;
    } else if (value === null) {
      return `${key}: null`;
    } else if (Array.isArray(value)) {
      return `${key}: [Array]`;
    } else if (typeof value === 'object') {
      return `${key}: {Object}`;
    } else {
      return `${key}: ${typeof value}`;
    }
  }).join(', ');
};

export const ToolResult: React.FC<ToolResultProps> = ({ toolName, args, result, state }) => {
  const [currentState, setCurrentState] = useState(state);
  const [currentResult, setCurrentResult] = useState(result);
  const [showOldContent, setShowOldContent] = useState(false);

  useEffect(() => {
    setCurrentState(state);
    setCurrentResult(result);
  }, [state, result]);

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
    return prettyPrintJson(args);
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
    <div className="my-2 px-4 text-sm text-foreground">
      <div className={cn("bg-background text-foreground rounded border border-border overflow-hidden")}>
        <div className="flex justify-between items-center p-2 bg-secondary border-b border-border">
          <span className="font-bold">{toolName}</span>
          <span className="text-xs">{typeof args === 'object' ? args.path : ''}</span>
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
                filename={typeof args === 'object' ? args.path : ''}
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