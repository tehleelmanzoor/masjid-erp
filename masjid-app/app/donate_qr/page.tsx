"use client";
export default function DonateQRPage(){
  const upiId = "yourupi@bank";

  function copyUPI(){
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800 text-white p-4 sm:p-6">
      
      <section className="max-w-4xl mx-auto pt-8">
        
        <button
          onClick={() => history.back()}
          className="bg-white/15 px-5 py-3 rounded-2xl mb-6 hover:bg-white/25 transition"
        >
          ← Back
        </button>

        <div className="bg-white/15 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-[36px] p-6 sm:p-10 text-center">

          <div className="text-6xl mb-4">🕌</div>

          <h1 className="text-3xl sm:text-5xl font-black mb-4">
            Donate to Marzaki Jamia Masjid Abu Haneefa
          </h1>

          <p className="text-emerald-100 mb-8">
            Support the masjid via UPI or bank transfer
          </p>

          {/* QR */}
          <div className="bg-white rounded-3xl p-5 w-fit mx-auto mb-6 shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${upiId}&pn=Jamia%20Masjid%20Abu%20Haneefa`}
              className="w-56 h-56 sm:w-64 sm:h-64"
            />
          </div>

          <p className="text-emerald-100 mb-4">
            Scan QR to donate instantly
          </p>

          {/* UPI ID */}
          <div className="bg-white/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-semibold">{upiId}</span>
            <button
              onClick={copyUPI}
              className="bg-white text-emerald-950 px-4 py-2 rounded-xl font-bold"
            >
              Copy UPI ID
            </button>
          </div>

          {/* Bank Details */}
          <div className="bg-emerald-950/50 rounded-3xl p-6 text-left max-w-xl mx-auto">
            <h2 className="text-2xl font-black mb-4">Bank Details</h2>

            <div className="space-y-2 text-emerald-100">
              <p><b>Account Name:</b> MarkaziJamia Masjid Abu Haneefa</p>
              <p><b>Account No:</b> 1234567890</p>
              <p><b>IFSC:</b> SBIN000000</p>
              <p><b>Bank:</b> State Bank of India</p>
              <p><b>Branch:</b> Your Branch Name</p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}