import Header from "../components/Header.jsx";
import BackHomeButton from "../components/BackHomeButton.jsx";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <Header right={<BackHomeButton />} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="text-xl font-semibold">Admin Profile</h2>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80">Name: —</p>
          <p className="text-white/80">Email: —</p>
          <p className="text-white/50 mt-1 text-sm">Hook this to your auth/user table later.</p>
        </div>
      </main>
      <div className="h-24" />
    </div>
  );
}
