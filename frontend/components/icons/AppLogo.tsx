import React from 'react';

const AppLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4F46E5' }} />
        <stop offset="50%" style={{ stopColor: '#22D3EE' }} />
        <stop offset="100%" style={{ stopColor: '#8B5CF6' }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#logoGradient)"
      d="M62.5,35.5 C56,35.5 51,40.5 51,47 C51,47.2 51,47.3 51,47.5 C50,47.2 48.9,47 47.8,47 C42.9,47 39,50.9 39,55.8 C39,56.2 39.1,56.6 39.1,57 C38.1,56.8 37,56.6 35.8,56.6 C31.5,56.6 28,60.1 28,64.4 C28,68.7 31.5,72.2 35.8,72.2 L64.2,72.2 C69.9,72.2 74.5,67.6 74.5,61.9 C74.5,56.6 70.3,52.2 65,51.9 C64.6,42.8 62.5,35.5 62.5,35.5 Z"
    />
    <path
      fill="#A78BFA"
      d="M30 20 L35 30 L45 35 L35 40 L30 50 L25 40 L15 35 L25 30 Z"
    />
     <path
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
      d="M45 60 L55 70 L75 50"
    />
  </svg>
);

export default AppLogo;
