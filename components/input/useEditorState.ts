import { useState, useCallback } from "react";
import { EditorState } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import {
    baseKeymap,
    chainCommands,
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock,
} from "prosemirror-commands";
import { schema } from "./schema";

export const useEditorState = () => {
    const createDefaultState = useCallback(() => {
        return EditorState.create({
            schema,
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
    }, []);

    const [editorState, setEditorState] = useState(createDefaultState);
    const [shouldReset, setShouldReset] = useState(false);

    return { editorState, setEditorState, shouldReset, setShouldReset, createDefaultState };
};
