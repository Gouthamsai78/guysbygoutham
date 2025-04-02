
import React from 'react';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  adContent?: React.ReactNode;
  position?: 'top' | 'bottom'; // New position prop
}

const AdBanner: React.FC<AdBannerProps> = ({
  className,
  variant = 'primary',
  size = 'medium',
  label = 'Advertisement',
  adContent,
  position = 'bottom' // Default position is now bottom
}) => {
  // Define color schemes based on variant
  const colorSchemes = {
    primary: 'from-pink-100 to-purple-100 text-pink-600',
    secondary: 'from-blue-100 to-green-100 text-blue-600',
    tertiary: 'from-amber-100 to-orange-100 text-amber-600',
  };
  
  // Define heights based on size
  const heights = {
    small: 'h-12',
    medium: 'h-16',
    large: 'h-24',
  };

  // Define positioning classes
  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0',
  };

  return (
    <div className={cn(
      "bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center",
      position === 'bottom' && "fixed left-0 right-0 bottom-0 z-10",
      className
    )}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className={cn(
        `bg-gradient-to-r flex items-center justify-center rounded`,
        colorSchemes[variant],
        heights[size]
      )}>
        {adContent || <span className="font-medium">Your Ad Here</span>}
      </div>
    </div>
  );
};

export default AdBanner;
