"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const FloatingTaskCard = ({ className }: { className?: string }) => (
    <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: Math.random() * 2 + 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm ${className}`}
    >
        <p className="text-sm text-text-primary">Task Item</p>
    </motion.div>
)

const HeroSection = () => (
  <div className="relative text-center py-40 overflow-hidden bg-gradient-to-br from-gradient-indigo via-bg-primary to-bg-primary">
    <div className="absolute inset-0 z-0">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0]}}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeOut' }}
            className="w-full h-full rounded-full bg-gradient-to-r from-gradient-cyan to-gradient-violet"
        />
    </div>

    <FloatingTaskCard className="top-20 left-1/4" />
    <FloatingTaskCard className="top-1/2 right-1/4" />
    <FloatingTaskCard className="bottom-20 left-1/3" />

    <div className="relative z-10">
        <h1 className="text-7xl font-bold text-white">The Evolution of Todo</h1>
        <p className="text-2xl text-white/80 mt-4">
        A Spec-Driven Journey from Console Apps to Cloud-Native AI Systems
        </p>
        <div className="mt-8 flex justify-center gap-4">
        <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-white text-black rounded-md font-semibold">
                Get Started
            </motion.button>
        </Link>
        </div>
    </div>
  </div>
);

export default HeroSection;
