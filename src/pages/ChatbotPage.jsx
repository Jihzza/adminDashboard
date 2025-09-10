import Header from "../components/Header.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <Header right={<BackHomeButton />} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="text-xl font-semibold">Chatbot (coming soon)</h2>
        <p className="text-white/70 mt-2">This page will host the admin assistant/chatbot.</p>
      </main>
      <div className="h-24" />
    </div>
  );
}
