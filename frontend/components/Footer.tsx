import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-24">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-text-secondary">"Designed with Spec-Driven Intelligence"</p>
        <p className="text-xs text-text-secondary/50 mt-2">The Evolution of Todo</p>
      </div>
    </footer>
  );
};

export default Footer;
