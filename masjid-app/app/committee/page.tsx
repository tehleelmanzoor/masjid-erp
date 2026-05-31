"use client";
export default function CommitteePage(){
  const members = [
    { name:"Abdul Rahman", role:"President", img:"https://i.pravatar.cc/150?img=1" },
    { name:"Yousuf Khan", role:"Vice President", img:"https://i.pravatar.cc/150?img=2" },
    { name:"Imran Ali", role:"Secretary", img:"https://i.pravatar.cc/150?img=3" },
    { name:"Bilal Ahmad", role:"Treasurer", img:"https://i.pravatar.cc/150?img=4" },
    { name:"Faizan Mir", role:"Committee Member", img:"https://i.pravatar.cc/150?img=5" },
    { name:"Sajid Lone", role:"Committee Member", img:"https://i.pravatar.cc/150?img=6" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800 text-white p-4 sm:p-6">
      
      <section className="max-w-6xl mx-auto pt-8">
        <button
          onClick={() => history.back()}
          className="bg-white/15 px-5 py-3 rounded-2xl mb-6 hover:bg-white/25 transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl sm:text-5xl font-black text-center mb-10">
          Core Committee Members
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <div
              key={i}
              className="bg-white/15 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-[28px] p-6 text-center hover:scale-105 transition duration-300"
            >
              <img
                src={m.img}
                className="w-28 h-28 mx-auto rounded-full mb-4 border-4 border-white/30"
              />

              <h2 className="text-xl font-bold">{m.name}</h2>
              <p className="text-emerald-200 mt-1">{m.role}</p>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}