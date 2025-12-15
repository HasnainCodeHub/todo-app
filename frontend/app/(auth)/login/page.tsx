"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { login, isAuthenticated } from "@/lib/auth";
import AppLogo from "@/components/icons/AppLogo";
import PageWrapper from "@/components/global/PageWrapper";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please sign in to continue.");
    }
  }, [router, searchParams]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link href="/" className="flex justify-center items-center gap-4">
              <AppLogo className="h-12 w-12" />
              <h1 className="text-4xl font-bold text-text-primary">The Evolution of Todo</h1>
            </Link>
            <h2 className="mt-6 text-center text-2xl font-semibold text-text-primary">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Or{" "}
              <Link href="/register" className="font-medium text-accent-secondary hover:text-accent-primary">
                create a new account
              </Link>
            </p>
          </div>
          <form 
            onSubmit={handleLogin}
            className="mt-8 space-y-6 bg-bg-secondary border border-white/10 p-8 rounded-lg shadow-2xl"
          >
            {successMessage && (
              <div className="rounded-md bg-green-900/50 border border-green-400 p-4">
                <div className="text-sm text-green-300">{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-900/50 border border-red-400 p-4">
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}
            <div className="space-y-4">
                <Input
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                />
                <Input
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}