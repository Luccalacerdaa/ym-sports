import { Outlet } from "react-router-dom";
import { TopNavBar } from "@/components/TopNavBar";
import { BottomNavBar } from "@/components/BottomNavBar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-black">
      <TopNavBar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  );
}
