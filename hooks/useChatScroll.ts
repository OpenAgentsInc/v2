import { useEffect, useRef, useState, useCallback } from "react";

export function useChatScroll(messages: any[]): React.RefObject<HTMLDivElement> {
    const ref = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(true);

    const scrollToBottom = useCallback(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (shouldScroll) {
            scrollToBottom();
        }
    }, [shouldScroll, messages, scrollToBottom]);

    useEffect(() => {
        const current = ref.current;
        if (!current) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = current;
            const atBottom = scrollHeight - scrollTop - clientHeight < 180;
            setShouldScroll(atBottom);
        };

        const handleImageLoad = () => {
            if (shouldScroll) {
                scrollToBottom();
            }
        };

        current.addEventListener('scroll', handleScroll);

        const images = current.getElementsByTagName("img");
        Array.from(images).forEach((img) => {
            img.addEventListener("load", handleImageLoad);
        });

        return () => {
            current.removeEventListener('scroll', handleScroll);
            Array.from(images).forEach((img) => {
                img.removeEventListener("load", handleImageLoad);
            });
        };
    }, [shouldScroll, scrollToBottom]);

    return ref;
}
