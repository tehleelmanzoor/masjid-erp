"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DonatePage() {
  const [msg, setMsg] = useState("");

  async function submitDonation(formData: FormData) {
    setMsg("Submitting...");

    const { error } = await supabase.from("donations").insert({
      donorName: formData.get("donorName"),
      phone: formData.get("phone"),
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      paymentMode: formData.get("paymentMode"),
      date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      setMsg("❌ Failed: " + error.message);
    } else {
      setMsg("✅ Donation details submitted successfully");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <section className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Jamia Masjid Abu Haneefa
        </h1>

        <p className="text-center mb-6 text-gray-600">
          Public Donation Form
        </p>

        <form action={submitDonation} className="space-y-3">
          <input name="donorName" placeholder="Your Name" required className="input" />
          <input name="phone" placeholder="Phone Number" className="input" />
          <input name="amount" type="number" placeholder="Amount" required className="input" />

          <select name="category" className="input">
            <option>Zakat</option>
            <option>Sadqa</option>
            <option>Lillah</option>
            <option>Masjid Construction</option>
            <option>Other</option>
          </select>

          <select name="paymentMode" className="input">
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Other</option>
          </select>

          <button className="btn-green w-full">
            Submit Donation
          </button>
        </form>

        <p className="text-center mt-4">{msg}</p>
      </section>
    </main>
  );
}