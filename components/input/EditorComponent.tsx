"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EditorState } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import {
    baseKeymap,
    chainCommands,
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock,
} from "prosemirror-commands";
import "prosemirror-view/style/prosemirror.css";
import { EditorView } from "prosemirror-view";
import { EditorFocuser } from './EditorFocuser';

const schema = new Schema({
    nodes: {
        doc: {
            content: "block+",
        },
        paragraph: {
            group: "block",
            content: "inline*",
            toDOM() {
                return ["p", 0];
            },
        },
        text: {
            group: "inline",
        },
    },
});

const createDefaultState = (content: string) => {
    return EditorState.create({
        schema,
        doc: schema.node("doc", null, [
            schema.node("paragraph", null, content ? [schema.text(content)] : [])
        ]),
        plugins: [
            keymap({
                ...baseKeymap,
                Enter: (state, dispatch) => {
                    if (state.selection.empty && state.doc.content.size > 0) {
                        if (dispatch) {
                            dispatch(state.tr.setMeta("isEnter", true));
                        }
                        return true;
                    }
                    return false;
                },
                "Shift-Enter": chainCommands(
                    newlineInCode,
                    createParagraphNear,
                    liftEmptyBlock,
                    splitBlock,
                ),
            }),
        ],
    });
};

interface EditorComponentProps {
    content: string;
    onChange: (content: string) => void;
    onSubmit: () => void;
}

export const EditorComponent: React.FC<EditorComponentProps> = ({ content, onChange, onSubmit }) => {
    const [editorState, setEditorState] = useState(() => createDefaultState(content));
    const editorViewRef = useRef<EditorView | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const handleEditorStateChange = useCallback(
        (newState: EditorState) => {
            setEditorState(newState);
            const newContent = newState.doc.textContent.trim();
            if (newContent !== content) {
                onChange(newContent);
            }
        },
        [onChange, content]
    );

    useEffect(() => {
        if (editorContainerRef.current && !editorViewRef.current) {
            editorViewRef.current = new EditorView(editorContainerRef.current, {
                state: editorState,
                dispatchTransaction: (transaction) => {
                    const newState = editorState.apply(transaction);
                    handleEditorStateChange(newState);

                    if (transaction.getMeta("isEnter")) {
                        onSubmit();
                    }
                },
            });
        }

        return () => {
            if (editorViewRef.current) {
                editorViewRef.current.destroy();
                editorViewRef.current = null;
            }
        };
    }, [editorState, handleEditorStateChange, onSubmit]);

    useEffect(() => {
        if (editorViewRef.current && content !== editorViewRef.current.state.doc.textContent.trim()) {
            const transaction = editorViewRef.current.state.tr
                .setSelection(editorViewRef.current.state.selection)
                .clearContent()
                .insertText(content);
            editorViewRef.current.dispatch(transaction);
        }
    }, [content]);

    return (
        <div
            aria-label="Write your prompt"
            className="text-[16px] mt-1 max-h-96 w-full overflow-y-auto break-words outline-none focus:outline-none text-black dark:text-white"
        >
            <div ref={editorContainerRef} className="prosemirror-editor" />
            <EditorFocuser editorView={editorViewRef.current} shouldReset={false} />
        </div>
    );
};