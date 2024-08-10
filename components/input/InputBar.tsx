"use client"

import React, { useCallback, useRef, useEffect } from "react";
import { EditorState } from "prosemirror-state";
import "prosemirror-view/style/prosemirror.css";
import { ProseMirror } from "@nytimes/react-prosemirror";
import { EditorFocuser } from "./EditorFocuser";
import { InputSettings } from "./InputSettings";
import { FileRepresentation } from "./FileRepresentation";
import { useEditorState } from "./useEditorState";
import { useFileDrop } from "./useFileDrop";
import { useVisualRepresentations } from "./useVisualRepresentations";

interface InputBarProps {
    onSubmit: (content: string) => void;
}

const MAX_REPRESENTATIONS = 5;
const MAX_CONTENT_LENGTH = 3500;

export const InputBar: React.FC<InputBarProps> = ({ onSubmit }) => {
    const [mount, setMount] = React.useState<HTMLElement | null>(null);
    const { editorState, setEditorState, shouldReset, setShouldReset, createDefaultState } = useEditorState();
    const { visualRepresentations, addVisualRepresentation, deleteVisualRepresentation, setVisualRepresentations } = useVisualRepresentations(MAX_REPRESENTATIONS);
    const { isDragging, errorMessage, handleDragOver, handleDragLeave, handleDrop, setErrorMessage } = useFileDrop(MAX_REPRESENTATIONS);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    const handleEditorStateChange = useCallback(
        (state: EditorState) => {
            const content = state.doc.textContent.trim();
            if (content.length > MAX_CONTENT_LENGTH) {
                if (addVisualRepresentation(content)) {
                    setEditorState(createDefaultState());
                    setErrorMessage(null);
                } else {
                    setErrorMessage(`Max of ${MAX_REPRESENTATIONS}`);
                }
            } else {
                setEditorState(state);
            }
        },
        [addVisualRepresentation, createDefaultState, setEditorState, setErrorMessage],
    );

    const handleSubmit = useCallback(() => {
        const content = editorState.doc.textContent;  // Remove trim() here
        if (content || visualRepresentations.length > 0) {
            const fullContent = [
                ...visualRepresentations.map(vr => vr.content),
                content
            ].join('\n');  // Remove trim() here
            onSubmit(fullContent);
            setVisualRepresentations([]);
            setShouldReset(true);
            setErrorMessage(null);
        }
    }, [editorState, onSubmit, visualRepresentations, setVisualRepresentations, setShouldReset, setErrorMessage]);

    const handleFileRead = useCallback((content: string, fileName: string, fileExtension: string) => {
        addVisualRepresentation(content, fileName, fileExtension);
    }, [addVisualRepresentation]);

    useEffect(() => {
        if (shouldReset) {
            setEditorState(createDefaultState());
            setShouldReset(false);
        }
    }, [shouldReset, setEditorState, createDefaultState, setShouldReset]);

    return (
        <div
            ref={dropAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, visualRepresentations.length, handleFileRead)}
            className="flex flex-col items-start w-full relative"
        >
            {isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-white pointer-events-none z-10"></div>
            )}
            <div className="flex items-end gap-1 overflow-x-auto w-full px-4">
                {visualRepresentations.map(rep => (
                    <FileRepresentation
                        key={rep.id}
                        representation={rep}
                        onDelete={deleteVisualRepresentation}
                    />
                ))}
            </div>
            {(visualRepresentations.length > 0 || errorMessage) && (
                <div className="text-sm flex items-center gap-2 px-4">
                    <span className="text-gray-500">
                        {visualRepresentations.length} {visualRepresentations.length === 1 ? 'file' : 'files'} added
                    </span>
                    {errorMessage && (
                        <span className="text-red-500">
                            {errorMessage}
                        </span>
                    )}
                </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
                <fieldset className="flex w-full min-w-0 flex-col-reverse">
                    <div className="flex flex-col bg-white dark:bg-black gap-1.5 border-t border-r border-l border-white dark:border-white pl-4 pt-2.5 pr-2.5 pb-2.5 items-stretch transition-all duration-200 relative shadow-sm hover:border-white dark:hover:border-white focus-within:border-white dark:focus-within:border-white cursor-text z-10 rounded-t-xl">
                        <div className="flex gap-2 w-full">
                            <div
                                aria-label="Write your prompt"
                                className="text-[16px] mt-1 max-h-96 w-full overflow-y-auto break-words outline-none focus:outline-none text-black dark:text-white"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                <ProseMirror
                                    mount={mount}
                                    state={editorState}
                                    dispatchTransaction={(tr) => {
                                        const newState = editorState.apply(tr);
                                        handleEditorStateChange(newState);

                                        if (tr.getMeta("isEnter")) {
                                            handleSubmit();
                                        }
                                    }}
                                >
                                    <div ref={setMount} className="prosemirror-editor" />
                                    <EditorFocuser shouldReset={shouldReset} />
                                </ProseMirror>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Commented out paperclip icon
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md active:scale-95 bg-black hover:bg-white/10 text-white"
                                    aria-label="Upload content"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,193A24,24,0,1,1,71,159L154.3,74.38A8,8,0,1,1,165.7,85.6L82.39,170.31a8,8,0,1,0,11.27,11.36L192.93,81A24,24,0,1,0,159,47L59.76,147.68a40,40,0,1,0,56.53,56.62l82.06-82A8,8,0,0,1,209.66,122.34Z"></path>
                                    </svg>
                                </button>
                                */}
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
                            </div>
                        </div>
                        <InputSettings />
                    </div>
                </fieldset>
            </form>
        </div>
    );
};
