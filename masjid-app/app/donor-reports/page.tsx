"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download, Printer, Search, UserRound } from "lucide-react";

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

const MASJID_NAME = "Jamia Masjid Abu Haneefa";

export default function DonorReportsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDonor, setSelectedDonor] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    const { data } = await supabase
      .from("donations")
      .select("*")
      .order("date", { ascending: false });

    setDonations(data || []);
  }

  const filteredAllDonations = donations.filter((d) =>
    month ? d.date?.startsWith(month) : true
  );

  const donorNames = useMemo(() => {
    return Array.from(
      new Set(donations.map((d) => d.donorName).filter(Boolean))
    );
  }, [donations]);

  const visibleDonors = donorNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const donorHistory = donations.filter((d) => {
    const donorMatch = selectedDonor ? d.donorName === selectedDonor : false;
    const monthMatch = month ? d.date?.startsWith(month) : true;
    return donorMatch && monthMatch;
  });

  const totalAllDonations = filteredAllDonations.reduce((s, d) => s + d.amount, 0);
  const totalDonorContribution = donorHistory.reduce((s, d) => s + d.amount, 0);

  async function downloadAllExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("All Donations");

    sheet.columns = [
      { header: "Receipt No", key: "receiptSerialNo", width: 22 },
      { header: "Donor", key: "donorName", width: 25 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Purpose", key: "category", width: 20 },
      { header: "Description", key: "otherPurpose", width: 30 },
      { header: "Payment", key: "paymentMode", width: 18 },
      { header: "Date", key: "date", width: 15 },
    ];

    filteredAllDonations.forEach((d) => sheet.addRow(d));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `All-Donations-${month || "All-Time"}.xlsx`);
  }

  async function downloadDonorExcel() {
    if (!selectedDonor) return alert("Select donor first");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Donor Report");

    sheet.addRows([
      [MASJID_NAME],
      ["Donor", selectedDonor],
      ["Month", month || "All Time"],
      ["Total Contribution", totalDonorContribution],
      ["Total Entries", donorHistory.length],
      [],
    ]);

    sheet.columns = [
      { header: "Receipt No", key: "receiptSerialNo", width: 22 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Purpose", key: "category", width: 20 },
      { header: "Description", key: "otherPurpose", width: 30 },
      { header: "Payment", key: "paymentMode", width: 18 },
      { header: "Date", key: "date", width: 15 },
    ];

    donorHistory.forEach((d) => sheet.addRow(d));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Donor-Report-${selectedDonor}-${month || "All-Time"}.xlsx`);
  }

  function printPage() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <h1 className="text-3xl font-black text-emerald-950">Donor Reports</h1>
        <p className="text-gray-500 mt-1">
          Full donations list + donor-wise history, totals and reports.
        </p>
      </section>

      <section className="premium-box mb-6">
        <div className="flex gap-3 flex-wrap items-center justify-between">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-full sm:w-64"
          />

          <div className="flex gap-3 flex-wrap">
            <button onClick={downloadAllExcel} className="btn-green flex gap-2 items-center">
              <Download size={18} /> All Donations Excel
            </button>

            <button onClick={printPage} className="btn-blue flex gap-2 items-center">
              <Printer size={18} /> PDF / Print
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="premium-box">
          <p className="text-gray-500">Total Donors</p>
          <h2 className="text-3xl font-black text-emerald-900">{donorNames.length}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Total Donation Entries</p>
          <h2 className="text-3xl font-black text-emerald-900">{filteredAllDonations.length}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Total Donations</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{totalAllDonations}</h2>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-box">
          <h2 className="premium-title flex gap-2 items-center">
            <UserRound /> Donor List
          </h2>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input
              className="input pl-11"
              placeholder="Search donor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {visibleDonors.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedDonor(name)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                  selectedDonor === name
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white border-emerald-100 hover:bg-emerald-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="premium-box">
            <h2 className="premium-title">Selected Donor Summary</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow">
                <p className="text-gray-500">Donor</p>
                <h2 className="text-xl font-black text-emerald-900 break-words">
                  {selectedDonor || "Not selected"}
                </h2>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow">
                <p className="text-gray-500">Times Donated</p>
                <h2 className="text-3xl font-black text-emerald-900">
                  {donorHistory.length}
                </h2>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow">
                <p className="text-gray-500">Total Contribution</p>
                <h2 className="text-3xl font-black text-emerald-900">
                  ₹{totalDonorContribution}
                </h2>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap mt-5">
              <button onClick={downloadDonorExcel} className="btn-green flex gap-2 items-center">
                <Download size={18} /> Donor Excel
              </button>

              <button onClick={printPage} className="btn-blue flex gap-2 items-center">
                <Printer size={18} /> Donor PDF / Print
              </button>
            </div>
          </section>

          <section className="premium-box">
            <h2 className="premium-title">Contribution History</h2>

            {!selectedDonor && (
              <p className="text-gray-500">Select a donor from the left list.</p>
            )}

            {donorHistory.map((d) => (
              <div key={d.id} className="premium-row">
                <span className="text-sm sm:text-base break-words">
                  Receipt #{d.receiptSerialNo} • ₹{d.amount} • {d.category}
                  {d.category === "Other" && d.otherPurpose
                    ? ` (${d.otherPurpose})`
                    : ""}{" "}
                  • {d.paymentMode} • {d.date}
                </span>
              </div>
            ))}

            {selectedDonor && donorHistory.length === 0 && (
              <p className="text-gray-500">No donations found for this filter.</p>
            )}
          </section>

          <section className="premium-box">
            <h2 className="premium-title">All Donations Detail</h2>

            {filteredAllDonations.map((d) => (
              <div key={d.id} className="premium-row">
                <span className="text-sm sm:text-base break-words">
                  Receipt #{d.receiptSerialNo} • {d.donorName} • ₹{d.amount} • {d.category}
                  {d.category === "Other" && d.otherPurpose
                    ? ` (${d.otherPurpose})`
                    : ""}{" "}
                  • {d.paymentMode} • {d.date}
                </span>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}