import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Rural Healthcare Triage Assistant',
  description: 'AI-assisted triage decision support for community clinics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const removeDevTools = () => {
                    const portals = document.querySelectorAll('nextjs-portal, [data-nextjs-build-indicator], #__next-build-watcher, #__next-dev-overlay');
                    portals.forEach(el => el.remove());
                    const indicators = document.querySelectorAll('[class*="nextjs"], [id*="nextjs"], [id*="__next"]');
                    indicators.forEach(el => {
                      if (el.textContent && (el.textContent.includes('Compiling') || el.textContent.includes('Building'))) {
                        el.remove();
                      }
                    });
                  };
                  if (document.body) {
                    removeDevTools();
                    const observer = new MutationObserver(removeDevTools);
                    observer.observe(document.body, { childList: true, subtree: true });
                    setInterval(removeDevTools, 500);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
