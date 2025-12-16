"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// SVG Icons as components
const LinkedInIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const RepositoryIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

// Skill pills data
const skills = [
  "Physical AI",
  "Humanoid Robotics",
  "Agentic AI",
  "RAG Systems",
  "FastAPI",
  "OpenAI Agent SDK",
  "Gemini",
  "Docusaurus",
  "React",
  "LLM Systems",
];

// Social links data
const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/hasnain-ali-developer/",
    icon: LinkedInIcon,
    hoverColor: "hover:bg-[#0077B5]/20 hover:border-[#0077B5]/50",
  },
  {
    name: "GitHub",
    url: "https://github.com/HasnainCodeHub",
    icon: GitHubIcon,
    hoverColor: "hover:bg-white/20 hover:border-white/50",
  },
  {
    name: "Project Repo",
    url: "https://github.com/HasnainCodeHub/todo-app",
    icon: RepositoryIcon,
    hoverColor: "hover:bg-accent-primary/20 hover:border-accent-primary/50",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const skillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const DeveloperSection = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gradient-indigo/20 via-gradient-violet/10 to-gradient-cyan/20 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Meet the Developer
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" />
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/20"
        >
          {/* Gradient border glow effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-primary/20 via-transparent to-accent-secondary/20 rounded-2xl -z-10 blur-sm" />

          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Profile Image */}
            <motion.div
              variants={itemVariants}
              className="relative flex-shrink-0"
            >
              {/* Gradient ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary via-gradient-violet to-accent-secondary rounded-full blur-sm opacity-75" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src="/image.jpg"
                  alt="Hasnain Ali - Full-Stack Developer & AI Engineer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-bg-primary shadow-lg shadow-green-500/50" />
            </motion.div>

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.h3
                variants={itemVariants}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                Hasnain Ali
              </motion.h3>

              <motion.p
                variants={itemVariants}
                className="text-accent-primary font-medium mb-4 text-sm sm:text-base"
              >
                Full-Stack Developer · AI Engineer · Robotics Enthusiast
              </motion.p>

              <motion.p
                variants={itemVariants}
                className="text-text-secondary leading-relaxed text-sm sm:text-base max-w-2xl"
              >
                Passionate about building intelligent systems that bridge the gap
                between artificial intelligence and physical robotics.
                Specializing in agentic AI, RAG-powered applications, and modern
                full-stack development with a focus on creating educational
                resources for the next generation of robotics engineers.
              </motion.p>
            </div>
          </div>

          {/* Skills Section */}
          <motion.div variants={itemVariants} className="mt-8">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 text-center lg:text-left">
              Technologies & Expertise
            </h4>
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  variants={skillVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(103, 232, 249, 0.3)",
                  }}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-text-primary bg-white/5 border border-white/10 rounded-full backdrop-blur-sm transition-colors duration-200 hover:border-accent-primary/50 hover:text-accent-primary cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/5 border border-white/20 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-transparent ${link.hoverColor}`}
                  aria-label={`Visit ${link.name}`}
                >
                  <link.icon />
                  <span>{link.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DeveloperSection;
