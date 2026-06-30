import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Avery Liao-Troth | AE Intern · Insight Enterprises 2026" },
      {
        name: "description",
        content:
          "An AI agent trained on Avery Liao-Troth's experience as an Account Executive Intern in the 2026 GTM Sales Internship at Insight Enterprises.",
      },
      { property: "og:title", content: "Avery Liao-Troth | AE Intern · Insight Enterprises 2026" },
      {
        property: "og:description",
        content:
          "An AI agent trained on Avery Liao-Troth's experience as an Account Executive Intern at Insight Enterprises.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Avery Liao-Troth | AE Intern · Insight Enterprises 2026" },
      { name: "description", content: "An AI-powered web application that answers questions about an Account Executive Intern's experience at Insight Enterprises." },
      { property: "og:description", content: "An AI-powered web application that answers questions about an Account Executive Intern's experience at Insight Enterprises." },
      { name: "twitter:description", content: "An AI-powered web application that answers questions about an Account Executive Intern's experience at Insight Enterprises." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d13a5612-dba0-4080-ba58-e3ba7b492a95/id-preview-56a0d570--bce6985a-038e-4292-9092-b8a04a63aa75.lovable.app-1782845609115.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d13a5612-dba0-4080-ba58-e3ba7b492a95/id-preview-56a0d570--bce6985a-038e-4292-9092-b8a04a63aa75.lovable.app-1782845609115.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[var(--harmony)]">404</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Page not found.</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-sm">{error.message}</p>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
