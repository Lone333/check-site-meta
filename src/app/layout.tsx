import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "lazy-cn";
import "./globals.css";
import { ThemeSwitcherDev } from "./theme-switch";
import { ReactScan } from "./lib/react-scan";


// Metadata -----------------------------


export const metadata: Metadata = {
  title: "Check Site Meta",
  description: "Check the metadata of any site.",
  authors: [{
    name: "Alfonsus Ardani",
    url: "https://alfon.dev",
  }],
}
export const viewport: Viewport = {
  colorScheme: "light dark"
}


// Components -----------------------------


export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{
      scrollBehavior: "smooth",
      overflowAnchor: "none",
    }}>
      <head>
        <ReactScan />
        <ThemeScript />
        <meta name="version" content={process.env['CSM_VERSION']} />
        <meta name="disable_analytics" content={process.env['DISABLE_ANALYTICS']} />
      </head>
      <body className={cn(
        sans.variable,
        mono.variable,
        `subpixel-antialiased bg-background`
      )}>
        
        <ThemeSwitcherDev />
        {props.children}
      </body>
    </html>
  );
}

// Fonts -----------------------------

const sans = Plus_Jakarta_Sans({
  variable: "--font-pjs",
  subsets: ["latin"],
});
const mono = JetBrains_Mono({
  variable: "--font-gm",
  subsets: ["latin"],
});

// Scripts -----------------------------

function ThemeScript() {
  return (
    <script id="theme">{`const theme = localStorage.getItem('theme');
if (theme === null || !['light', 'dark', 'system'].includes(theme)) {
  localStorage.setItem('theme', 'system');
  document.documentElement.style.colorScheme = 'light dark';
} else {
  if (theme === 'system') {
    document.documentElement.style.colorScheme = 'light dark';
  } else {
    document.documentElement.style.colorScheme = theme;
  }
}`}</script>
  )
}

