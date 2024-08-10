import React, { useEffect, useRef } from 'react';
import { EditorView } from 'prosemirror-view';
import { useEditorEffect } from "@nytimes/react-prosemirror";

interface EditorFocuserProps {
    shouldReset: boolean;
}

export const EditorFocuser: React.FC<{ shouldReset: boolean }> = ({ shouldReset }) => {
    const focusRef = useRef<(() => void) | null>(null);

    useEditorEffect(
        (view) => {
            focusRef.current = () => view.focus();
            setTimeout(() => focusRef.current?.(), 0);
            return () => {
                focusRef.current = null;
            };
        },
        [shouldReset],
    );

    return null;
};
