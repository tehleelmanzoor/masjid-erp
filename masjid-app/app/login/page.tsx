"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Lock, Mail, Menu, X } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Checking login...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("❌ Wrong email or password");
      return;
    }

    setMsg("✅ Login successful...");
    window.location.href = "/";
  }

  const navItems = [
    { name: "About This Masjid", link: "/about" },
    { name: "Core Committee Members", link: "/committee" },
    { name: "Donation QR / Bank Details", link: "/donate_qr" },
  ];

  function go(link: string) {
    setOpen(false);
    window.location.href = link;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800 flex items-center justify-center p-6 pt-28">

      {/* Desktop Navbar */}
      <div className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/15 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-3xl p-2 flex justify-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.link}
              type="button"
              onClick={() => go(item.link)}
              className="px-5 py-2 rounded-2xl font-bold text-white hover:bg-white hover:text-emerald-950 transition-all duration-300"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white/15 backdrop-blur-2xl border border-white/25 text-white px-4 py-3 rounded-2xl shadow-xl flex gap-2 items-center font-bold"
      >
        <Menu size={20}/> Menu
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50">
          <div className="w-72 h-full bg-emerald-950/95 backdrop-blur-2xl border-r border-white/20 p-6 text-white">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-6 bg-white/15 px-4 py-2 rounded-xl flex gap-2 items-center"
            >
              <X size={18}/> Close
            </button>

            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.link}
                  type="button"
                  onClick={() => go(item.link)}
                  className="w-full text-left px-5 py-4 rounded-2xl bg-white/10 hover:bg-white hover:text-emerald-950 font-bold transition-all"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-10 right-16 text-yellow-200 text-7xl animate-pulse">☾</div>
      <div className="absolute top-20 left-20 text-white text-2xl animate-bounce">✦</div>
      <div className="absolute top-40 right-48 text-white text-xl animate-pulse">✧</div>
      <div className="absolute bottom-52 left-40 text-white text-xl animate-bounce">✦</div>

      <div className="absolute bottom-0 left-0 right-0 h-72 bg-emerald-950/70">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-56 bg-emerald-950 rounded-t-[80px]"></div>
        <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-36 h-36 bg-emerald-950 rounded-full"></div>
        <div className="absolute bottom-0 left-[25%] w-20 h-72 bg-emerald-950 rounded-t-full"></div>
        <div className="absolute bottom-0 right-[25%] w-20 h-72 bg-emerald-950 rounded-t-full"></div>
      </div>

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white/15 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-[32px] p-7 sm:p-9 text-white fade-in"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-lg">
            🕌
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            Markazi Jamia Masjid Abu Haneefa
          </h1>

          <p className="text-emerald-100 mt-2">
            Secure Masjid ERP Login
          </p>
        </div>

        <div className="relative mb-4">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative mb-5">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-green w-full text-lg">
          Login to Dashboard
        </button>

        <p className="text-center mt-4 text-sm text-emerald-100">{msg}</p>
      </form>
    </main>
  );
}