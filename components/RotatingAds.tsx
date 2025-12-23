// CR AudioViz AI - Rotating Ads Component
// Cross-promotion for CR AudioViz AI products
// December 23, 2025

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ad {
  id: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
  href: string;
  color: string;
  badge?: string;
}

const CR_PRODUCTS: Ad[] = [
  {
    id: 'javari',
    title: 'Javari AI Assistant',
    description: 'Your personal AI assistant for creative projects, coding, writing, and more.',
    icon: '🤖',
    cta: 'Try Javari Free',
    href: 'https://craudiovizai.com/javari',
    color: 'from-purple-600 to-indigo-600',
    badge: 'NEW',
  },
  {
    id: 'video-creator',
    title: 'AI Video Creator',
    description: 'Create stunning videos with AI. Text-to-video, editing, effects, and more.',
    icon: '🎬',
    cta: 'Create Videos',
    href: 'https://craudiovizai.com/tools/video',
    color: 'from-red-600 to-pink-600',
  },
  {
    id: 'image-gen',
    title: 'AI Image Generator',
    description: 'Generate beautiful images from text. Logos, art, photos, anything you imagine.',
    icon: '🎨',
    cta: 'Generate Images',
    href: 'https://craudiovizai.com/tools/image',
    color: 'from-cyan-600 to-teal-600',
    badge: 'Popular',
  },
  {
    id: 'audio-tools',
    title: 'AI Audio Suite',
    description: 'Voice cloning, music generation, podcast editing, and audio enhancement.',
    icon: '🎵',
    cta: 'Explore Audio',
    href: 'https://craudiovizai.com/tools/audio',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'writing',
    title: 'AI Writing Tools',
    description: 'Blog posts, marketing copy, emails, scripts — write anything 10x faster.',
    icon: '✍️',
    cta: 'Start Writing',
    href: 'https://craudiovizai.com/tools/writing',
    color: 'from-emerald-600 to-green-600',
  },
  {
    id: 'realtor-platform',
    title: 'Realtor Platform',
    description: 'CRM, lead management, property listings, and marketing tools for real estate pros.',
    icon: '🏠',
    cta: 'For Realtors',
    href: 'https://crrealtorplatform.com',
    color: 'from-blue-600 to-indigo-600',
    badge: 'For Pros',
  },
  {
    id: 'games',
    title: '1,200+ Free Games',
    description: 'Action, puzzle, strategy, sports — play instantly, no download required.',
    icon: '🎮',
    cta: 'Play Now',
    href: 'https://craudiovizai.com/games',
    color: 'from-violet-600 to-purple-600',
  },
  {
    id: 'disney-tracker',
    title: 'Disney Deal Tracker',
    description: 'Find the best Disney vacation deals, ticket prices, and hotel discounts.',
    icon: '🏰',
    cta: 'Find Deals',
    href: 'https://disneydealtracker.com',
    color: 'from-pink-600 to-rose-600',
  },
  {
    id: 'crav-cards',
    title: 'CravCards',
    description: 'AI-powered credit card recommendations based on your spending habits.',
    icon: '💳',
    cta: 'Find Best Card',
    href: 'https://cravcards.com',
    color: 'from-slate-600 to-zinc-600',
  },
  {
    id: 'social-impact',
    title: 'Social Impact Tools',
    description: 'Free tools for veterans, first responders, animal rescues, and faith communities.',
    icon: '❤️',
    cta: 'Learn More',
    href: 'https://craudiovizai.com/social-impact',
    color: 'from-rose-600 to-red-600',
    badge: 'Free',
  },
  {
    id: 'business-tools',
    title: 'Business Suite',
    description: 'Invoicing, contracts, proposals, presentations — run your business with AI.',
    icon: '💼',
    cta: 'For Business',
    href: 'https://craudiovizai.com/tools/business',
    color: 'from-slate-600 to-gray-600',
  },
  {
    id: 'code-tools',
    title: 'AI Code Assistant',
    description: 'Write, debug, and optimize code in any language. Your AI pair programmer.',
    icon: '👨‍💻',
    cta: 'Code Faster',
    href: 'https://craudiovizai.com/tools/code',
    color: 'from-green-600 to-emerald-600',
  },
];

