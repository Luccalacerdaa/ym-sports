import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { SplashScreen } from "./components/SplashScreen";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSimpleNotifications } from "./hooks/useSimpleNotifications";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Training from "./pages/Training";
import HeightProjection from "./pages/HeightProjection";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Achievements from "./pages/Achievements";
import Ranking from "./pages/Ranking";
import NewRanking from "./pages/NewRanking";
import Nutrition from "./pages/NutritionNew";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Design from "./pages/Design";
import Motivational from "./pages/Motivational";
import Settings from "./pages/Settings";
import NotificationTest from "./pages/NotificationTest";
import DashboardLayout from "./pages/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Sistema simplificado de notificações
  useSimpleNotifications();
  

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Mostrar splash screen primeiro
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="training" element={<Training />} />
              <Route path="height-projection" element={<HeightProjection />} />
              <Route path="exercises" element={<ExerciseLibrary />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="ranking" element={<NewRanking />} />
                <Route path="nutrition" element={<Nutrition />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="design" element={<Design />} />
                <Route path="motivational" element={<Motivational />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notification-test" element={<NotificationTest />} />
            </Route>
            <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
