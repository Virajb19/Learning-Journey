import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import Providers from "./providers";
import NextTopLoader from 'nextjs-toploader';

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Learning Journey",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['500','800']
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.className} antialiased min-h-screen pt-20`}>
      <body>
        <Providers>
           <NextTopLoader height={5} color="#38bdf8" showSpinner={false} easing="ease"/>
           <TRPCReactProvider>{children}</TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
