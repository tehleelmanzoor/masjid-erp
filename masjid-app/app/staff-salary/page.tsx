"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  Download,
  Printer,
  Search,
  PlusCircle,
  Trash2,
  UserRound,
  Wallet,
  Star,
  CalendarDays,
} from "lucide-react";

type StaffSalary = {
  id: number;
  staffName: string;
  role: string;
  month: string;
  salary: number;
  status: string;
  performance: string;
  notes: string;
  date: string;
};

const MASJID_NAME = "Jamia Masjid Abu Haneefa";

export default function StaffSalaryPage() {
  const [records, setRecords] = useState<StaffSalary[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    const { data } = await supabase
      .from("staff_salaries")
      .select("*")
      .order("id", { ascending: false });

    setRecords(data || []);
  }

  async function addSalary(formData: FormData) {
    const { error } = await supabase.from("staff_salaries").insert({
      staffName: formData.get("staffName"),
      role: formData.get("role"),
      month: formData.get("month"),
      salary: Number(formData.get("salary")),
      status: formData.get("status"),
      performance: formData.get("performance"),
      notes: formData.get("notes"),
      date: formData.get("date"),
    });

    if (error) {
      alert(error.message);
      return;
    }

    fetchRecords();
  }

  async function deleteRecord(id: number) {
    if (!confirm("Delete this salary record?")) return;
    await supabase.from("staff_salaries").delete().eq("id", id);
    fetchRecords();
  }

  const roles = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.role).filter(Boolean)));
  }, [records]);

  const filteredRecords = records.filter((r) => {
    const searchMatch =
      (r.staffName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.role || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.performance || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(search.toLowerCase());

    const roleMatch = roleFilter === "all" ? true : r.role === roleFilter;
    const statusMatch = statusFilter === "all" ? true : r.status === statusFilter;
    const monthMatch = monthFilter ? r.month === monthFilter : true;
    const yearMatch = yearFilter ? r.date?.startsWith(yearFilter) : true;

    return searchMatch && roleMatch && statusMatch && monthMatch && yearMatch;
  });

  const totalSalary = filteredRecords.reduce(
    (s, r) => s + Number(r.salary || 0),
    0
  );

  const paidSalary = filteredRecords
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + Number(r.salary || 0), 0);

  const pendingSalary = filteredRecords
    .filter((r) => r.status === "Pending")
    .reduce((s, r) => s + Number(r.salary || 0), 0);

  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Staff Salary Report");

    sheet.addRows([
      [MASJID_NAME],
      ["Staff Salary Report"],
      ["Total Salary", totalSalary],
      ["Paid Salary", paidSalary],
      ["Pending Salary", pendingSalary],
      [],
    ]);

    sheet.columns = [
      { header: "Staff Name", key: "staffName", width: 25 },
      { header: "Role", key: "role", width: 20 },
      { header: "Month", key: "month", width: 15 },
      { header: "Salary", key: "salary", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Performance", key: "performance", width: 35 },
      { header: "Notes", key: "notes", width: 35 },
      { header: "Date", key: "date", width: 15 },
    ];

    filteredRecords.forEach((r) => sheet.addRow(r));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Staff-Salary-Report.xlsx");
  }
    return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <button onClick={() => window.location.href = "/"} className="btn-blue flex gap-2 items-center mb-5">
          <ArrowLeft size={18}/> Back to Dashboard
        </button>

        <h1 className="text-3xl font-black text-emerald-950">Staff Salary</h1>
        <p className="text-gray-500 mt-1">Manage monthly salary, status and performance reports.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="premium-box"><p className="text-gray-500">Total Records</p><h2 className="text-3xl font-black text-emerald-900">{filteredRecords.length}</h2></div>
        <div className="premium-box"><p className="text-gray-500">Total Salary</p><h2 className="text-3xl font-black text-emerald-900">₹{totalSalary}</h2></div>
        <div className="premium-box"><p className="text-gray-500">Paid</p><h2 className="text-3xl font-black text-blue-800">₹{paidSalary}</h2></div>
        <div className="premium-box"><p className="text-gray-500">Pending</p><h2 className="text-3xl font-black text-red-700">₹{pendingSalary}</h2></div>
      </section>

      <section className="premium-box mb-6">
        <h2 className="premium-title flex gap-2 items-center"><PlusCircle/> Add Salary Record</h2>

        <form action={addSalary} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="staffName" placeholder="Staff Name" required className="input"/>
          <select name="role" className="input">
            <option>Imam Sahib</option>
            <option>Juma Khatib</option>
            <option>Hamami</option>
            <option>Muezzin</option>
            <option>Cleaner</option>
            <option>Other</option>
          </select>
          <input name="month" type="month" required className="input"/>
          <input name="salary" type="number" placeholder="Salary Amount" required className="input"/>
          <select name="status" className="input">
            <option>Paid</option>
            <option>Pending</option>
          </select>
          <input name="date" type="date" required className="input"/>
          <textarea name="performance" placeholder="Performance report" className="input md:col-span-2"/>
          <textarea name="notes" placeholder="Notes" className="input md:col-span-2"/>
          <button className="btn-green w-full md:col-span-2">Save Salary Record</button>
        </form>
      </section>

      <section className="premium-box mb-6">
        <h2 className="premium-title">Filters & Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." className="input pl-11"/>
          </div>

          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="input">
            <option value="all">All Roles</option>
            {roles.map(r=><option key={r} value={r}>{r}</option>)}
          </select>

          <input type="month" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} className="input"/>

          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input">
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <input value={yearFilter} onChange={e=>setYearFilter(e.target.value)} placeholder="Year e.g. 2026" className="input"/>
        </div>

        <div className="flex gap-3 flex-wrap mt-4">
          <button onClick={() => window.print()} className="btn-blue flex gap-2 items-center">
            <Printer size={18}/> PDF
          </button>
          <button onClick={downloadExcel} className="btn-green flex gap-2 items-center">
            <Download size={18}/> Excel
          </button>
        </div>
      </section>

      <section className="premium-box">
        <h2 className="premium-title flex gap-2 items-center"><UserRound/> Salary Records</h2>

        {filteredRecords.map(r=>(
          <div key={r.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              {r.staffName} • {r.role} • {r.month} • ₹{r.salary} • {r.status} • {r.performance} • {r.notes} • {r.date}
            </span>

            <button onClick={()=>deleteRecord(r.id)} className="btn-red-small flex gap-1 items-center">
              <Trash2 size={14}/> Delete
            </button>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <p className="text-gray-500">No salary records found.</p>
        )}
      </section>
    </main>
  );
}