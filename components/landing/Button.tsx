// Tremor Raw Button [v0.1.1] - Black and White Theme

import { cx, focusRing } from "./utils"
import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

const buttonVariants = tv({
    base: [
        // base
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg border px-3 py-2 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out",
        // disabled
        "disabled:pointer-events-none disabled:shadow-none",
        // focus
        focusRing,
    ],
    variants: {
        variant: {
            primary: [
                // border
                "border-transparent",
                // text color
                "text-black",
                // background color
                "bg-white",
                // hover color
                "hover:bg-gray-200",
                // disabled
                "disabled:bg-gray-300 disabled:text-gray-500",
            ],
            secondary: [
                // border
                "border-white",
                // text color
                "text-white",
                // background color
                "bg-black",
                //hover color
                "hover:bg-gray-900",
                // disabled
                "disabled:text-gray-500",
            ],
            light: [
                // base
                "shadow-none",
                // border
                "border-transparent",
                // text color
                "text-black",
                // background color
                "bg-gray-200",
                // hover color
                "hover:bg-gray-300",
                // disabled
                "disabled:bg-gray-100 disabled:text-gray-400",
            ],
            ghost: [
                // base
                "shadow-none",
                // border
                "border-transparent",
                // text color
                "text-white",
                // hover color
                "bg-transparent hover:bg-white hover:text-black",
                // disabled
                "disabled:text-gray-500",
            ],
            destructive: [
                // text color
                "text-black",
                // border
                "border-transparent",
                // background color
                "bg-white",
                // hover color
                "hover:bg-gray-200",
                // disabled
                "disabled:bg-gray-300 disabled:text-gray-500",
            ],
        },
    },
    defaultVariants: {
        variant: "primary",
    },
})

interface ButtonProps
    extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            asChild,
            isLoading = false,
            loadingText,
            className,
            disabled,
            variant,
            children,
            ...props
        }: ButtonProps,
        forwardedRef,
    ) => {
        const Component = asChild ? Slot : "button"
        return (
            <Component
                ref={forwardedRef}
                className={cx(buttonVariants({ variant }), className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
                        <RiLoader2Fill
                            className="size-4 shrink-0 animate-spin"
                            aria-hidden="true"
                        />
                        <span className="sr-only">
                            {loadingText ? loadingText : "Loading"}
                        </span>
                        {loadingText ? loadingText : children}
                    </span>
                ) : (
                    children
                )}
            </Component>
        )
    },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
