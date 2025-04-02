
import React, { Suspense } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
}

const LazyLoad: React.FC<LazyLoadProps> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-guys-primary"></div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyLoad;
