"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { register, isAuthenticated } from "@/lib/auth";
import AppLogo from "@/components/icons/AppLogo";
import PageWrapper from "@/components/global/PageWrapper";

import CountryCodeDropdown from "@/components/ui/CountryCodeDropdown";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !fatherName || !phoneNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      await register(email, password, fullName, fatherName, fullPhoneNumber);
      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
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
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Or{" "}
              <Link
                href="/login"
                className="font-medium text-accent-secondary hover:text-accent-primary"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>
          <form 
            onSubmit={handleRegister}
            className="mt-8 space-y-6 bg-bg-secondary border border-white/10 p-8 rounded-lg shadow-2xl"
          >
            {error && (
              <div className="rounded-md bg-red-900/50 border border-red-400 p-4">
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}
            <div className="space-y-4">
                <Input
                    type="text"
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                />
                <Input
                    type="text"
                    label="Father's Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                    placeholder="Enter your father's name"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1.5">Phone Number</label>
                    <div className="flex">
                        <CountryCodeDropdown value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
                        <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            placeholder="555-123-4567"
                            className="rounded-l-none"
                        />
                    </div>
                </div>
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
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                />
                <Input
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign Up
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
