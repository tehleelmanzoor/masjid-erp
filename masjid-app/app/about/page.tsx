"use client";
export default function AboutPage(){
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800 text-white p-4 sm:p-6">
      <section className="max-w-5xl mx-auto pt-8">
        <button onClick={() => history.back()} className="bg-white/15 px-5 py-3 rounded-2xl mb-6">
          ← Back
        </button>

        <div className="bg-white/15 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-[36px] p-6 sm:p-10">
          <div className="text-6xl mb-4">🕌</div>

          <h1 className="text-3xl sm:text-5xl font-black mb-4">
            About Markazi Jamia Masjid Abu Haneefa
          </h1>

          <p className="text-emerald-100 text-lg leading-8">
            Markazi Jamia Masjid Abu Haneefa was established with the vision of creating
            a peaceful place for worship, learning, unity, and community service.
            Since its foundation, the masjid has served as a spiritual center for
            daily prayers, Jumu’ah, Islamic education, and social welfare.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-white/10 rounded-3xl p-5">
              <h2 className="font-black text-xl mb-2">Our Mission</h2>
              <p className="text-emerald-100">
                To serve the community through prayer, guidance, education, and charity.
              </p>
            </div>

            <div className="bg-white/10 rounded-3xl p-5">
              <h2 className="font-black text-xl mb-2">Our Foundation</h2>
              <p className="text-emerald-100">
                Built by the support and dedication of local community members.
              </p>
            </div>

            <div className="bg-white/10 rounded-3xl p-5">
              <h2 className="font-black text-xl mb-2">Our Vision</h2>
              <p className="text-emerald-100">
                To build a strong, united, and responsible Muslim community.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-emerald-950/50 rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-3">Masjid History</h2>
            <p className="text-emerald-100 leading-8">
              From humble beginnings, the masjid became a place where people gather
              for worship, knowledge, and service. The committee and local residents
              continue to work together for the development, maintenance, and better
              management of the masjid.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}