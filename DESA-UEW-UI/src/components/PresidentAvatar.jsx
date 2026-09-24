import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, UserCheck, Sparkles } from 'lucide-react';

export default function PresidentAvatar({
  imageSrc,
  fallbackSvg = '/images/founder.svg',
  label = '[FIRST PRESIDENT / FOUNDER IMAGE]',
  name = '[Founder\'s Name]',
  title = 'Founder / First President',
  isCurrent = false,
  size = 'large'
}) {
  const [currentSrc, setCurrentSrc] = useState(imageSrc || fallbackSvg);
  const [isLoaded, setIsLoaded] = useState(true);

  const isHeroSize = size === 'large' || size === 'xl' || size === 'hero';

  const dimensionClass = size === 'xl' || size === 'hero'
    ? 'w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 lg:w-88 lg:h-88'
    : size === 'large'
    ? 'w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80'
    : 'w-28 h-28 md:w-36 md:h-36';

  const handleError = () => {
    if (currentSrc !== fallbackSvg) {
      setCurrentSrc(fallbackSvg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center select-none"
    >
      {/* Visual Frame with Official UEW Deeper Crimson & Navy Double Rings & Glow */}
      <div className="relative group">
        {/* Ambient background glow in deeper red */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-uew-red via-red-700 to-uew-red rounded-full opacity-35 group-hover:opacity-75 blur-md transition duration-500 animate-pulse-slow"></div>

        {/* Circular Frame with UEW Red outer border & crisp white inner ring */}
        <div className={`relative ${dimensionClass} rounded-full ${isHeroSize ? 'p-2 md:p-2.5 shadow-2xl' : 'p-1.5 shadow-avatar-frame'} bg-gradient-to-b from-uew-red via-[#881014] to-[#600A0D] overflow-hidden`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-uew-navy relative border-2 md:border-3 border-white">
            <img
              src={currentSrc}
              alt={name}
              onError={handleError}
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
                !isLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {/* Fallback while loading */}
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-uew-navy text-white p-4">
                <Sparkles className="w-8 h-8 animate-spin text-uew-red" />
                <span className="text-[10px] uppercase font-semibold tracking-wider mt-1 text-slate-200">Loading...</span>
              </div>
            )}

            {/* Subtle gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Floating emblem badge in UEW Navy with Red accent */}
        <div className={`absolute ${
          isHeroSize
            ? '-bottom-3 right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 p-2 md:p-2.5 shadow-lg'
            : '-bottom-2 right-1/2 translate-x-1/2 md:translate-x-0 md:right-3 p-1.5 shadow-md'
        } bg-uew-navy border-2 border-uew-red text-white rounded-full flex items-center justify-center`}>
          {isCurrent ? (
            <UserCheck className={isHeroSize ? 'w-5 h-5 md:w-6 md:h-6 text-uew-red' : 'w-4 h-4 md:w-5 md:h-5 text-uew-red'} />
          ) : (
            <Award className={isHeroSize ? 'w-5 h-5 md:w-6 md:h-6 text-uew-red' : 'w-4 h-4 md:w-5 md:h-5 text-uew-red'} />
          )}
        </div>
      </div>

      {/* Label Badge */}
      <div className={`mt-5 inline-flex items-center gap-1.5 ${
        isHeroSize ? 'px-4 py-1 text-xs' : 'px-3.5 py-1 text-[11px]'
      } rounded-full bg-red-50 border border-uew-red/30 font-bold tracking-wider text-uew-red uppercase shadow-xs`}>
        <span>{label}</span>
      </div>

      {/* Name and Official Title */}
      <div className="mt-2.5 space-y-0.5">
        <h3 className={`${
          isHeroSize ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
        } font-extrabold tracking-tight text-uew-navy font-['Plus_Jakarta_Sans']`}>
          {name}
        </h3>
        <p className={`${
          isHeroSize ? 'text-xs md:text-sm' : 'text-xs md:text-sm'
        } font-bold tracking-wider text-uew-red uppercase`}>
          {title}
        </p>
      </div>
    </motion.div>
  );
}
