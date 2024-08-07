import { useCallback, useEffect, useRef, useState } from 'react'

export const useScrollAnchor = () => {
    const messagesRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const visibilityRef = useRef<HTMLDivElement>(null)
    const [isAtBottom, setIsAtBottom] = useState(true)
    const [isVisible, setIsVisible] = useState(false)

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            const scrollHeight = scrollRef.current.scrollHeight
            scrollRef.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            })
            console.log('Scrolling to bottom:', scrollHeight)
        } else {
            console.warn('scrollRef is not set')
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current && isAtBottom && !isVisible) {
            const scrollHeight = scrollRef.current.scrollHeight
            scrollRef.current.scrollTop = scrollHeight
            console.log('Auto-scrolling to bottom:', scrollHeight)
        }
    }, [isAtBottom, isVisible])

    useEffect(() => {
        const { current } = scrollRef
        if (current) {
            const handleScroll = () => {
                const { scrollTop, scrollHeight, clientHeight } = current
                const offset = 25
                const bottomThreshold = scrollHeight - offset
                const isAtBottom = scrollTop + clientHeight >= bottomThreshold
                setIsAtBottom(isAtBottom)
                console.log('Scroll position:', { scrollTop, scrollHeight, clientHeight, isAtBottom })
            }

            current.addEventListener('scroll', handleScroll, { passive: true })
            return () => {
                current.removeEventListener('scroll', handleScroll)
            }
        }
    }, [])

    useEffect(() => {
        if (visibilityRef.current && scrollRef.current) {
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        setIsVisible(entry.isIntersecting)
                        console.log('Visibility changed:', entry.isIntersecting)
                    })
                },
                {
                    root: scrollRef.current,
                    rootMargin: '0px 0px -150px 0px'
                }
            )
            observer.observe(visibilityRef.current)
            return () => {
                observer.disconnect()
            }
        }
    }, [])

    return {
        messagesRef,
        scrollRef,
        visibilityRef,
        scrollToBottom,
        isAtBottom,
        isVisible
    }
}
