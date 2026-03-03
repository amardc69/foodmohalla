"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/* ─── Status configuration ────────────────────────────────────────────────── */
const STATUS_LIST = ["All", "Pending", "Preparing", "Out for Delivery", "Delivered", "Rejected"] as const;

const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  Preparing: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
  "Out for Delivery": { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-200" },
  Delivered: { bg: "bg-green-50", text: "text-green-600", ring: "ring-green-200" },
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200" },
  Rejected: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
};

const statusFlow = ["Pending", "Preparing", "Out for Delivery", "Delivered"];

/* ─── Sound helpers (Web Audio API) ───────────────────────────────────────── */
function playTing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

function playDong() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch { /* ignore */ }
}

/* ─── Print helper ────────────────────────────────────────────────────────── */
function printOrder(order: any) {
  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) return;
  w.document.write(`
    <html><head><title>Order ${order.displayId}</title>
    <style>
      body{font-family:sans-serif;padding:24px;max-width:380px;margin:auto}
      h1{font-size:20px;margin:0 0 4px}
      .meta{color:#888;font-size:12px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th,td{text-align:left;padding:6px 4px;border-bottom:1px solid #eee;font-size:13px}
      th{font-size:11px;text-transform:uppercase;color:#888}
      .total{font-weight:bold;font-size:15px;border-top:2px solid #333;padding-top:8px}
      .addr{background:#f5f5f5;padding:10px;border-radius:6px;margin:10px 0;font-size:12px;line-height:1.5}
      .footer{text-align:center;font-size:10px;color:#aaa;margin-top:20px}
    </style></head><body>
    <h1>Food Mohalla</h1>
    <p class="meta">Order ${order.displayId} • ${order.timeAgo}</p>
    <p><strong>Customer:</strong> ${order.customer.name}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod || "N/A"}</p>
    ${order.deliveryAddress ? `<div class="addr"><strong>Address:</strong><br>${order.deliveryFlat ? order.deliveryFlat + ", " : ""}${order.deliveryAddress}${order.deliveryLandmark ? "<br>Landmark: " + order.deliveryLandmark : ""}</div>` : ""}
    <table>
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${order.items.map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${(i.price * i.quantity).toFixed(2)}</td></tr>`).join("")}
    </table>
    <p class="total">Total: ${order.displayPrice}</p>
    ${order.appliedCoupon ? `<p style="font-size:12px;color:#16a34a">Coupon: ${order.appliedCoupon} (−₹${(order.discountAmount || 0).toFixed(2)})</p>` : ""}
    <p class="footer">Thank you for ordering from Food Mohalla!</p>
    </body></html>
  `);
  w.document.close();
  w.print();
}

/* ─── Google Maps link helper ─────────────────────────────────────────────── */
function getMapsLink(order: any): string | null {
  if (order.deliveryLat && order.deliveryLng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`;
  }
  if (order.deliveryAddress) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`;
  }
  return null;
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  // New order notification state
  const [newOrderQueue, setNewOrderQueue] = useState<any[]>([]);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Ref for tracking known order IDs
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const data = useQuery(api.orders.getOrders, { search, statusFilter });
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const acceptOrderMutation = useMutation(api.orders.acceptOrder);
  const rejectOrderMutation = useMutation(api.orders.rejectOrder);

  // Notification sound preference
  const soundPref = useQuery(api.adminSettings.getSetting, { key: "notificationSound" });
  const notifSound = soundPref ?? "ting";

  // Detect new orders
  useEffect(() => {
    if (!data) return;
    const currentIds = new Set(data.orders.map((o: any) => o._id));

    if (isFirstLoad.current) {
      knownOrderIds.current = currentIds;
      isFirstLoad.current = false;
      return;
    }

    const newOrders = data.orders.filter(
      (o: any) => o.status === "Pending" && !knownOrderIds.current.has(o._id)
    );

    if (newOrders.length > 0) {
      setNewOrderQueue((prev) => [...prev, ...newOrders]);
      setShowNewOrderDialog(true);
      // Play sound
      if (notifSound === "dong") {
        playDong();
      } else {
        playTing();
      }
    }

    knownOrderIds.current = currentIds;
  }, [data, notifSound]);

  const currentNewOrder = newOrderQueue[0];

  const handleAcceptNewOrder = useCallback(async () => {
    if (!currentNewOrder) return;
    await acceptOrderMutation({ orderId: currentNewOrder._id as Id<"orders"> });
    setNewOrderQueue((prev) => prev.slice(1));
    setShowRejectForm(false);
    setRejectReason("");
    if (newOrderQueue.length <= 1) {
      setShowNewOrderDialog(false);
    }
  }, [currentNewOrder, acceptOrderMutation, newOrderQueue.length]);

  const handleRejectNewOrder = useCallback(async () => {
    if (!currentNewOrder || !rejectReason.trim()) return;
    await rejectOrderMutation({
      orderId: currentNewOrder._id as Id<"orders">,
      reason: rejectReason,
    });
    setNewOrderQueue((prev) => prev.slice(1));
    setShowRejectForm(false);
    setRejectReason("");
    if (newOrderQueue.length <= 1) {
      setShowNewOrderDialog(false);
    }
  }, [currentNewOrder, rejectReason, rejectOrderMutation, newOrderQueue.length]);

  const handleSkipToNext = useCallback(() => {
    setNewOrderQueue((prev) => [...prev.slice(1), prev[0]]);
    setShowRejectForm(false);
    setRejectReason("");
  }, []);

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      await updateStatus({ orderId: orderId as Id<"orders">, status: newStatus });
      setShowStatusMenu(null);
      // Refresh selected order if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : prev);
      }
    },
    [updateStatus, selectedOrder]
  );

  if (data === undefined) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3">Loading orders...</p>
      </div>
    );
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: "attach_money",
            label: "Total Revenue (Delivered)",
            value: stats.totalRevenue,
            gradient: "from-emerald-500 to-green-600",
          },
          {
            icon: "pending_actions",
            label: "Pending Orders",
            value: String(stats.pendingOrders),
            gradient: "from-amber-500 to-orange-600",
          },
          {
            icon: "check_circle",
            label: "Delivered Today",
            value: String(stats.deliveredToday),
            gradient: "from-blue-500 to-indigo-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 bg-gradient-to-br ${stat.gradient} rounded-lg text-white shadow-sm`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-text-main mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Tray */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_LIST.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              statusFilter === s
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-text-muted border border-gray-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 text-xs opacity-80">
                ({orders.filter((o: any) => s === statusFilter ? true : o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-main">
            Orders {statusFilter !== "All" ? `— ${statusFilter}` : ""}
          </h3>
          <span className="text-sm text-text-muted">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-text-muted font-semibold tracking-wide">
                <th className="px-6 py-4 rounded-tl-lg">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4 rounded-tr-lg text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => {
                const sc = statusColors[order.status] || statusColors.Pending;
                return (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-main">{order.displayId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center flex-shrink-0"
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
                      <p className="text-sm text-text-muted max-w-[200px] truncate">{order.itemsSummary}</p>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStatusMenu(showStatusMenu === order._id ? null : order._id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${sc.bg} ${sc.text} ${sc.ring} hover:shadow-sm transition-all cursor-pointer`}
                      >
                        {order.status}
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                      </button>
                      {/* Status dropdown */}
                      {showStatusMenu === order._id && (
                        <div className="absolute z-30 top-full mt-1 left-4 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statusFlow.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order._id, s)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                order.status === s ? "font-bold text-primary" : "text-gray-700"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusColors[s]?.bg?.replace("bg-", "bg-")} border ${order.status === s ? "border-primary" : "border-gray-300"}`}></span>
                              {s}
                              {order.status === s && (
                                <span className="material-symbols-outlined text-primary text-[16px] ml-auto">check</span>
                              )}
                            </button>
                          ))}
                          <hr className="my-1" />
                          <button
                            onClick={() => handleStatusChange(order._id, "Rejected")}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-100 border border-red-300"></span>
                            Rejected
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-main">
                      {order.displayPrice}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => printOrder(order)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Print Order"
                      >
                        <span className="material-symbols-outlined text-[20px]">print</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">inbox</span>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-text-main">{selectedOrder.displayId}</h3>
                <p className="text-sm text-text-muted">{selectedOrder.timeAgo}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedOrder.customer.avatar}')` }}
                ></div>
                <div>
                  <p className="font-semibold text-text-main">{selectedOrder.customer.name}</p>
                  <p className="text-xs text-text-muted">Customer</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${statusColors[selectedOrder.status]?.bg} ${statusColors[selectedOrder.status]?.text}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-text-muted">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Payment Method</span>
                  <span className="font-medium capitalize">{selectedOrder.paymentMethod || "N/A"}</span>
                </div>
                {selectedOrder.appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({selectedOrder.appliedCoupon})</span>
                    <span>−₹{(selectedOrder.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{selectedOrder.displayPrice}</span>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Delivery Address</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {selectedOrder.deliveryFlat ? `${selectedOrder.deliveryFlat}, ` : ""}
                      {selectedOrder.deliveryAddress}
                    </p>
                    {selectedOrder.deliveryLandmark && (
                      <p className="text-xs text-blue-700 mt-1">Landmark: {selectedOrder.deliveryLandmark}</p>
                    )}
                    {getMapsLink(selectedOrder) && (
                      <a
                        href={getMapsLink(selectedOrder)!}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-200 mt-3"
                      >
                        <span className="material-symbols-outlined text-[16px]">directions</span>
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {selectedOrder.status === "Rejected" && selectedOrder.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-red-800 mb-1">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{selectedOrder.rejectionReason}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => printOrder(selectedOrder)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-text-muted hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Print Order
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg transition-colors text-sm shadow-sm shadow-primary/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Notification Dialog */}
      {showNewOrderDialog && currentNewOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in">
            {/* Header with pulse */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined text-white text-2xl">notifications_active</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">New Order!</h3>
                  <p className="text-amber-100 text-xs">{currentNewOrder.displayId} • {currentNewOrder.timeAgo}</p>
                </div>
              </div>
              {newOrderQueue.length > 1 && (
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {newOrderQueue.length} pending
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url('${currentNewOrder.customer.avatar}')` }}
                ></div>
                <div>
                  <p className="font-semibold text-text-main">{currentNewOrder.customer.name}</p>
                  <p className="text-xs text-text-muted">Customer</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                {currentNewOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="text-text-muted">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{currentNewOrder.displayPrice}</span>
                </div>
              </div>

              {/* Address */}
              {currentNewOrder.deliveryAddress && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>
                    {currentNewOrder.deliveryFlat ? `${currentNewOrder.deliveryFlat}, ` : ""}
                    {currentNewOrder.deliveryAddress}
                  </p>
                  {getMapsLink(currentNewOrder) && (
                    <a
                      href={getMapsLink(currentNewOrder)!}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1 inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">directions</span>
                      Open in Maps
                    </a>
                  )}
                </div>
              )}

              {/* Reject form */}
              {showRejectForm && (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-3 border border-red-200 rounded-lg text-sm bg-red-50 focus:ring-2 focus:ring-red-300 focus:border-red-300 outline-none resize-none"
                    rows={2}
                    placeholder="Reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectNewOrder}
                      disabled={!rejectReason.trim()}
                      className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!showRejectForm && (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-2.5 rounded-lg border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptNewOrder}
                    className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors shadow-sm shadow-green-500/30 flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Accept Order
                  </button>
                </div>
              )}

              {/* Next order button */}
              {newOrderQueue.length > 1 && !showRejectForm && (
                <button
                  onClick={handleSkipToNext}
                  className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-text-muted hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  Next Order
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">
                    +{newOrderQueue.length - 1} more
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click-away handler for status menu */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowStatusMenu(null)} />
      )}

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-in {
          animation: animate-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
