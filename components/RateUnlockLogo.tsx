// RateUnlock Logo Component
// Gradient Pulse Design - Modern, Tech-Forward, Innovative
// December 24, 2025

'use client';

import React from 'react';

interface RateUnlockLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function RateUnlockLogo({ 
  size = 'md', 
  showText = true,
  className = '' 
}: RateUnlockLogoProps) {
  
  const sizes = {
    sm: { icon: 32, text: 18, height: 32 },
    md: { icon: 40, text: 22, height: 40 },
    lg: { icon: 56, text: 28, height: 56 },
    xl: { icon: 72, text: 36, height: 72 },
  };
  
  const { icon, text, height } = sizes[size];
  
  // Icon only
  if (!showText) {
    return (
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="gradPulseIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="50%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
          <linearGradient id="gradPulseRev" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="none" stroke="url(#gradPulseIcon)" strokeWidth="2.5"/>
        <circle cx="32" cy="32" r="24" fill="none" stroke="url(#gradPulseRev)" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5"/>
        <rect x="20" y="28" width="24" height="20" rx="4" fill="url(#gradPulseIcon)"/>
        <path d="M25 28 L25 22 Q25 14 32 14 Q39 14 39 22 L39 28" fill="none" stroke="url(#gradPulseIcon)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="36" r="3" fill="#0f172a"/>
        <rect x="30.5" y="38" width="3" height="5" rx="1" fill="#0f172a"/>
      </svg>
    );
  }
  
  // Full logo with text
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradPulseFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="50%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
          <linearGradient id="gradPulseRevFull" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="29" fill="none" stroke="url(#gradPulseFull)" strokeWidth="2.5"/>
        <circle cx="32" cy="32" r="23" fill="none" stroke="url(#gradPulseRevFull)" strokeWidth="1.5" strokeDasharray="5 2.5" opacity="0.5"/>
        <rect x="20" y="27" width="24" height="20" rx="4" fill="url(#gradPulseFull)"/>
        <path d="M25 27 L25 21 Q25 13 32 13 Q39 13 39 21 L39 27" fill="none" stroke="url(#gradPulseFull)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="35" r="3" fill="#0f172a"/>
        <rect x="30.5" y="37" width="3" height="5" rx="1" fill="#0f172a"/>
      </svg>
      
      <div className="hidden sm:flex items-baseline">
        <span 
          className="font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent"
          style={{ fontSize: text }}
        >
          Rate
        </span>
        <span 
          className="font-medium text-white"
          style={{ fontSize: text }}
        >
          Unlock
        </span>
      </div>
    </div>
  );
}

// Animated version with pulsing rings
export function RateUnlockLogoAnimated({ 
  size = 'lg',
  className = '' 
}: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  
  const sizes = {
    sm: 40,
    md: 56,
    lg: 80,
    xl: 120,
  };
  
  const iconSize = sizes[size];
  
  return (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gradPulseAnim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="50%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="gradPulseRevAnim" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
      </defs>
      
      {/* Outer ring with pulse animation */}
      <circle 
        cx="32" cy="32" r="30" 
        fill="none" 
        stroke="url(#gradPulseAnim)" 
        strokeWidth="2"
        className="animate-pulse"
      />
      
      {/* Rotating dashed ring */}
      <circle 
        cx="32" cy="32" r="24" 
        fill="none" 
        stroke="url(#gradPulseRevAnim)" 
        strokeWidth="1.5" 
        strokeDasharray="6 3" 
        opacity="0.6"
        style={{ 
          animation: 'spin 20s linear infinite',
          transformOrigin: 'center'
        }}
      />
      
      {/* Lock body */}
      <rect x="20" y="28" width="24" height="20" rx="4" fill="url(#gradPulseAnim)"/>
      
      {/* Shackle */}
      <path 
        d="M25 28 L25 22 Q25 14 32 14 Q39 14 39 22 L39 28" 
        fill="none" 
        stroke="url(#gradPulseAnim)" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      {/* Keyhole */}
      <circle cx="32" cy="36" r="3" fill="#0f172a"/>
      <rect x="30.5" y="38" width="3" height="5" rx="1" fill="#0f172a"/>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