interface RotatingAdsProps {
  variant?: 'banner' | 'sidebar' | 'card' | 'inline';
  interval?: number;
  showMultiple?: number;
  category?: string;
}

export default function RotatingAds({ 
  variant = 'banner', 
  interval = 8000,
  showMultiple = 1,
  category
}: RotatingAdsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Filter by category if specified
  const ads = category 
    ? CR_PRODUCTS.filter(p => p.id.includes(category))
    : CR_PRODUCTS;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + showMultiple) % ads.length);
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [ads.length, interval, showMultiple]);

  const currentAds = [];
  for (let i = 0; i < showMultiple; i++) {
    currentAds.push(ads[(currentIndex + i) % ads.length]);
  }

  // Banner variant - full width
  if (variant === 'banner') {
    const ad = currentAds[0];
    return (
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <a 
          href={ad.href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`block bg-gradient-to-r ${ad.color} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{ad.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                  {ad.badge && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {ad.badge}
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm">{ad.description}</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap">
              {ad.cta} →
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2 text-right">Powered by CR AudioViz AI</p>
        </a>
      </div>
    );
  }

  // Sidebar variant - vertical stack
  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        <p className="text-slate-500 text-xs uppercase tracking-wider">From CR AudioViz AI</p>
        {currentAds.map((ad) => (
          <a
            key={ad.id}
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`block bg-gradient-to-br ${ad.color} rounded-xl p-4 hover:scale-[1.02] transition-all ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{ad.icon}</span>
              <div>
                <h4 className="text-white font-bold text-sm">{ad.title}</h4>
                <p className="text-white/70 text-xs mt-1">{ad.description}</p>
                <p className="text-white/90 text-xs font-medium mt-2">{ad.cta} →</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  // Card variant - for grid layouts
  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${showMultiple} gap-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {currentAds.map((ad) => (
          <a
            key={ad.id}
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`block bg-gradient-to-br ${ad.color} rounded-xl p-5 hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{ad.icon}</span>
              {ad.badge && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {ad.badge}
                </span>
              )}
            </div>
            <h4 className="text-white font-bold">{ad.title}</h4>
            <p className="text-white/70 text-sm mt-1">{ad.description}</p>
            <p className="text-white font-medium text-sm mt-3">{ad.cta} →</p>
          </a>
        ))}
      </div>
    );
  }

  // Inline variant - subtle text link
  if (variant === 'inline') {
    const ad = currentAds[0];
    return (
      <div className={`bg-slate-800/50 rounded-lg p-3 border border-slate-700 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <a
          href={ad.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-sm"
        >
          <span className="text-xl">{ad.icon}</span>
          <span className="text-slate-300">
            <span className="font-medium text-white">{ad.title}:</span> {ad.description}
          </span>
          <span className="text-emerald-400 font-medium whitespace-nowrap">{ad.cta} →</span>
        </a>
      </div>
    );
  }

  return null;
}

// Static ad component for specific products
export function StaticAd({ productId }: { productId: string }) {
  const ad = CR_PRODUCTS.find(p => p.id === productId);
  if (!ad) return null;

  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-gradient-to-br ${ad.color} rounded-xl p-5 hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{ad.icon}</span>
        {ad.badge && (
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            {ad.badge}
          </span>
        )}
      </div>
      <h4 className="text-white font-bold">{ad.title}</h4>
      <p className="text-white/70 text-sm mt-1">{ad.description}</p>
      <p className="text-white font-medium text-sm mt-3">{ad.cta} →</p>
    </a>
  );
}

// Product showcase grid
export function ProductShowcase() {
  return (
    <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">More from CR AudioViz AI</h2>
        <p className="text-slate-400">60+ AI-powered tools for creators, businesses, and everyone</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CR_PRODUCTS.slice(0, 8).map((product) => (
          <a
            key={product.id}
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-800/50 transition-all text-center group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{product.icon}</span>
            <h4 className="text-white font-medium text-sm">{product.title}</h4>
          </a>
        ))}
      </div>
      <div className="mt-6 text-center">
        <a
          href="https://craudiovizai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Explore All 60+ Tools →
        </a>
      </div>
    </div>
  );
}
