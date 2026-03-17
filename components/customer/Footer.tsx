import Link from "next/link";

export default function CustomerFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8 px-4 md:px-10 lg:px-40">
      <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="h-14 w-auto flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/foodmohalla.png" alt="Food Mohalla" className="h-full w-auto object-contain" />
            </div>
            <span className="text-slate-900 text-xl font-extrabold">
              Food Mohalla Baramati
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Food Mohalla is the leading food delivery service dedicated to
            bringing you the best local flavors right to your doorstep.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined !text-lg">public</span>
            </a>
            <a
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined !text-lg">share</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-md">
          <h3 className="text-slate-900 font-bold">Contact Us</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-slate-400 text-lg">call</span>
               <p className="text-slate-500 text-sm font-medium">+91 80804 17538</p>
            </div>
            <div className="flex gap-2">
               <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
               <p className="text-slate-500 text-sm leading-relaxed">
                Shop No 30, Ground Floor, Subadhra Mall,<br />
                Behind 7th Heaven, Baramati MIDC,<br />
                Maharashtra 413133
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">
          © 2025 Food Mohalla. All rights reserved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
          <Link href="/admin" className="text-slate-400 hover:text-primary text-xs font-semibold transition-colors">
            Admin Panel
          </Link>
          <div className="hidden sm:block h-3 w-px bg-slate-200"></div>
          <p className="text-slate-500 text-xs font-medium">
            Developed by <span className="font-bold text-slate-800">Team ARK</span>
          </p>
        </div>
      </div>
    </footer>
  );
}