"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { Toaster } from 'sonner'

function ThemedToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      position="top-center"
      richColors
      theme={theme === "dark" ? "dark" : "light"}
    />
  )
}

export default function Providers({ children, ...props }: ThemeProviderProps) {

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange {...props}>
      <SessionProvider>
        <ThemedToaster />
        {children}
        </SessionProvider>
      </NextThemesProvider>
  )
}