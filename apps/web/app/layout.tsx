import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StageRoom — Speak with Clarity, Not Compromise",
  description:
    "Premium performance training for global professionals. Accent clarity, confidence, and professional presence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
              html { scroll-behavior: smooth; }
              body { font-family: 'DM Sans', -apple-system, sans-serif; color: #1e1b4b; background: #faf9ff; }
              ::-webkit-scrollbar { width: 8px; }
              ::-webkit-scrollbar-track { background: #faf9ff; }
              ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 4px; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
