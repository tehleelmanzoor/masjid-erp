"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, Search } from "lucide-react";

type Donation = {
  id: number;
  receiptSerialNo: string;
  donorName: string;
  phone: string;
  amount: number;
  category: string;
  otherPurpose: string;
  paymentMode: string;
  date: string;
};

export default function DonorsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    const { data } = await supabase
      .from("donations")
      .select("*")
      .order("id", { ascending: false });

    setDonations(data || []);
  }

  const donorNames = Array.from(
    new Set(donations.map((d) => d.donorName).filter(Boolean))
  );

  const selectedDonations = donations.filter((d) =>
    d.donorName.toLowerCase().includes(search.toLowerCase())
  );

  const total = selectedDonations.reduce((s, d) => s + d.amount, 0);

  async function downloadDonorReport() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Donor Report");

    sheet.columns = [
      { header: "Receipt Serial No", key: "receiptSerialNo", width: 22 },
      { header: "Donor Name", key: "donorName", width: 25 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Other Purpose", key: "otherPurpose", width: 30 },
      { header: "Payment Mode", key: "paymentMode", width: 18 },
      { header: "Date", key: "date", width: 15 },
    ];

    selectedDonations.forEach((d) => sheet.addRow(d));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Donor-Report-${search || "All"}.xlsx`);
  }

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <h1 className="text-3xl font-black text-emerald-950">
          Donor Report System
        </h1>
        <p className="text-gray-500 mt-1">
          Search any donor and download full contribution history.
        </p>
      </section>

      <section className="premium-box mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
          <input
            className="input pl-11"
            placeholder="Search donor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="premium-box">
          <p className="text-gray-500">Total Donors</p>
          <h2 className="text-3xl font-black text-emerald-900">
            {donorNames.length}
          </h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Selected Donations</p>
          <h2 className="text-3xl font-black text-emerald-900">
            {selectedDonations.length}
          </h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Total Contribution</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{total}</h2>
        </div>
      </section>

      <section className="premium-box">
        <div className="flex justify-between gap-3 flex-wrap mb-5">
          <h2 className="premium-title">Contribution History</h2>

          <button
            onClick={downloadDonorReport}
            className="btn-green flex gap-2 items-center"
          >
            <Download size={18} /> Download Report
          </button>
        </div>

        {selectedDonations.map((d) => (
          <div key={d.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              Receipt #{d.receiptSerialNo} • {d.donorName} • ₹{d.amount} •{" "}
              {d.category}
              {d.category === "Other" && d.otherPurpose
                ? ` (${d.otherPurpose})`
                : ""}{" "}
              • {d.paymentMode} • {d.date}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}