"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, UsersRound } from "lucide-react";

type Profile = {
  id:string;
  email:string;
  role:string;
};

export default function UsersPage(){
  const [profiles,setProfiles]=useState<Profile[]>([]);

  useEffect(()=>{ fetchProfiles(); },[]);

  async function fetchProfiles(){
    const { data,error } = await supabase
      .from("profiles")
      .select("*")
      .order("email",{ascending:true});

    if(error){ alert(error.message); return; }
    setProfiles(data || []);
  }

  async function updateRole(id:string,role:string){
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id",id);

    if(error){ alert(error.message); return; }

    alert("Role updated");
    fetchProfiles();
  }

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <button onClick={()=>window.location.href="/"} className="btn-blue flex gap-2 items-center mb-5">
          <ArrowLeft size={18}/> Back
        </button>

        <h1 className="text-3xl font-black text-emerald-950 flex gap-2 items-center">
          <UsersRound/> User Management
        </h1>
        <p className="text-gray-500 mt-1">Change user roles from here.</p>
      </section>

      <section className="premium-box">
        <h2 className="premium-title">Users</h2>

        {profiles.map(p=>(
          <div key={p.id} className="premium-row">
            <span className="break-words">
              <b>{p.email}</b><br/>
              Current Role: {p.role}
            </span>

            <select
              defaultValue={p.role}
              onChange={(e)=>updateRole(p.id,e.target.value)}
              className="input max-w-[220px]"
            >
              <option value="admin">admin</option>
              <option value="accountant">accountant</option>
              <option value="data_entry">data_entry</option>
              <option value="viewer">viewer</option>
            </select>
          </div>
        ))}
      </section>
    </main>
  );
}