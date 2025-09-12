import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { firebase, signInWithGoogle, ensureSignedIn } from "@/lib/firebase";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-900/70 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500" />
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">
                Smart Campus Hub
              </div>
              <div className="text-xs text-muted-foreground">
                Wellbeing • Safety • Sustainability
              </div>
            </div>
          </a>
          <div className="flex items-center gap-2">
            {!firebase.isEnabled && (
              <span className="text-xs text-red-600 dark:text-red-400 mr-2">
                Firebase not configured
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => ensureSignedIn()}
              className="hidden sm:inline-flex"
            >
              Guest
            </Button>
            <Button onClick={() => signInWithGoogle()}>Sign in</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Smart Campus Hub</span>
          <span>Built with React + Firebase</span>
        </div>
      </footer>
    </div>
  );
}
