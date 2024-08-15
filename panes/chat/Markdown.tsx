import { FC, memo, useState, useEffect } from 'react'
import ReactMarkdown, { Options } from 'react-markdown'
import { useDebounce } from 'use-debounce'

interface MemoizedReactMarkdownProps extends Options {
    children: string
    delay?: number
    maxWait?: number
}

export const MemoizedReactMarkdown: FC<MemoizedReactMarkdownProps> = memo(
    ({ children, delay = 250, maxWait = 1000, ...props }) => {
        const [content, setContent] = useState(children)
        const [debouncedContent] = useDebounce(content, delay, { maxWait })

        useEffect(() => {
            setContent(children)
        }, [children])

        return <ReactMarkdown {...props}>{debouncedContent}</ReactMarkdown>
    },
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className
)

MemoizedReactMarkdown.displayName = 'MemoizedReactMarkdown';