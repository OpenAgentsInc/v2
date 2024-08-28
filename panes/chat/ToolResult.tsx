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
  const [processedResult, setProcessedResult] = useState<string | null>(null);

  useEffect(() => {
    setCurrentState(state);
    setCurrentResult(result);
    setProcessedResult(null); // Reset processed result when result changes
    console.log('ToolResult useEffect - state:', state, 'result:', result);
  }, [state, result]);

  const renderResult = () => {
    console.log('renderResult - currentState:', currentState, 'currentResult:', currentResult);
    
    if (currentState === 'result' && currentResult) {
      if (processedResult !== null) {
        console.log('Returning cached processed result');
        return processedResult;
      }

      let resultToRender = currentResult;

      console.log('Initial resultToRender:', resultToRender);

      // Handle rehydrated data structure (stringified JSON)
      if (typeof resultToRender === 'string') {
        try {
          resultToRender = JSON.parse(resultToRender);
          console.log('Parsed stringified result:', resultToRender);
        } catch (e) {
          console.log('Failed to parse stringified result, using as-is');
        }
      }

      // Handle nested result structure
      if (typeof resultToRender === 'object' && 'result' in resultToRender) {
        resultToRender = resultToRender.result;
        console.log('After handling nested result:', resultToRender);
      }

      let finalResult: string;

      if (typeof resultToRender === 'string') {
        console.log('Using string result:', resultToRender);
        finalResult = resultToRender;
      } else if (typeof resultToRender === 'object' && resultToRender !== null) {
        console.log('Handling object result');
        if ('summary' in resultToRender) {
          console.log('Using summary:', resultToRender.summary);
          finalResult = resultToRender.summary;
        } else if ('content' in resultToRender) {
          console.log('Using content:', resultToRender.content);
          finalResult = resultToRender.content;
        } else if ('details' in resultToRender) {
          console.log('Using details:', resultToRender.details);
          finalResult = resultToRender.details;
        } else {
          console.log('Stringifying object:', resultToRender);
          finalResult = JSON.stringify(resultToRender, null, 2);
        }
      } else {
        console.log('Fallback: stringifying result:', resultToRender);
        finalResult = JSON.stringify(resultToRender, null, 2);
      }

      setProcessedResult(finalResult);
      return finalResult;
    }
    if (currentState === 'call') {
      console.log('Returning call state message');
      return `Calling ${toolName}...`;
    }
    console.log('Returning empty string');
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

  console.log('ToolResult render - toolName:', toolName, 'args:', args, 'state:', currentState);

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