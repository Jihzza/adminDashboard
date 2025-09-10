import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import VenturesLanding from "./pages/VenturesLanding.jsx";
import VentureDashboardPage from "./pages/VentureDashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import UserDetailPage from "./pages/UserDetailPage.jsx";
import BugReportsPage from "./pages/BugReportsPage.jsx";
import TestimonialsPage from "./pages/TestimonialsPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import PitchDecksPage from "./pages/PitchDecksPage.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* New home */}
        <Route path="/" element={<VenturesLanding />} />

        {/* Venture dashboard */}
        <Route path="/v/:venture" element={<VentureDashboardPage />} />

        {/* Existing pages (now accept ?source=) */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/u/:source/:id" element={<UserDetailPage />} />
        <Route path="/bugs" element={<BugReportsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/pitchdecks" element={<PitchDecksPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
