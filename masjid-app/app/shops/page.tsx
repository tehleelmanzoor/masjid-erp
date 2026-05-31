"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Shop = {
  id: number;
  shopName: string;
  tenantName: string;
  phone: string;
  monthlyRent: number;
  agreementStart: string;
  agreementEnd: string;
  agreementFileUrl: string;
  notes: string;
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  async function fetchShops() {
    const { data } = await supabase.from("shops").select("*").order("id", { ascending: false });
    setShops(data || []);
  }

  async function uploadFile() {
    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("shop-agreements")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("shop-agreements")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  }

  async function addShop(formData: FormData) {
    const fileUrl = await uploadFile();

    const { error } = await supabase.from("shops").insert({
      shopName: formData.get("shopName"),
      tenantName: formData.get("tenantName"),
      phone: formData.get("phone"),
      monthlyRent: Number(formData.get("monthlyRent")),
      agreementStart: formData.get("agreementStart"),
      agreementEnd: formData.get("agreementEnd"),
      agreementFileUrl: fileUrl,
      notes: formData.get("notes"),
    });

    if (error) {
      alert(error.message);
      return;
    }

    fetchShops();
  }

  return (
    <main className="p-6 min-h-screen bg-[#f3fbf6]">
      <h1 className="text-3xl font-black mb-6">Shops Management</h1>

      {/* ADD SHOP */}
      <div className="premium-box mb-8">
        <h2 className="premium-title">Add Shop</h2>

        <form action={addShop} className="space-y-3">
          <input name="shopName" placeholder="Shop Name" required className="input"/>
          <input name="tenantName" placeholder="Tenant Name" required className="input"/>
          <input name="phone" placeholder="Phone" className="input"/>
          <input name="monthlyRent" type="number" placeholder="Monthly Rent" className="input"/>

          <input name="agreementStart" type="date" className="input"/>
          <input name="agreementEnd" type="date" className="input"/>

          {/* FILE UPLOAD */}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="input"
          />

          <textarea name="notes" placeholder="Notes" className="input"/>

          <button className="btn-green w-full">Save Shop</button>
        </form>
      </div>

      {/* LIST */}
      <div className="premium-box">
        <h2 className="premium-title">All Shops</h2>

        {shops.map((s) => (
          <div key={s.id} className="premium-row">
            <div>
              <p className="font-semibold">{s.shopName}</p>
              <p>Tenant: {s.tenantName}</p>
              <p>Rent: ₹{s.monthlyRent}</p>
              <p>Agreement: {s.agreementStart} → {s.agreementEnd}</p>
            </div>

            <div>
              {s.agreementFileUrl && (
                <a
                  href={s.agreementFileUrl}
                  target="_blank"
                  className="btn-blue"
                >
                  View PDF
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}