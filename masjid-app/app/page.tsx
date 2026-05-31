"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Wallet, TrendingUp, TrendingDown, Landmark, LogOut, Download,
  Printer, PlusCircle, Trash2, Search, Sparkles, Pencil, X, Menu,
  LayoutDashboard, ReceiptText, CreditCard, Store, UserRound,
  UsersRound, ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from "recharts";

type Donation = {
  id:number;
  receiptSerialNo:string;
  donorName:string;
  phone:string;
  amount:number;
  category:string;
  otherPurpose:string;
  paymentMode:string;
  date:string;
};

type Expense = {
  id:number;
  expenseSerialNo:string;
  title:string;
  amount:number;
  category:string;
  description:string;
  date:string;
};

const MASJID_NAME = "Jamia Masjid Abu Haneefa";
const SIGNATURE_NAME = "Markazi Jamia Masjid Abu Haneefa Committee";

export default function Home() {
  const [user,setUser]=useState<User|null>(null);
  const [role,setRole]=useState("viewer");
  const [mobileMenu,setMobileMenu]=useState(false);

  const [donations,setDonations]=useState<Donation[]>([]);
  const [expenses,setExpenses]=useState<Expense[]>([]);

  const [search,setSearch]=useState("");
  const [donationCategory,setDonationCategory]=useState("Zakat");

  const [editingDonation,setEditingDonation]=useState<Donation|null>(null);
  const [editingExpense,setEditingExpense]=useState<Expense|null>(null);

  const [filterTarget,setFilterTarget]=useState("all");
  const [recordFilter,setRecordFilter]=useState("all");
  const [fromDate,setFromDate]=useState("");
  const [toDate,setToDate]=useState("");

  useEffect(()=>{ checkLogin(); },[]);

  function go(path:string){
    setMobileMenu(false);
    window.location.href = path;
  }

  async function checkLogin(){
    const { data } = await supabase.auth.getUser();

    if(!data.user){
      window.location.href="/login";
      return;
    }

    setUser(data.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setRole(profile?.role || "viewer");
    fetchData();
  }

  async function logout(){
    await supabase.auth.signOut();
    window.location.href="/login";
  }

  async function fetchData(){
    const d=await supabase.from("donations").select("*").order("id",{ascending:false});
    const e=await supabase.from("expenses").select("*").order("id",{ascending:false});
    setDonations(d.data || []);
    setExpenses(e.data || []);
  }

  async function addAudit(action:string, module:string, recordId:any, details:string){
    await supabase.from("audit_logs").insert({
      user_email: user?.email || "",
      user_role: role,
      action,
      module,
      record_id: String(recordId),
      details
    });
  }

  async function addDonation(formData:FormData){
    const { error } = await supabase.from("donations").insert({
      receiptSerialNo:formData.get("receiptSerialNo"),
      donorName:formData.get("donorName"),
      phone:formData.get("phone"),
      amount:Number(formData.get("amount")),
      category:formData.get("category"),
      otherPurpose:formData.get("otherPurpose"),
      paymentMode:formData.get("paymentMode"),
      date:formData.get("date"),
    });

    if(error){ alert(error.message); return; }

    await addAudit("ADD","DONATION","new",`Added donation by ${formData.get("donorName")}`);
    setDonationCategory("Zakat");
    fetchData();
  }

  async function updateDonation(formData:FormData){
    if(!editingDonation) return;

    const { error } = await supabase
      .from("donations")
      .update({
        receiptSerialNo:formData.get("receiptSerialNo"),
        donorName:formData.get("donorName"),
        phone:formData.get("phone"),
        amount:Number(formData.get("amount")),
        category:formData.get("category"),
        otherPurpose:formData.get("otherPurpose"),
        paymentMode:formData.get("paymentMode"),
        date:formData.get("date"),
      })
      .eq("id",editingDonation.id);

    if(error){ alert(error.message); return; }

    await addAudit("UPDATE","DONATION",editingDonation.id,"Donation updated");
    setEditingDonation(null);
    fetchData();
  }

  async function addExpense(formData:FormData){
    const { error } = await supabase.from("expenses").insert({
      expenseSerialNo:formData.get("expenseSerialNo"),
      title:formData.get("title"),
      amount:Number(formData.get("amount")),
      category:formData.get("category"),
      description:formData.get("description"),
      date:formData.get("date"),
    });

    if(error){ alert(error.message); return; }

    await addAudit("ADD","EXPENSE","new",`Added expense ${formData.get("title")}`);
    fetchData();
  }

  async function updateExpense(formData:FormData){
    if(!editingExpense) return;

    const { error } = await supabase
      .from("expenses")
      .update({
        expenseSerialNo:formData.get("expenseSerialNo"),
        title:formData.get("title"),
        amount:Number(formData.get("amount")),
        category:formData.get("category"),
        description:formData.get("description"),
        date:formData.get("date"),
      })
      .eq("id",editingExpense.id);

    if(error){ alert(error.message); return; }

    await addAudit("UPDATE","EXPENSE",editingExpense.id,"Expense updated");
    setEditingExpense(null);
    fetchData();
  }

  async function deleteDonation(id:number){
    if(!confirm("Delete this donation?")) return;
    await supabase.from("donations").delete().eq("id",id);
    await addAudit("DELETE","DONATION",id,"Donation deleted");
    fetchData();
  }

  async function deleteExpense(id:number){
    if(!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id",id);
    await addAudit("DELETE","EXPENSE",id,"Expense deleted");
    fetchData();
  }
    function dateMatchesFilter(date:string){
    if(!date) return true;
    const d = new Date(date);
    const now = new Date();

    if(recordFilter === "3months"){
      const past = new Date();
      past.setMonth(now.getMonth() - 3);
      return d >= past;
    }

    if(recordFilter === "6months"){
      const past = new Date();
      past.setMonth(now.getMonth() - 6);
      return d >= past;
    }

    if(recordFilter === "year"){
      return d.getFullYear() === now.getFullYear();
    }

    if(recordFilter === "custom"){
      const fromOk = fromDate ? d >= new Date(fromDate) : true;
      const toOk = toDate ? d <= new Date(toDate) : true;
      return fromOk && toOk;
    }

    return true;
  }

  const filteredDonations=donations.filter(d=>{
    const byName=(d.donorName || "").toLowerCase().includes(search.toLowerCase());
    const bySerial=(d.receiptSerialNo || "").toLowerCase().includes(search.toLowerCase());
    const byDate = filterTarget==="donations" || filterTarget==="all" ? dateMatchesFilter(d.date) : true;
    return (byName || bySerial) && byDate;
  });

  const filteredExpenses=expenses.filter(e=>{
    const byDate = filterTarget==="expenses" || filterTarget==="all" ? dateMatchesFilter(e.date) : true;
    return byDate;
  });

  const totalZakat=filteredDonations.filter(d=>d.category==="Zakat").reduce((s,d)=>s+Number(d.amount||0),0);
  const totalSadqa=filteredDonations.filter(d=>d.category==="Sadqa").reduce((s,d)=>s+Number(d.amount||0),0);
  const totalLillah=filteredDonations.filter(d=>d.category==="Lillah").reduce((s,d)=>s+Number(d.amount||0),0);
  const totalDonations=filteredDonations.reduce((s,d)=>s+Number(d.amount||0),0);
  const totalExpenses=filteredExpenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const balance=totalDonations-totalExpenses;

  const canAdd = role === "admin" || role === "accountant" || role === "data_entry";
  const canEdit = role === "admin" || role === "accountant";
  const canDelete = role === "admin";
  const canExport = role === "admin" || role === "accountant";

  const chartData=[
    {name:"Zakat",amount:totalZakat},
    {name:"Sadqa",amount:totalSadqa},
    {name:"Lillah",amount:totalLillah},
    {name:"Expenses",amount:totalExpenses},
    {name:"Balance",amount:balance},
  ];

  const pieData=[
    {name:"Zakat",value:totalZakat},
    {name:"Sadqa",value:totalSadqa},
    {name:"Lillah",value:totalLillah},
  ];

  function printReceipt(d:Donation){
    const w=window.open("","_blank");
    w?.document.write(`
      <body style="font-family:Arial;padding:30px">
        <h1 style="text-align:center">${MASJID_NAME}</h1>
        <h2 style="text-align:center">Official Donation Receipt</h2><hr/>
        <p><b>Receipt No:</b> ${d.receiptSerialNo}</p>
        <p><b>Donor:</b> ${d.donorName}</p>
        <p><b>Phone:</b> ${d.phone}</p>
        <p><b>Amount:</b> ₹${d.amount}</p>
        <p><b>Category:</b> ${d.category}</p>
        ${d.category === "Other" ? `<p><b>Purpose:</b> ${d.otherPurpose || ""}</p>` : ""}
        <p><b>Payment:</b> ${d.paymentMode}</p>
        <p><b>Date:</b> ${d.date}</p><br/>
        <p><b>Authorized By:</b> ${SIGNATURE_NAME}</p>
        <p>Signature: __________________</p>
      </body>
    `);
    w?.print();
  }

  function printMonthlyReport(){ window.print(); }

  async function downloadExcel(){
    const workbook=new ExcelJS.Workbook();
    const summary=workbook.addWorksheet("Summary");
    const donationSheet=workbook.addWorksheet("Donations");
    const expenseSheet=workbook.addWorksheet("Expenses");

    summary.addRows([
      [MASJID_NAME],
      ["User Role", role],
      ["Total Donations", totalDonations],
      ["Total Expenses", totalExpenses],
      ["Balance", balance],
    ]);

    donationSheet.columns=[
      {header:"Receipt No",key:"receiptSerialNo",width:25},
      {header:"Donor",key:"donorName",width:25},
      {header:"Phone",key:"phone",width:18},
      {header:"Amount",key:"amount",width:15},
      {header:"Category",key:"category",width:20},
      {header:"Purpose",key:"otherPurpose",width:30},
      {header:"Payment",key:"paymentMode",width:18},
      {header:"Date",key:"date",width:15},
    ];

    filteredDonations.forEach(d=>donationSheet.addRow(d));

    expenseSheet.columns=[
      {header:"Expense No",key:"expenseSerialNo",width:22},
      {header:"Title",key:"title",width:25},
      {header:"Amount",key:"amount",width:15},
      {header:"Category",key:"category",width:20},
      {header:"Description",key:"description",width:40},
      {header:"Date",key:"date",width:15},
    ];

    filteredExpenses.forEach(e=>expenseSheet.addRow(e));

    const buffer=await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]),`Masjid-Report.xlsx`);
  }

  if(!user) return <main className="p-6">Checking login...</main>;

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid text-slate-900">
      <button
        onClick={()=>setMobileMenu(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-xl flex gap-2 items-center"
      >
        <Menu size={20}/> Menu
      </button>

      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <aside className="w-72 h-full bg-emerald-950 text-white p-6 overflow-y-auto">
            <button onClick={()=>setMobileMenu(false)} className="mb-6 bg-white/10 px-4 py-2 rounded-xl">
              Close
            </button>

            <nav className="space-y-3">
              <div onClick={()=>go("/")}><SideItem icon={<LayoutDashboard size={20}/>} text="Dashboard" /></div>
              <div onClick={()=>go("/donor-reports")}><SideItem icon={<UserRound size={20}/>} text="Donor Reports" /></div>
              <div onClick={()=>go("/expenses")}><SideItem icon={<CreditCard size={20}/>} text="Expenses" /></div>
              <div onClick={()=>go("/reports")}><SideItem icon={<ReceiptText size={20}/>} text="Reports" /></div>
              <div onClick={()=>go("/staff-salary")}><SideItem icon={<UsersRound size={20}/>} text="Staff Salary" /></div>
              <div onClick={()=>go("/shops")}><SideItem icon={<Store size={20}/>} text="Shops" /></div>
              {role === "admin" && <div onClick={()=>go("/audit-logs")}><SideItem icon={<ShieldCheck size={20}/>} text="Audit Logs" /></div>}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-emerald-950 text-white p-6 flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl">🕌</div>
              <div>
                <h2 className="font-black text-xl">Masjid ERP</h2>
                <p className="text-emerald-200 text-sm">{role.toUpperCase()}</p>
              </div>
            </div>

            <nav className="space-y-3">
              <SideItem icon={<LayoutDashboard size={20}/>} text="Dashboard" />
              <div onClick={() => window.location.href = "/donor-reports"}><SideItem icon={<UserRound size={20}/>} text="Donor Reports" /></div>
              <div onClick={() => window.location.href = "/expenses"}><SideItem icon={<CreditCard size={20}/>} text="Expenses" /></div>
              <div onClick={() => window.location.href = "/reports"}><SideItem icon={<ReceiptText size={20}/>} text="Reports" /></div>
              <div onClick={() => window.location.href = "/staff-salary"}><SideItem icon={<UsersRound size={20}/>} text="Staff Salary" /></div>
              <div onClick={() => window.location.href = "/shops"}><SideItem icon={<Store size={20}/>} text="Shops" /></div>
              {role === "admin" && (
                <div onClick={() => window.location.href = "/audit-logs"}>
                  <SideItem icon={<ShieldCheck size={20}/>} text="Audit Logs" />
                </div>
              )}
            </nav>
          </div>

          <button onClick={logout} className="bg-white text-emerald-950 px-4 py-3 rounded-2xl font-bold flex gap-2 items-center justify-center">
            <LogOut size={18}/> Logout
          </button>
        </aside>

        <section className="w-full lg:ml-72 p-3 sm:p-4 md:p-6 pt-20 lg:pt-6 relative overflow-hidden">
          <div className="relative z-10">
            <header className="rounded-[28px] md:rounded-[36px] p-5 md:p-8 mb-8 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-700 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute right-10 top-6 text-[90px] md:text-[130px] opacity-10">🕌</div>

              <div className="relative z-10 flex justify-between gap-4 flex-wrap items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full mb-4">
                    <Sparkles size={16}/>
                    <span className="text-sm">Premium Masjid ERP Dashboard</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-black">{MASJID_NAME}</h1>
                  <p className="text-emerald-100 mt-3 text-sm sm:text-base break-words">
                    {user.email} • Role: {role}
                  </p>
                </div>

                <button onClick={logout} className="lg:hidden bg-white text-emerald-950 px-5 py-3 rounded-2xl font-bold flex gap-2 items-center">
                  <LogOut size={18}/> Logout
                </button>
              </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <PremiumCard icon={<Wallet />} title="Total Donations" value={`₹${totalDonations}`} color="from-emerald-500 to-green-800" />
              <PremiumCard icon={<TrendingDown />} title="Total Expenses" value={`₹${totalExpenses}`} color="from-rose-500 to-red-800" />
              <PremiumCard icon={<TrendingUp />} title="Current Balance" value={`₹${balance}`} color="from-blue-500 to-indigo-800" />
              <PremiumCard icon={<Landmark />} title="Donation Entries" value={`${filteredDonations.length}`} color="from-amber-400 to-orange-700" />
            </section>

            <section className="premium-box mb-8">
              <h2 className="premium-title">Records Filter</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select value={filterTarget} onChange={e=>setFilterTarget(e.target.value)} className="input">
                  <option value="all">Apply to All</option>
                  <option value="donations">Apply to Donations only</option>
                  <option value="expenses">Apply to Expenses only</option>
                </select>

                <select value={recordFilter} onChange={e=>setRecordFilter(e.target.value)} className="input">
                  <option value="all">All Time</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Date Range</option>
                </select>

                {recordFilter === "custom" && (
                  <>
                    <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="input"/>
                    <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="input"/>
                  </>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="premium-box xl:col-span-2 overflow-x-auto">
                <h2 className="premium-title">Financial Performance</h2>
                <div className="h-72 md:h-80 min-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name"/>
                      <YAxis/>
                      <Tooltip/>
                      <Area type="monotone" dataKey="amount" stroke="#059669" fill="#bbf7d0" strokeWidth={4}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="premium-box overflow-x-auto">
                <h2 className="premium-title">Donation Split</h2>
                <div className="h-72 md:h-80 min-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
                        <Cell fill="#059669"/>
                        <Cell fill="#2563eb"/>
                        <Cell fill="#f59e0b"/>
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {canExport && (
              <section className="premium-box mb-8">
                <h2 className="premium-title">Reports Control Center</h2>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={printMonthlyReport} className="btn-blue flex gap-2 items-center"><Printer size={18}/> PDF</button>
                  <button onClick={downloadExcel} className="btn-green flex gap-2 items-center"><Download size={18}/> Excel</button>
                </div>
              </section>
            )}

            {canAdd && (
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <div className="premium-box">
                  <h2 className="premium-title flex gap-2 items-center"><PlusCircle/> {editingDonation ? "Edit Donation" : "Add Donation"}</h2>
                  <form action={editingDonation ? updateDonation : addDonation} className="space-y-3">
                    <input name="receiptSerialNo" defaultValue={editingDonation?.receiptSerialNo || ""} placeholder="Manual Receipt Serial No" required className="input"/>
                    <input name="donorName" defaultValue={editingDonation?.donorName || ""} placeholder="Donor Name" required className="input"/>
                    <input name="phone" defaultValue={editingDonation?.phone || ""} placeholder="Phone Number" className="input"/>
                    <input name="amount" type="number" defaultValue={editingDonation?.amount || ""} placeholder="Amount" required className="input"/>

                    <select name="category" defaultValue={editingDonation?.category || donationCategory} className="input" onChange={(e)=>setDonationCategory(e.target.value)}>
                      <option>Zakat</option>
                      <option>Sadqa</option>
                      <option>Lillah</option>
                      <option>Masjid Construction</option>
                      <option>Other</option>
                    </select>

                    <input name="otherPurpose" defaultValue={editingDonation?.otherPurpose || ""} placeholder="Purpose if Other" className="input"/>

                    <select name="paymentMode" defaultValue={editingDonation?.paymentMode || "Cash"} className="input">
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                      <option>Other</option>
                    </select>

                    <input name="date" type="date" defaultValue={editingDonation?.date || ""} required className="input"/>
                    <button className="btn-green w-full">{editingDonation ? "Update Donation" : "Save Donation"}</button>

                    {editingDonation && (
                      <button type="button" onClick={()=>setEditingDonation(null)} className="btn-red w-full flex gap-2 justify-center items-center">
                        <X size={16}/> Cancel Edit
                      </button>
                    )}
                  </form>
                </div>

                <div className="premium-box">
                  <h2 className="premium-title flex gap-2 items-center"><PlusCircle/> {editingExpense ? "Edit Expense" : "Add Expense"}</h2>
                  <form action={editingExpense ? updateExpense : addExpense} className="space-y-3">
                    <input name="expenseSerialNo" defaultValue={editingExpense?.expenseSerialNo || ""} placeholder="Expense Voucher / Receipt Serial No" required className="input"/>
                    <input name="title" defaultValue={editingExpense?.title || ""} placeholder="Expense Title" required className="input"/>
                    <input name="amount" type="number" defaultValue={editingExpense?.amount || ""} placeholder="Amount" required className="input"/>

                    <select name="category" defaultValue={editingExpense?.category || "Electricity"} className="input">
                      <option>Electricity</option>
                      <option>Water</option>
                      <option>Imam Salary</option>
                      <option>Muezzin Salary</option>
                      <option>Cleaning</option>
                      <option>Repair</option>
                      <option>Maintenance</option>
                      <option>Construction</option>
                      <option>Other</option>
                    </select>

                    <textarea name="description" defaultValue={editingExpense?.description || ""} placeholder="Expense description" className="input"/>
                    <input name="date" type="date" defaultValue={editingExpense?.date || ""} required className="input"/>
                    <button className="btn-red w-full">{editingExpense ? "Update Expense" : "Save Expense"}</button>

                    {editingExpense && (
                      <button type="button" onClick={()=>setEditingExpense(null)} className="btn-blue w-full flex gap-2 justify-center items-center">
                        <X size={16}/> Cancel Edit
                      </button>
                    )}
                  </form>
                </div>
              </section>
            )}

            <section className="premium-box mb-8">
              <div className="flex justify-between gap-4 flex-wrap mb-5">
                <h2 className="premium-title">Donation Records</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                  <input placeholder="Search donor or serial no..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-11"/>
                </div>
              </div>

              {filteredDonations.map(d=>(
                <div key={d.id} className="premium-row">
                  <span className="text-sm sm:text-base break-words">
                    Receipt #{d.receiptSerialNo} • {d.donorName} • ₹{d.amount} • {d.category} • {d.paymentMode} • {d.date}
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={()=>printReceipt(d)} className="btn-blue">Receipt</button>
                    {canEdit && <button onClick={()=>setEditingDonation(d)} className="btn-blue flex gap-1 items-center"><Pencil size={14}/> Edit</button>}
                    {canDelete && <button onClick={()=>deleteDonation(d.id)} className="btn-red-small flex gap-1 items-center"><Trash2 size={14}/> Delete</button>}
                  </div>
                </div>
              ))}
            </section>

            <section className="premium-box">
              <h2 className="premium-title">Expense Records</h2>

              {filteredExpenses.map(e=>(
                <div key={e.id} className="premium-row">
                  <span className="text-sm sm:text-base break-words">
                    Voucher #{e.expenseSerialNo} • {e.title} • ₹{e.amount} • {e.category} • {e.description} • {e.date}
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    {canEdit && <button onClick={()=>setEditingExpense(e)} className="btn-blue flex gap-1 items-center"><Pencil size={14}/> Edit</button>}
                    {canDelete && <button onClick={()=>deleteExpense(e.id)} className="btn-red-small flex gap-1 items-center"><Trash2 size={14}/> Delete</button>}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SideItem({icon,text}:{icon:any;text:string}){
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/15 transition cursor-pointer">
      {icon}
      <span className="font-semibold">{text}</span>
    </div>
  );
}

function PremiumCard({icon,title,value,color}:any){
  return (
    <div className={`kpi-animate premium-card-hover rounded-[32px] p-6 text-white shadow-2xl bg-gradient-to-br ${color} hover:scale-[1.04] transition duration-300 relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="bg-white/20 p-3 rounded-2xl w-fit">{icon}</div>
        <p className="mt-7 text-white/80">{title}</p>
        <h2 className="text-3xl font-black mt-1">{value}</h2>
      </div>
    </div>
  );
}