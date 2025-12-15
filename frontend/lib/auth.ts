/**
 * Client-side authentication utilities.
 * These functions are safe to use in client components and will not run on the server.
 */

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

/**
 * Checks if the code is running in a browser environment.
 */
const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string or null if not found or not in a browser.
 */
export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Stores the authentication token and user ID in localStorage.
 * @param token - The JWT token.
 * @param userId - The ID of the authenticated user.
 */
export function setAuthToken(token: string, userId: string): void {
  if (isBrowser()) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, userId);
    // Dispatch a custom event to notify AuthGuard in the same tab
    window.dispatchEvent(new Event("auth-storage-change"));
  }
}

/**
 * Removes the authentication token and user ID from localStorage.
 */
export function clearAuthToken(): void {
  if (isBrowser()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    // Dispatch a custom event to notify AuthGuard in the same tab
    window.dispatchEvent(new Event("auth-storage-change"));
  }
}

/**
 * Checks if a user is authenticated by verifying the presence of a token.
 * @returns True if a token exists, false otherwise.
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Decodes a JWT token to extract the payload.
 * Note: This does not verify the signature, it only decodes the payload.
 * @param token - The JWT token string.
 * @returns The decoded payload or null if decoding fails.
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Retrieves the current user's ID from localStorage.
 * This is a simplified version; a real app might store more user info.
 * @returns An object with the user's ID or null.
 */
export function getCurrentUser(): { id: string | null; name?: string; email?: string } {
  if (!isBrowser()) return { id: null };
  // In a real app, you might parse a user object from localStorage
  return {
    id: localStorage.getItem(USER_ID_KEY),
  };
}

// NOTE: API call functions are kept for now as per instructions,
// but in a larger refactor, these would move to a dedicated `lib/api.ts`.
const API_BASE_URL = "http://127.0.0.1:8001/api";

export async function register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed.');
    }
    return response.json();
}

export async function login(email: string, password: string) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed.');
    }

    const data = await response.json();
    
    // Extract the access_token from the response
    const accessToken = data.access_token;
    if (!accessToken) {
        throw new Error('No access token received from server');
    }

    // Decode the JWT token to extract the user_id
    const payload = decodeJWT(accessToken);
    if (!payload || !payload.sub) {
        throw new Error('Invalid token format');
    }

    // Store the token and user_id in localStorage
    setAuthToken(accessToken, payload.sub);
    
    return data;
}