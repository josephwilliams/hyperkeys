import type { Metadata } from "next";
import { LIGHT_THEME_END_HOUR, LIGHT_THEME_START_HOUR } from "@/lib/constants";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

// Runs before hydration so the first paint already has the right theme.
const THEME_SCRIPT = `(function(){var h=new Date().getHours();document.documentElement.className=(h>=${LIGHT_THEME_START_HOUR}&&h<${LIGHT_THEME_END_HOUR})?"light":"dark"})()`;

export const metadata: Metadata = {
  title: "Hyperkeys",
  description: "Keyboard-native perpetual futures trading simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT,
          }}
        />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
