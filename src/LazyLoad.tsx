
import React, { Suspense } from "react";
import { useSettings } from "@/contexts/settings";

interface LazyLoadProps {
  children: React.ReactNode;
}

const LazyLoad: React.FC<LazyLoadProps> = ({ children }) => {
  const { reduceAnimations } = useSettings();
  
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className={`${reduceAnimations ? '' : 'animate-spin'} rounded-full h-12 w-12 border-t-2 border-b-2 border-guys-primary`}></div>
          <p className="ml-3 text-guys-primary font-medium">Loading...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyLoad;
