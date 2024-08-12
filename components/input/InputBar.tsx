"use client"

import React, { useCallback, useRef, useEffect, useState } from "react";
import Textarea from "react-textarea-autosize";
import { InputSettings } from "./InputSettings";

interface InputBarProps {
    onSubmit: (content: string) => void;
    isLoading: boolean;
}

const MAX_CONTENT_LENGTH = 3500;

export const InputBar: React.FC<InputBarProps> = ({ isLoading, onSubmit }) => {
    const [input, setInput] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const content = e.target.value;
            if (content.length > MAX_CONTENT_LENGTH) {
                setErrorMessage(`Max length of ${MAX_CONTENT_LENGTH} characters exceeded`);
            } else {
                setInput(content);
                setErrorMessage(null);
            }
        },
        [],
    );

    const handleSubmit = useCallback(() => {
        if (input && !isLoading) {
            onSubmit(input);
            setInput("");
            setErrorMessage(null);
        }
    }, [input, onSubmit, isLoading]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="flex flex-col items-start w-full relative">
            {errorMessage && (
                <div className="text-sm flex items-center gap-2 px-4">
                    <span className="text-red-500">
                        {errorMessage}
                    </span>
                </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
                <fieldset className="flex w-full min-w-0 flex-col-reverse">
                    <div className="flex flex-col bg-white dark:bg-black gap-1.5 border-t border-r border-l border-white dark:border-white pl-4 pt-2.5 pr-2.5 pb-2.5 items-stretch transition-all duration-200 relative shadow-sm hover:border-white dark:hover:border-white focus-within:border-white dark:focus-within:border-white cursor-text z-10">
                        <div className="flex gap-2 w-full">
                            <Textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                placeholder="Message OpenAgents..."
                                className="text-[16px] mt-1 max-h-96 w-full overflow-y-auto break-words outline-none focus:outline-none text-black dark:text-white resize-none bg-transparent placeholder-white/40"
                                style={{ whiteSpace: 'pre-wrap' }}
                            />
                            <div className="flex items-center gap-2">
                                {isLoading ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black text-white cursor-not-allowed"
                                        aria-label="Loading"
                                    >
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md active:scale-95 bg-black hover:bg-white/10 text-white"
                                        aria-label="Submit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <InputSettings />
                    </div>
                </fieldset>
            </form>
        </div>
    );
};
