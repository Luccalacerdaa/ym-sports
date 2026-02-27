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
import SubscriptionGate from "./components/SubscriptionGate";
import Plans from "./pages/Plans";
import { useSimpleNotifications } from "./hooks/useSimpleNotifications";
import { useDailyNotifications } from "./hooks/useDailyNotifications";
import { useEventNotifications } from "./hooks/useEventNotifications";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Training from "./pages/Training";
import HeightProjection from "./pages/HeightProjection";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Achievements from "./pages/Achievements";
import Rankings from "./pages/Rankings";
import Nutrition from "./pages/NutritionNew";
import NutritionPlanView from "./pages/NutritionPlanView";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Design from "./pages/Design";
import Motivational from "./pages/Motivational";
import Settings from "./pages/Settings";
import NotificationTest from "./pages/NotificationTest";
import AdminRankings from "./pages/AdminRankings";
import DashboardLayout from "./pages/DashboardLayout";
import NotFound from "./pages/NotFound";
import InstallGuide from "./pages/InstallGuide";
import Tutorials from "./pages/Tutorials";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckoutGateway from "./pages/CheckoutGateway";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Sistema de notificações
  useSimpleNotifications(); // Registra Service Worker e permissões
  useDailyNotifications();  // Notificações agendadas diárias
  useEventNotifications();  // Lembretes de eventos do calendário

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
            <Route path="/install-guide" element={<InstallGuide />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/checkout" element={<CheckoutGateway />} />
            <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DashboardLayout />
                </SubscriptionGate>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="training" element={<Training />} />
              <Route path="height-projection" element={<HeightProjection />} />
              <Route path="exercises" element={<ExerciseLibrary />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="ranking" element={<Rankings />} />
                <Route path="nutrition" element={<Nutrition />} />
                <Route path="nutrition/:planId" element={<NutritionPlanView />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="design" element={<Design />} />
                <Route path="motivational" element={<Motivational />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notification-test" element={<NotificationTest />} />
                <Route path="admin-rankings" element={<AdminRankings />} />
                <Route path="tutorials" element={<Tutorials />} />
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
