"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ArrowLeft, Download, Printer, Search } from "lucide-react";

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

type Expense = {
  id: number;
  expenseSerialNo: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

const MASJID_NAME = "Jamia Masjid Abu Haneefa";

export default function ReportsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const d = await supabase.from("donations").select("*").order("id", { ascending: false });
    const e = await supabase.from("expenses").select("*").order("id", { ascending: false });

    setDonations(d.data || []);
    setExpenses(e.data || []);
  }

  function dateMatches(date: string) {
    if (!date) return true;

    const d = new Date(date);
    const now = new Date();

    if (filter === "3months") {
      const past = new Date();
      past.setMonth(now.getMonth() - 3);
      return d >= past;
    }

    if (filter === "6months") {
      const past = new Date();
      past.setMonth(now.getMonth() - 6);
      return d >= past;
    }

    if (filter === "year") {
      return d.getFullYear() === now.getFullYear();
    }

    if (filter === "custom") {
      const fromOk = fromDate ? d >= new Date(fromDate) : true;
      const toOk = toDate ? d <= new Date(toDate) : true;
      return fromOk && toOk;
    }

    return true;
  }

  const filteredDonations = donations.filter((d) => {
    const match =
      (d.donorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.receiptSerialNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(search.toLowerCase());

    return match && dateMatches(d.date);
  });

  const filteredExpenses = expenses.filter((e) => {
    const match =
      (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.expenseSerialNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(search.toLowerCase());

    return match && dateMatches(e.date);
  });

  const totalDonations = filteredDonations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const balance = totalDonations - totalExpenses;

  const totalZakat = filteredDonations.filter((d) => d.category === "Zakat").reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalSadqa = filteredDonations.filter((d) => d.category === "Sadqa").reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalLillah = filteredDonations.filter((d) => d.category === "Lillah").reduce((s, d) => s + Number(d.amount || 0), 0);

  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook();

    const summary = workbook.addWorksheet("Summary");
    const donationSheet = workbook.addWorksheet("Donations");
    const expenseSheet = workbook.addWorksheet("Expenses");

    summary.addRows([
      [MASJID_NAME],
      ["Complete Financial Report"],
      ["Filter", filter],
      ["From Date", fromDate || "-"],
      ["To Date", toDate || "-"],
      [],
      ["Total Donations", totalDonations],
      ["Total Expenses", totalExpenses],
      ["Balance", balance],
      ["Total Zakat", totalZakat],
      ["Total Sadqa", totalSadqa],
      ["Total Lillah", totalLillah],
    ]);

    donationSheet.columns = [
      { header: "Receipt No", key: "receiptSerialNo", width: 22 },
      { header: "Donor", key: "donorName", width: 25 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "otherPurpose", width: 30 },
      { header: "Payment", key: "paymentMode", width: 18 },
      { header: "Date", key: "date", width: 15 },
    ];

    filteredDonations.forEach((d) => donationSheet.addRow(d));

    expenseSheet.columns = [
      { header: "Expense Serial No", key: "expenseSerialNo", width: 22 },
      { header: "Title", key: "title", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Date", key: "date", width: 15 },
    ];

    filteredExpenses.forEach((e) => expenseSheet.addRow(e));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Complete-Report-${filter}.xlsx`);
  }

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <button
          onClick={() => (window.location.href = "/")}
          className="btn-blue flex gap-2 items-center mb-5"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-black text-emerald-950">Reports</h1>
        <p className="text-gray-500 mt-1">
          Complete donation, expense, balance and category-wise financial report.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="premium-box">
          <p className="text-gray-500">Total Donations</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{totalDonations}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Total Expenses</p>
          <h2 className="text-3xl font-black text-red-700">₹{totalExpenses}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Balance</p>
          <h2 className="text-3xl font-black text-blue-800">₹{balance}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Total Entries</p>
          <h2 className="text-3xl font-black text-emerald-900">
            {filteredDonations.length + filteredExpenses.length}
          </h2>
        </div>
      </section>

      <section className="premium-box mb-6">
        <h2 className="premium-title">Report Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
            />
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
            <option value="all">All Time</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          <button onClick={() => window.print()} className="btn-blue flex gap-2 items-center">
            <Printer size={18} /> PDF
          </button>

          <button onClick={downloadExcel} className="btn-green flex gap-2 items-center">
            <Download size={18} /> Excel
          </button>
        </div>

        {filter === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input" />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="premium-box">
          <p className="text-gray-500">Zakat</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{totalZakat}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Sadqa</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{totalSadqa}</h2>
        </div>

        <div className="premium-box">
          <p className="text-gray-500">Lillah</p>
          <h2 className="text-3xl font-black text-emerald-900">₹{totalLillah}</h2>
        </div>
      </section>

      <section className="premium-box mb-6">
        <h2 className="premium-title">Donation Report</h2>

        {filteredDonations.map((d) => (
          <div key={d.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              Receipt #{d.receiptSerialNo} • {d.donorName} • ₹{d.amount} • {d.category}
              {d.category === "Other" && d.otherPurpose ? ` (${d.otherPurpose})` : ""} • {d.paymentMode} • {d.date}
            </span>
          </div>
        ))}

        {filteredDonations.length === 0 && (
          <p className="text-gray-500">No donations found.</p>
        )}
      </section>

      <section className="premium-box">
        <h2 className="premium-title">Expense Report</h2>

        {filteredExpenses.map((e) => (
          <div key={e.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              Voucher #{e.expenseSerialNo} • {e.title} • ₹{e.amount} • {e.category} • {e.description} • {e.date}
            </span>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <p className="text-gray-500">No expenses found.</p>
        )}
      </section>
    </main>
  );
}