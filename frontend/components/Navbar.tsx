"use client";

import React, { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { clearAuthToken, isAuthenticated } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import Modal from "./ui/Modal";
import AppLogo from './icons/AppLogo';
import { LayoutDashboard, MessageCircle, Share2, Rocket } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isProfileCardVisible, setIsProfileCardVisible] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0.1, 0.8]);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleAuthChange = () => {
        setAuthenticated(isAuthenticated());
        if (isAuthenticated()) {
            fetchUserProfile().then(setUser).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch user profile."));
        } else {
            setUser(null); // Clear user data on logout
        }
    };

    handleAuthChange(); // Initial check

    const handleClickOutside = (event: MouseEvent) => {
      if (profileCardRef.current && !profileCardRef.current.contains(event.target as Node)) {
        setIsProfileCardVisible(false);
      }
    };

    window.addEventListener("auth-storage-change", handleAuthChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("auth-storage-change", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    clearAuthToken();
    setAuthenticated(false);
    router.push("/");
  };

  if (!isClient) {
    return null; // Still return null on server to prevent hydration mismatch
  }

  return (
    <>
      <motion.header
        style={{ '--bg-opacity': bgOpacity } as CSSProperties}
        className="sticky top-0 z-50 bg-bg-primary/[var(--bg-opacity)] backdrop-blur-lg"
      >
        <nav className="container mx-auto px-4 py-3 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AppLogo className="w-8 h-8" />
              <Link href="/" className="text-xl font-bold text-text-primary hidden md:inline">The Evolution of Todo</Link>
            </div>
            <div className="hidden md:flex gap-4 md:gap-6 items-center">
              <Link href="/dashboard" className="text-text-secondary hover:text-text-primary flex items-center gap-2"><LayoutDashboard size={18}/> Tasks</Link>
              <Link href="/chatbot" className="text-text-secondary hover:text-text-primary flex items-center gap-2"><MessageCircle size={18}/> Chatbot</Link>
              <Link href="/architecture" className="text-text-secondary hover:text-text-primary flex items-center gap-2"><Share2 size={18}/> Architecture</Link>
              <Link href="/deployment" className="text-text-secondary hover:text-text-primary flex items-center gap-2"><Rocket size={18}/> Deployment</Link>
            </div>
            {authenticated ? (
              <div className="relative flex items-center gap-4" ref={profileCardRef}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsProfileCardVisible(!isProfileCardVisible)} className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" />
                  {isProfileCardVisible && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-bg-secondary border border-white/10 rounded-lg shadow-lg z-10">
                      <div className="p-4 border-b border-white/20">
                      {error ? <p className="text-sm text-red-500">{error}</p> : user ? (
                          <>
                          <p className="text-md font-medium text-text-primary">{user.full_name as string}</p>
                          <p className="text-sm text-text-secondary">{user.email as string}</p>
                          </>
                      ) : <p className="text-sm text-text-secondary">Loading...</p>}
                      </div>
                      {user &&
                      <div className="p-4 text-sm text-text-secondary space-y-1">
                          <p><span className="font-semibold">Father:</span> {user.father_name as string}</p>
                          <p><span className="font-semibold">Phone:</span> {user.phone_number as string}</p>
                      </div>
                      }
                      <div className="p-2">
                           <button onClick={() => setIsLogoutModalOpen(true)} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-md">
                              Sign Out
                          </button>
                      </div>
                  </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-text-primary">
                        Login
                    </motion.button>
                </Link>
                <Link href="/register">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-md">
                        Sign Up
                    </motion.button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </motion.header>
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} title="Confirm Sign Out">
        <p>Are you sure you want to sign out?</p>
      </Modal>
    </>
  );
};

export default Navbar;
