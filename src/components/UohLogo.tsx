import React from 'react';
import uohLogoImg from '../assets/images/uoh_official_logo_1785136709704.jpg';

interface UohLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const UohLogo: React.FC<UohLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official UOH Circular Crest Image */}
      <img
        src={uohLogoImg}
        alt="University of Haripur Official Logo"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover border-2 border-white/80 shadow-md transition-transform hover:scale-105 duration-300"
      />

      {/* Optional University Header Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-serif">
            The University of Haripur
          </span>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300 italic tracking-wide">
            Restoring Hope; Building Community
          </span>
        </div>
      )}
    </div>
  );
};

