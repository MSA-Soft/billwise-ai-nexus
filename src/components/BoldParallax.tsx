import React, { useEffect, useRef, useState } from 'react';

interface BoldParallaxProps {
  className?: string;
}

const BoldParallax: React.FC<BoldParallaxProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollPosition = window.scrollY - rect.top;
            setScrollY(Math.max(0, scrollPosition));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Different parallax speeds for different layers
  const logoSpeed = scrollY * 0.1;
  const mainBlockSpeed = scrollY * 0.3;
  const taglineSpeed = scrollY * 0.2;
  const greenBgSpeed = scrollY * 0.5;
  const portfolioSpeed = scrollY * 0.4;
  const speechBubble1Speed = scrollY * 0.15;
  const speechBubble2Speed = scrollY * 0.25;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-screen bg-white overflow-hidden ${className}`}
    >
      {/* Base white background layer */}
      <div className="absolute inset-0 bg-white z-0" />

      {/* Top Section - Logo */}
      <div
        className="relative z-10 flex flex-col items-center pt-16 md:pt-24"
        style={{
          transform: `translateY(${logoSpeed}px)`,
        }}
      >
        {/* BOLD! Logo */}
        <div className="relative">
          <img
            src="/images/logo.png"
            alt="BOLD! CREATIVE STUDIO"
            className="h-20 md:h-32 w-auto"
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'block';
              }
            }}
          />
          <div
            className="hidden text-6xl md:text-8xl font-bold"
            style={{
              color: '#a3e635',
              WebkitTextStroke: '4px #7c3aed',
              textShadow: '2px 2px 0px #7c3aed',
            }}
          >
            BOLD!
          </div>
        </div>
        <p className="text-sm md:text-base uppercase tracking-wider text-gray-800 mt-2 font-sans">
          CREATIVE STUDIO
        </p>
      </div>

      {/* Speech Bubble Icon 1 (Top Left) */}
      <div
        className="absolute top-32 left-8 md:left-16 z-20"
        style={{
          transform: `translateY(${speechBubble1Speed}px)`,
        }}
      >
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-lime-400 bg-white flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          </div>
        </div>
      </div>

      {/* Middle Section - Main Text Block */}
      <div
        className="relative z-10 mt-16 md:mt-24 mx-auto max-w-4xl px-4"
        style={{
          transform: `translateY(${mainBlockSpeed}px)`,
        }}
      >
        <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl p-8 md:p-12 border-2 border-lime-400 shadow-lg">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase text-purple-800 mb-4 tracking-tight">
            UNFORGETTABLE BRAND IDENTITIES
          </h1>
          <p className="text-base md:text-lg text-gray-800 mb-2">
            for bold businesses that dare to be different
          </p>
          <p className="text-base md:text-lg text-gray-800">
            From strategy to social – we craft identities and content that break boundaries.
          </p>
        </div>
      </div>

      {/* Secondary Tagline */}
      <div
        className="relative z-10 mt-12 md:mt-16 text-center px-4"
        style={{
          transform: `translateY(${taglineSpeed}px)`,
        }}
      >
        <p className="text-base md:text-lg text-gray-800 mb-2">
          We've built brands that
        </p>
        <p className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase text-purple-800 tracking-tight">
          DON'T BLEND IN — THEY BREAK THROUGH.
        </p>
      </div>

      {/* Wavy Green Background Section */}
      <div
        className="relative z-5 mt-32 md:mt-48"
        style={{
          transform: `translateY(${greenBgSpeed}px)`,
        }}
      >
        {/* Wavy border */}
        <div className="relative">
          <svg
            className="w-full h-12 md:h-20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
              fill="#a3e635"
              className="w-full"
            />
          </svg>
        </div>

        {/* Green background */}
        <div className="bg-lime-400 pt-8 md:pt-16 pb-16 md:pb-24">
          {/* Speech Bubble Icon 2 (Bottom Right) */}
          <div
            className="absolute top-8 right-8 md:right-16 z-20"
            style={{
              transform: `translateY(${speechBubble2Speed}px)`,
            }}
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-lime-400 bg-white flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-purple-800">B</span>
            </div>
          </div>

          {/* Portfolio Showcase */}
          <div
            className="relative z-10 max-w-7xl mx-auto px-4"
            style={{
              transform: `translateY(${portfolioSpeed}px)`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {/* Portfolio Item 1 - Bokija */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-lg border-2 border-white overflow-hidden shadow-lg">
                  <img
                    src="/images/portfolio/bokija.jpg"
                    alt="Bokija"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-yellow-200 to-orange-200';
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-800 font-sans">Bokija</p>
                </div>
              </div>

              {/* Portfolio Item 2 - Dr. Ayesha Kanwal */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-lg border-2 border-white overflow-hidden shadow-lg">
                  <img
                    src="/images/portfolio/ayesha-kanwal.jpg"
                    alt="Dr. Ayesha Kanwal"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-pink-100 to-purple-100';
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-800 font-sans">Dr. Ayesha Kanwal</p>
                </div>
              </div>

              {/* Portfolio Item 3 - odorguard */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-lg border-2 border-white overflow-hidden shadow-lg">
                  <img
                    src="/images/portfolio/odorguard.jpg"
                    alt="odorguard"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-green-200 to-blue-200';
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-800 font-sans">odorguard</p>
                </div>
              </div>

              {/* Portfolio Item 4 - Neuvian Skincare */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-lg border-2 border-white overflow-hidden shadow-lg">
                  <img
                    src="/images/portfolio/neuvian-skincare.jpg"
                    alt="Neuvian Skincare"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-blue-100 to-indigo-100';
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-800 font-sans">Neuvian Skincare</p>
                </div>
              </div>

              {/* Portfolio Item 5 - Shireen Khoana */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-white rounded-lg border-2 border-white overflow-hidden shadow-lg">
                  <img
                    src="/images/portfolio/shireen-khoana.jpg"
                    alt="Shireen Khoana"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-amber-100 to-yellow-100';
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-0.5 bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-800 font-sans">Shireen Khoana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoldParallax;

