"use client";

export default function AccountPage() {
  return (
    <div className="relative max-w-7xl mx-auto min-h-[60vh] flex flex-col">
      {/* Blurred background content */}
      <div className="flex-1 space-y-8 blur-sm select-none opacity-40 pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
              Account Profile
            </h2>
            <p className="text-text-muted mt-1">
              Manage your personal admin account and profile details.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-96 flex flex-col p-6">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                 <div className="h-6 w-48 bg-gray-100 rounded"></div>
                 <div className="h-4 w-32 bg-gray-100 rounded"></div>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="h-12 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
           </div>
        </div>
      </div>
      
      {/* Watermark Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white/80 backdrop-blur-md px-10 py-8 rounded-3xl shadow-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transform -rotate-6">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-3">lock</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-widest uppercase text-center drop-shadow-sm">
            Not Enabled
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-widest text-center">
            Module restricted
          </p>
        </div>
      </div>
    </div>
  );
}
