import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUpdateNotification } from "./hooks/useUpdateNotification";
import { useEventNotifications } from "./hooks/useEventNotifications";
import { useAutoNotificationPermission } from "./hooks/useAutoNotificationPermission";
import { useScheduledNotifications } from "./hooks/useScheduledNotifications";
import { useDailyNotifications } from "./hooks/useDailyNotifications";
import { useRobustNotifications } from "./hooks/useRobustNotifications";
import { useBackgroundNotifications } from "./hooks/useBackgroundNotifications";
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
import Nutrition from "./pages/Nutrition";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Design from "./pages/Design";
import Motivational from "./pages/Motivational";
import Settings from "./pages/Settings";
import NotificationSchedulePage from "./pages/NotificationSchedulePage";
import DashboardLayout from "./pages/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Hook para detectar e notificar sobre atualizações do PWA
  useUpdateNotification();
  
  // Hook para notificar sobre eventos próximos
  useEventNotifications();
  
  // Hook para solicitar permissão de notificação automaticamente
  useAutoNotificationPermission();
  
  // Hook para notificações diárias motivacionais e do app
  useDailyNotifications();
  
  // Hook para sistema robusto de notificações (novo)
  useRobustNotifications();
  
  // Hook para notificações em segundo plano (funciona com app fechado)
  useBackgroundNotifications();
  

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
                <Route path="notifications-schedule" element={<NotificationSchedulePage />} />
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
