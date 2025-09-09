import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-app bg-grid flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
