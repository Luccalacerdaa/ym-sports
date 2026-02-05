import { Outlet } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { PWAInstallTooltip } from "@/components/PWAInstallTooltip";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import ChatbotButton from "@/components/ChatbotButton";
import { usePWAInstallPrompt } from "@/hooks/usePWAInstallPrompt";

export default function DashboardLayout() {
  const { 
    showInstallPrompt, 
    handlePromptDismiss, 
    handleDontShowAgain 
  } = usePWAInstallPrompt();

  return (
    <div className="h-full min-h-screen flex flex-col w-full bg-black">
      <TopNavBar />
      <main 
        className="flex-1 overflow-x-hidden overflow-y-auto"
        style={{
          paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <Outlet />
      </main>
      <BottomNavBar />
      
      {/* PWA Install Tooltip */}
      <PWAInstallTooltip 
        isOpen={showInstallPrompt}
        onClose={handlePromptDismiss}
      />
      
      {/* Notification Prompt - Aparece automaticamente 1 vez */}
      <NotificationPrompt />
      
      {/* Chatbot */}
      <ChatbotButton />
    </div>
  );
}
