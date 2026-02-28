import CustomerHeader from "@/components/customer/Header";
import CustomerFooter from "@/components/customer/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background-light text-slate-900 font-display min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <CustomerHeader />
          <main className="flex-1">{children}</main>
          <CustomerFooter />
        </div>
      </div>
    </div>
  );
}
