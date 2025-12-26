import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
/* eslint-disable react-refresh/only-export-components */
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-black border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black shadow-[0_0_10px_var(--neon-blue)] hover:shadow-[0_0_20px_var(--neon-blue)] font-cyber uppercase tracking-widest",
        cyber: "cyber-button",
        glitch: "bg-black text-white border border-white hover:animate-glitch font-mono",
        gradient: "bg-gradient-to-r from-neon-purple to-neon-blue text-white border-0 hover:opacity-90 shadow-lg",
        brutal: "brutal-btn bg-brutal-bg text-brutal-black hover:bg-brutal-slate",
        "brutal-primary": "brutal-btn bg-brutal-yellow text-brutal-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        "brutal-destructive": "brutal-btn bg-brutal-red text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        "brutal-success": "brutal-btn bg-brutal-green text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-14 rounded-lg px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
