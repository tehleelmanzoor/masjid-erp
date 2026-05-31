"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ArrowLeft, Download, Printer, Search, Trash2 } from "lucide-react";

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    setExpenses(data || []);
  }

  async function deleteExpense(id: number) {
    if (!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
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

  const categories = Array.from(
    new Set(expenses.map((e) => e.category).filter(Boolean))
  );

  const filteredExpenses = expenses.filter((e) => {
    const searchMatch =
      (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.expenseSerialNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(search.toLowerCase());

    const categoryMatch = category === "all" ? true : e.category === category;

    return searchMatch && categoryMatch && dateMatches(e.date);
  });

  const totalExpense = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expense Report");

    sheet.addRows([
      [MASJID_NAME],
      ["Expense Report"],
      ["Filter", filter],
      ["Category", category],
      ["Total Expenses", totalExpense],
      [],
    ]);

    sheet.columns = [
      { header: "Expense Serial No", key: "expenseSerialNo", width: 22 },
      { header: "Title", key: "title", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Date", key: "date", width: 15 },
    ];

    filteredExpenses.forEach((e) => sheet.addRow(e));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Expense-Report-${filter}.xlsx`);
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

        <h1 className="text-3xl font-black text-emerald-950">
          Expense Reports
        </h1>
        <p className="text-gray-500 mt-1">
          View, filter, export and manage all mosque expenses.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="premium-box">
          <p className="text-gray-500">Total Expense Entries</p>
          <h2 className="text-3xl font-black text-emerald-900">
            {filteredExpenses.length}
          </h2>
        </div>

        <div className="premium-box md:col-span-2">
          <p className="text-gray-500">Total Expense Amount</p>
          <h2 className="text-3xl font-black text-red-700">₹{totalExpense}</h2>
        </div>
      </section>

      <section className="premium-box mb-6">
        <h2 className="premium-title">Expense Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input
              placeholder="Search expense..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Time</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-blue flex gap-2 items-center">
              <Printer size={18} /> PDF
            </button>

            <button onClick={downloadExcel} className="btn-green flex gap-2 items-center">
              <Download size={18} /> Excel
            </button>
          </div>
        </div>

        {filter === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input"
            />
          </div>
        )}
      </section>

      <section className="premium-box">
        <h2 className="premium-title">Expense Records</h2>

        {filteredExpenses.map((e) => (
          <div key={e.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              Voucher #{e.expenseSerialNo} • {e.title} • ₹{e.amount} • {e.category} • {e.description} • {e.date}
            </span>

            <button
              onClick={() => deleteExpense(e.id)}
              className="btn-red-small flex gap-1 items-center"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <p className="text-gray-500">No expenses found for this filter.</p>
        )}
      </section>
    </main>
  );
}