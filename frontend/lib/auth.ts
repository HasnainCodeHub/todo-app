/**
 * Client-side authentication utilities.
 * These functions are safe to use in client components and will not run on the server.
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

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
 * Stores the authentication token and user object in localStorage.
 * @param token - The JWT token.
 * @param user - The user object to store.
 */
export function setAuthToken(token: string, user: Record<string, unknown>): void {
  if (isBrowser()) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Dispatch a custom event to notify AuthGuard in the same tab
    window.dispatchEvent(new Event("auth-storage-change"));
  }
}

/**
 * Removes the authentication token and user object from localStorage.
 */
export function clearAuthToken(): void {
  if (isBrowser()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Retrieves the current user's object from localStorage.
 * @returns The user object or null if not found.
 */
export function getCurrentUser(): Record<string, unknown> | null {
  if (!isBrowser()) return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
}

// NOTE: API call functions are kept for now as per instructions,
// but in a larger refactor, these would move to a dedicated `lib/api.ts`.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001/api";

export async function register(
  email: string,
  password: string,
  fullName: string,
  fatherName: string,
  phoneNumber: string
) {
  // Strip non-digit characters (e.g., '+' from country code) for backend validation
  const sanitizedPhone = phoneNumber.replace(/\D/g, "");

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      father_name: fatherName,
      phone_number: sanitizedPhone,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed.");
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
    if (!payload) {
        throw new Error('Invalid token format');
    }

    // Store the token and user object in localStorage
    setAuthToken(accessToken, payload);
    
    return data;
}