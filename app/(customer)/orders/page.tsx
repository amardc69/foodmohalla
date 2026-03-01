"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";

export default function MyOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/orders");
    }
  }, [status, router]);

  const userId = (session?.user as any)?.id;
  const orders = useQuery(api.orders.getUserOrders, userId ? { userId } : "skip");

  if (status === "loading" || orders === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-4xl">receipt_long</span>
        My Orders
      </h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
           <span className="material-symbols-outlined text-6xl text-gray-300 block mb-3">production_quantity_limits</span>
           <h2 className="text-xl font-bold text-gray-600">No orders yet</h2>
           <p className="text-sm text-gray-400 mt-2">Looks like you haven't placed any orders.</p>
           <button onClick={() => router.push('/')} className="mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-full transition-colors">Start Discovering</button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border text-left border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-bold text-lg text-text-main">{order.displayId}</h2>
                  <p className="text-sm text-gray-400 font-medium">Placed {order.timeAgo}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'}
                  `}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold text-primary">{order.displayPrice}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Items summary</h3>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                       <span className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                       <span className="font-medium">{item.name}</span>
                       <span className="ml-auto text-gray-500">₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
                
                {order.items.length === 0 && <p className="text-sm text-gray-500 italic">No Items logged</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
