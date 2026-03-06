import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-gray-900/95 border-b border-gray-700 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm">
      <WifiOff className="h-4 w-4 text-yellow-500 flex-shrink-0" />
      <span>Modo offline — alguns recursos não estão disponíveis</span>
    </div>
  );
}
