"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="group rounded-lg size-12 border-2 bg-transparent hover:bg-blue-600/5 flex-center">
          <Moon className="size-8 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100 group-hover:text-blue-500 dark:text-white" />
          <Sun className="absolute size-8 transition-all text-black scale-100 rotate-0 dark:-rotate-90 dark:scale-0 group-hover:text-blue-500" />
          <span className="sr-only">Toggle theme</span>
        </button>
  )
}