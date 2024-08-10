import React from 'react';

interface VisualRepresentation {
    id: string;
    charCount: number;
    content: string;
    fileName?: string;
    fileExtension?: string;
}

interface FileRepresentationProps {
    representation: VisualRepresentation;
    onDelete: (id: string) => void;
}

export const FileRepresentation: React.FC<FileRepresentationProps> = ({ representation, onDelete }) => {
    return (
        <div className="group relative inline-block p-0.5 cursor-pointer" style={{ opacity: 1, transform: 'none' }}>
            <div className="absolute left-1 top-1 z-10">
                <button
                    className="border-0.5 border-white text-white bg-black hover:bg-red-600 hover:text-white -translate-x-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-105"
                    onClick={() => onDelete(representation.id)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
                    </svg>
                </button>
            </div>
            <div className="relative grid grid-rows-[1fr_auto] items-center h-20 w-28" data-testid="file-thumbnail" data-state="closed">
                <div className="pointer-events-none absolute inset-0 z-0 grid grid-rows-[auto_1fr] overflow-hidden transition transition-transform duration-100 group-active:scale-[0.99]">
                    <div className="relative z-[1] -mb-[0.5px] flex">
                        <div className="border-white border-l-0.5 border-t-0.5 group-hover:border-gray-300 h-full w-full bg-black transition-colors duration-100 rounded-tl-lg"></div>
                    </div>
                    <div className="relative">
                        <div className="via-white/10 to-white/20 border-l-0.5 border-b-0.5 border-r-0.5 border-white group-hover:border-gray-300 absolute inset-0 bg-black bg-gradient-to-b from-black from-20% via-70% transition-colors duration-100 rounded-b-lg"></div>
                    </div>
                </div>
                <div className="fade-out-bottom text-white pointer-events-none visible relative z-[1] h-full overflow-hidden break-words text-left leading-tight tracking-tighter opacity-70 px-3.5 pt-3.5 text-[0.5rem] font-semibold">
                    {representation.fileName || representation.content.slice(0, 50)}
                </div>
                <div className="text-center">
                    <div className="pointer-events-none font-bold uppercase bg-white text-black inline-block rounded-full px-1.5 py-[0.125rem] text-[0.65rem] font-bold absolute left-1/2 top-full z-10 -mt-1 -translate-x-1/2 -translate-y-1/2">
                        {representation.fileExtension || "PASTED"}
                    </div>
                </div>
            </div>
        </div>
    );
};
