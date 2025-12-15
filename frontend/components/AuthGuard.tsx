"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side authentication guard component.
 *
 * Protects routes by checking authentication status and redirecting
 * unauthenticated users to the login page.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // This check only runs on the client-side, after the component has mounted.
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuthed(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        // Only redirect if we're not already on the login page to avoid loops
        if (pathname !== "/login") {
          // Redirect to login page, preserving the intended destination.
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/login?redirect=${returnUrl}`);
        }
      }
    };

    // Initial check
    checkAuth();

    // Set up a listener for storage changes to handle multi-tab login/logout.
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        checkAuth();
      }
    };

    // Also listen for custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    // Listen for custom event that can be dispatched from the same tab
    window.addEventListener("auth-storage-change", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-storage-change", handleCustomStorageChange);
    };
  }, [pathname, router]);

  // While checking auth, show a loading indicator. This prevents a flash of
  // unauthenticated content and matches the server-rendered output (null or loading)
  // to prevent hydration errors.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If the user is authenticated, render the children. Otherwise, the redirect
  // is in progress, and we render nothing to prevent content from flashing.
  if (isAuthed) {
    return <>{children}</>;
  }

  return null;
}