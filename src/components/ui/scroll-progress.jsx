"use client"
import { useState } from "react"
import { cva } from "class-variance-authority"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion"
import { cn } from "@/lib/utils"

const scrollProgressVariants = cva("fixed z-30 origin-left", {
  variants: {
    variant: {
      default: "bg-gradient-to-r from-stone-600 via-stone-500 to-stone-400",
      stone: "bg-gradient-to-r from-stone-700 via-stone-500 to-stone-400",
      monochrome: "bg-gradient-to-r from-stone-800 via-stone-600 to-stone-400",
      subtle: "bg-gradient-to-r from-stone-600/80 via-stone-500/80 to-stone-400/80",
      solid: "bg-stone-500",
      custom: "",
    },
    size: {
      xs: "h-0.5",
      sm: "h-1",
      default: "h-1.5",
      lg: "h-2",
      xl: "h-3",
      "2xl": "h-4",
    },
    position: {
      top: "inset-x-0 top-0",
      bottom: "inset-x-0 bottom-0",
    },
    rounded: {
      none: "",
      sm: "rounded-sm",
      default: "rounded",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    glow: {
      none: "",
      sm: "shadow-sm",
      default: "shadow-md",
      lg: "shadow-lg drop-shadow-lg",
      xl: "shadow-xl drop-shadow-xl",
    },
  },
  defaultVariants: {
    variant: "stone",
    size: "default",
    position: "top",
    rounded: "none",
    glow: "none",
  },
})

export function ScrollProgress({
  className,
  variant = "stone",
  size,
  position,
  rounded,
  glow,
  customGradient,
  springConfig = {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  },
  showPercentage = false,
  percentagePosition = "right",
  container,
}) {
  const { scrollYProgress } = useScroll(container ? { container } : undefined)
  const scaleX = useSpring(scrollYProgress, springConfig)
  const [percentage, setPercentage] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercentage(Math.round(latest * 100))
  })

  const progressBarClasses = cn(
    scrollProgressVariants({ variant, size, position, rounded, glow }),
    variant === "custom" && customGradient,
    className
  )

  const percentageClasses = cn(
    "fixed z-40 text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded",
    position === "top" ? "top-3" : "bottom-3",
    percentagePosition === "left" && "left-4",
    percentagePosition === "right" && "right-4",
    percentagePosition === "center" && "left-1/2 -translate-x-1/2"
  )

  return (
    <>
      <motion.div
        className={progressBarClasses}
        style={{
          scaleX,
        }}
      />
      {showPercentage && (
        <motion.div
          className={percentageClasses}
          style={{
            opacity: scrollYProgress,
          }}
        >
          <motion.span>{percentage}%</motion.span>
        </motion.div>
      )}
    </>
  )
}

export default ScrollProgress
