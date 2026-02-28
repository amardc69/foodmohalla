"use client";

export default function InventoryPage() {
  return (
    <div className="relative max-w-7xl mx-auto min-h-[60vh] flex flex-col">
      {/* Blurred background content */}
      <div className="flex-1 space-y-8 blur-sm select-none opacity-40 pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
              Inventory
            </h2>
            <p className="text-text-muted mt-1">
              Manage your raw ingredients and stock availability.
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg pointer-events-none">
            + Add Stock
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-96 flex flex-col">
          <div className="h-14 border-b border-gray-200 bg-gray-50/50"></div>
          <div className="flex-1 p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
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
