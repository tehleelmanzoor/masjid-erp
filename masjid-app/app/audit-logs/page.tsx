"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, ShieldCheck } from "lucide-react";

type AuditLog = {
  id:number;
  user_email:string;
  user_role:string;
  action:string;
  module:string;
  record_id:string;
  details:string;
  created_at:string;
};

export default function AuditLogsPage(){
  const [logs,setLogs]=useState<AuditLog[]>([]);

  useEffect(()=>{ fetchLogs(); },[]);

  async function fetchLogs(){
    const { data,error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("id",{ascending:false});

    if(error){
      alert(error.message);
      return;
    }

    setLogs(data || []);
  }

  return (
    <main className="min-h-screen bg-[#f3fbf6] luxury-grid p-3 sm:p-6 text-slate-900">
      <section className="premium-box mb-6">
        <button onClick={()=>window.location.href="/"} className="btn-blue flex gap-2 items-center mb-5">
          <ArrowLeft size={18}/> Back to Dashboard
        </button>

        <h1 className="text-3xl font-black text-emerald-950 flex gap-2 items-center">
          <ShieldCheck/> Audit Logs
        </h1>
        <p className="text-gray-500 mt-1">Track who added, edited, or deleted records.</p>
      </section>

      <section className="premium-box">
        <h2 className="premium-title">Activity History</h2>

        {logs.map(log=>(
          <div key={log.id} className="premium-row">
            <span className="text-sm sm:text-base break-words">
              <b>{log.action}</b> • {log.module} • Record #{log.record_id} • {log.details}
              <br/>
              <span className="text-gray-500">
                {log.user_email} • {log.user_role} • {new Date(log.created_at).toLocaleString()}
              </span>
            </span>
          </div>
        ))}

        {logs.length === 0 && (
          <p className="text-gray-500">No audit logs found.</p>
        )}
      </section>
    </main>
  );
}