import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border bg-background text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ghost:
          "hover:bg-muted hover:text-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        link:
          "border-transparent text-primary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0",
      },
      size: {
        default: "h-10 min-h-[40px] px-5 has-[>svg]:px-4",
        sm: "h-9 min-h-[36px] px-4 text-sm has-[>svg]:px-3",
        lg: "h-11 min-h-[44px] px-6 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
