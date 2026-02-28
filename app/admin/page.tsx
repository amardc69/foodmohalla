"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const statusColors: Record<string, { bg: string; text: string; icon?: string }> = {
  Preparing: {
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  "Out for Delivery": {
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: "moped",
  },
  Delivered: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "check",
  },
  Pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: "hourglass_empty",
  },
};

export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  const data = useQuery(api.orders.getOrders, { search });
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  if (data === undefined) {
    return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  }

  const { orders, stats, total } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-text-muted mt-1">
            Manage your daily operations and track order status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              className="pl-10 pr-4 py-2 border-none ring-1 ring-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none shadow-sm"
              placeholder="Search orders..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary transition-colors shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: "attach_money",
            label: "Total Revenue (Delivered)",
            value: stats.totalRevenue,
          },
          {
            icon: "pending_actions",
            label: "Pending Orders",
            value: String(stats.pendingOrders),
          },
          {
            icon: "check_circle",
            label: "Delivered Today",
            value: String(stats.deliveredToday),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-text-main mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-main">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-text-muted font-semibold tracking-wide">
                <th className="px-6 py-4 rounded-tl-lg">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order: any) => {
                const sc = statusColors[order.status] || statusColors.Pending;
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-main">{order.displayId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center"
                          style={{ backgroundImage: `url('${order.customer.avatar}')` }}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-text-main">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-text-muted">{order.timeAgo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-main">
                      {order.displayPrice}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
