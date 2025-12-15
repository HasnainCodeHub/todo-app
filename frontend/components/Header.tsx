"use client";

import { useRouter } from "next/navigation";
import { clearAuthToken, getCurrentUser, isAuthenticated } from "@/lib/auth";
import { useEffect, useState } from "react";

/**
 * Application header with user info and logout button.
 */
export default function Header() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Hydration Safety ---
  // On the server or during the initial client render, we cannot safely access
  // localStorage. By returning null here, we ensure the server-rendered output
  // matches the initial client render, preventing a hydration mismatch.
  if (!isClient) {
    return null;
  }

  // --- Client-Side Logic ---
  // Now that we are on the client, we can safely check for authentication.
  const authenticated = isAuthenticated();
  const user = getCurrentUser(); // Safely reads from localStorage

  const handleLogout = () => {
    clearAuthToken(); // Clears localStorage
    router.push("/"); // Redirects to the home page
  };

  if (!authenticated) {
    return null;
  }

  return (
    <header className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Todo App</h1>
        <p className="text-gray-600 mt-2">Manage your tasks efficiently</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {/* This is robust; uses optional properties from the user object */}
            {user?.name || user?.email || "User"}
          </p>
          {user?.email && user?.name && (
            <p className="text-xs text-gray-500">{user.email}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
