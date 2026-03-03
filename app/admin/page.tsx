"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      body{font-family:system-ui,sans-serif;padding:24px;max-width:380px;margin:auto}
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
    <p><strong>Customer:</strong> ${order.customer.name}${order.customerUsername ? ` (@${order.customerUsername})` : ""}</p>
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
  const [statsPeriod, setStatsPeriod] = useState("today");
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

  const data = useQuery(api.orders.getOrders, { search, statusFilter, statsPeriod });
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
      if (notifSound === "dong") playDong();
      else playTing();
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
    if (newOrderQueue.length <= 1) setShowNewOrderDialog(false);
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
    if (newOrderQueue.length <= 1) setShowNewOrderDialog(false);
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
              placeholder="Search by name, username, order..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Period Selector + Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {(["today", "week", "all"] as const).map((p) => {
            const labels: Record<string, string> = { today: "Today", week: "This Week", all: "All Time" };
            return (
              <button
                key={p}
                onClick={() => setStatsPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statsPeriod === p
                    ? "bg-text-main text-white shadow-sm"
                    : "bg-white text-text-muted border border-gray-200 hover:border-gray-300"
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "attach_money", label: `Revenue (${statsPeriod === "today" ? "Today" : statsPeriod === "week" ? "This Week" : "All Time"})`, value: stats.totalRevenue, gradient: "from-emerald-500 to-green-600" },
            { icon: "pending_actions", label: `Pending Orders`, value: String(stats.pendingOrders), gradient: "from-amber-500 to-orange-600" },
            { icon: "check_circle", label: `Delivered (${statsPeriod === "today" ? "Today" : statsPeriod === "week" ? "This Week" : "All Time"})`, value: String(stats.deliveredToday), gradient: "from-blue-500 to-indigo-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                          <p className="text-sm font-medium text-text-main">{order.customer.name}</p>
                          {order.customerUsername && (
                            <p className="text-xs text-text-muted">@{order.customerUsername}</p>
                          )}
                          {!order.customerUsername && (
                            <p className="text-xs text-text-muted">{order.timeAgo}</p>
                          )}
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
                      {showStatusMenu === order._id && (
                        <div className="absolute z-30 top-full mt-1 left-4 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                          {statusFlow.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order._id, s)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${order.status === s ? "font-bold text-primary" : "text-gray-700"}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusColors[s]?.bg} border ${order.status === s ? "border-primary" : "border-gray-300"}`}></span>
                              {s}
                              {order.status === s && <span className="material-symbols-outlined text-primary text-[16px] ml-auto">check</span>}
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
                    <td className="px-6 py-4 font-medium text-text-main">{order.displayPrice}</td>
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

      {/* ─── ORDER DETAIL DIALOG (shadcn) ─────────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg">{selectedOrder?.displayId}</DialogTitle>
                <DialogDescription>{selectedOrder?.timeAgo}</DialogDescription>
              </div>
              {selectedOrder && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[selectedOrder.status]?.bg} ${statusColors[selectedOrder.status]?.text}`}>
                  {selectedOrder.status}
                </span>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="px-6 py-5 space-y-5">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${selectedOrder.customer.avatar}')` }}
                ></div>
                <div>
                  <p className="font-semibold text-sm">{selectedOrder.customer.name}</p>
                  {selectedOrder.customerUsername && (
                    <p className="text-xs text-muted-foreground">@{selectedOrder.customerUsername}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Items</h4>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{selectedOrder.paymentMethod || "N/A"}</span>
                </div>
                {selectedOrder.appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({selectedOrder.appliedCoupon})</span>
                    <span>−₹{(selectedOrder.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-primary">{selectedOrder.displayPrice}</span>
                </div>
              </div>

              {/* Address */}
              {selectedOrder.deliveryAddress && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 dark:bg-blue-950/20 dark:border-blue-900">
                    <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                      {selectedOrder.deliveryFlat ? `${selectedOrder.deliveryFlat}, ` : ""}
                      {selectedOrder.deliveryAddress}
                    </p>
                    {selectedOrder.deliveryLandmark && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Landmark: {selectedOrder.deliveryLandmark}</p>
                    )}
                    {getMapsLink(selectedOrder) && (
                      <a
                        href={getMapsLink(selectedOrder)!}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors font-medium border border-blue-200 mt-2.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">directions</span>
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {selectedOrder.status === "Rejected" && selectedOrder.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 dark:bg-red-950/20 dark:border-red-900">
                  <h4 className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">Rejection Reason</h4>
                  <p className="text-sm text-red-700 dark:text-red-200">{selectedOrder.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <Button variant="outline" size="sm" onClick={() => selectedOrder && printOrder(selectedOrder)}>
              <span className="material-symbols-outlined text-[16px] mr-1.5">print</span>
              Print
            </Button>
            <Button size="sm" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── NEW ORDER NOTIFICATION DIALOG (shadcn) ───────────────────────── */}
      <Dialog open={showNewOrderDialog && !!currentNewOrder} onOpenChange={(open) => { if (!open) { setShowNewOrderDialog(false); setShowRejectForm(false); setRejectReason(""); } }}>
        <DialogContent className="sm:max-w-[440px] gap-0 p-0" showCloseButton={false}>
          {/* Custom gradient header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined text-white text-2xl">notifications_active</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">New Order!</h3>
                <p className="text-amber-100 text-xs">{currentNewOrder?.displayId} • {currentNewOrder?.timeAgo}</p>
              </div>
            </div>
            {newOrderQueue.length > 1 && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                {newOrderQueue.length} pending
              </span>
            )}
          </div>

          {currentNewOrder && (
            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${currentNewOrder.customer.avatar}')` }}
                ></div>
                <div>
                  <p className="font-semibold text-sm">{currentNewOrder.customer.name}</p>
                  {currentNewOrder.customerUsername && (
                    <p className="text-xs text-muted-foreground">@{currentNewOrder.customerUsername}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                {currentNewOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-1 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{currentNewOrder.displayPrice}</span>
                </div>
              </div>

              {/* Address */}
              {currentNewOrder.deliveryAddress && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                  <p className="text-blue-900 leading-relaxed">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>
                    {currentNewOrder.deliveryFlat ? `${currentNewOrder.deliveryFlat}, ` : ""}
                    {currentNewOrder.deliveryAddress}
                  </p>
                  {getMapsLink(currentNewOrder) && (
                    <a href={getMapsLink(currentNewOrder)!} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1 inline-flex items-center gap-1">
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
                    className="w-full p-3 border border-red-200 rounded-lg text-sm bg-red-50 focus:ring-2 focus:ring-red-400 outline-none resize-none"
                    rows={2}
                    placeholder="Reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowRejectForm(false); setRejectReason(""); }}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={handleRejectNewOrder} disabled={!rejectReason.trim()}>
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!showRejectForm && (
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setShowRejectForm(true)}>
                    Reject
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleAcceptNewOrder}>
                    <span className="material-symbols-outlined text-[18px] mr-1">check</span>
                    Accept Order
                  </Button>
                </div>
              )}

              {/* Next order button */}
              {newOrderQueue.length > 1 && !showRejectForm && (
                <Button variant="ghost" className="w-full" onClick={handleSkipToNext}>
                  Next Order
                  <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
                    +{newOrderQueue.length - 1} more
                  </span>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Click-away handler for status menu */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowStatusMenu(null)} />
      )}
    </div>
  );
}
