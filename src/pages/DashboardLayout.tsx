import { Outlet } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";
import { BottomNavBar } from "@/components/BottomNavBar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-black">
      <TopNavBar />
      <main className="flex-1 pb-16 sm:pb-20 overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
