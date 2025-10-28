import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUpdateNotification } from "./hooks/useUpdateNotification";
import { useEventNotifications } from "./hooks/useEventNotifications";
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
import DashboardLayout from "./pages/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Hook para detectar e notificar sobre atualizações do PWA
  useUpdateNotification();
  
  // Hook para notificar sobre eventos próximos
  useEventNotifications();

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
              <Route path="ranking" element={<Ranking />} />
              <Route path="nutrition" element={<div className="p-6">Nutrição em construção</div>} />
              <Route path="settings" element={<div className="p-6">Configurações em construção</div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
