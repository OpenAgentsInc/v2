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

const getToolParams = (toolName: string, args: any): string => {
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch (e) {
      return args;
    }
  }
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

  const renderResult = () => {
    if (currentState === 'result' && currentResult) {
      let resultToRender = currentResult;

      // Handle rehydrated data structure
      if (typeof resultToRender === 'object' && 'result' in resultToRender) {
        resultToRender = resultToRender.result;
      }

      if (typeof resultToRender === 'string') {
        return resultToRender;
      }

      if (typeof resultToRender === 'object' && resultToRender !== null) {
        if ('summary' in resultToRender) {
          return resultToRender.summary;
        }
        if ('content' in resultToRender) {
          return resultToRender.content;
        }
        // If it's an object without summary or content, return an empty string
        return '';
      }

      // If it's neither a string nor an object, return an empty string
      return '';
    }
    if (currentState === 'call') {
      return `Calling ${toolName}...`;
    }
    return '';
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