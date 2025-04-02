
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth";
import { NotificationProvider } from "./contexts/notification";
import { SettingsProvider } from "./contexts/settings";
import { lazy, useState } from "react";
import LazyLoad from "./components/LazyLoad";
import MobileNavBar from "./components/MobileNavBar";
import { useIsMobile } from "./hooks/use-mobile";

// Lazy load components to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EnhancedPostDetail = lazy(() => import("./pages/EnhancedPostDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Admin = lazy(() => import("./pages/Admin"));

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Route that redirects to home if already authenticated
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LazyLoad><Index /></LazyLoad>} />
      <Route path="/auth" element={<AuthRoute><LazyLoad><Auth /></LazyLoad></AuthRoute>} />
      <Route path="/home" element={<ProtectedRoute><LazyLoad><Home /></LazyLoad></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><LazyLoad><Profile /></LazyLoad></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><LazyLoad><EditProfile /></LazyLoad></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><LazyLoad><Messages /></LazyLoad></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><LazyLoad><CreatePost /></LazyLoad></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><LazyLoad><EnhancedPostDetail /></LazyLoad></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><LazyLoad><Notifications /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><LazyLoad><Admin /></LazyLoad></AdminRoute>} />
      <Route path="*" element={<LazyLoad><NotFound /></LazyLoad>} />
    </Routes>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <AppRoutes />
      {isAuthenticated && <MobileNavBar />}
    </>
  );
};

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
