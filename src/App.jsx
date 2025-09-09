import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import UserDetailPage from "./pages/UserDetailPage.jsx";
import BugReportsPage from "./pages/BugReportsPage.jsx";
import TestimonialsPage from "./pages/TestimonialsPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import PitchDecksPage from "./pages/PitchDecksPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<UsersPage />} />
        <Route path="/u/:source/:id" element={<UserDetailPage />} />
        <Route path="/bugs" element={<BugReportsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/pitchdecks" element={<PitchDecksPage />} />
      </Route>
    </Routes>
  );
}
