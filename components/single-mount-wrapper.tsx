import React, { useRef, useEffect, useState } from 'react';

interface SingleMountWrapperProps {
    children: React.ReactNode;
}

export function SingleMountWrapper({ children }: SingleMountWrapperProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const hasRendered = useRef(false);

    useEffect(() => {
        if (!hasRendered.current) {
            hasRendered.current = true;
            setShouldRender(true);
        }
    }, []);

    return shouldRender ? <>{children}</> : null;
}
