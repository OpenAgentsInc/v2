import { Schema } from "prosemirror-model";

export const schema = new Schema({
    nodes: {
        doc: {
            content: "block+",
        },
        paragraph: {
            group: "block",
            content: "inline*",
            toDOM() {
                return ["p", { style: "white-space: pre-wrap;" }, 0];
            },
        },
        text: {
            group: "inline",
        },
    },
});
