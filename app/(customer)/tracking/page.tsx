"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") as Id<"orders"> | null;

  // Use getOrderById if we have an orderId, otherwise fallback to latest
  const order = useQuery(
    api.orders.getOrderById,
    orderId ? { orderId: orderId } : "skip"
  );

  // Fallback: get latest order if no orderId
  const fallbackData = useQuery(
    api.orders.getOrders,
    orderId ? "skip" : {}
  );
  const displayOrder = orderId ? order : fallbackData?.orders?.[0];

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!displayOrder) return;

    const calculateTimeLeft = () => {
      // If it's delivered or rejected, freeze the timer visually or don't show it at all
      if (displayOrder.status === "Delivered" || displayOrder.status === "Rejected") {
        setTimeLeft(0);
        return;
      }

      // If missing critical timestamp data, default to an initial guestimate
      if (!displayOrder.acceptedAt || !displayOrder.adminTime) {
        setTimeLeft(25); 
        return;
      }

      const now = Date.now();
      const acceptedTime = displayOrder.acceptedAt;
      const estimatedDeliveryMS = displayOrder.adminTime * 60 * 1000;
      
      const targetTime = acceptedTime + estimatedDeliveryMS;
      const msLeft = targetTime - now;

      // Convert ms to minutes and stall at 2
      let minsLeft = Math.max(2, Math.ceil(msLeft / 60000));
      
      setTimeLeft(minsLeft);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // 1 minute interval

    return () => clearInterval(interval);
  }, [displayOrder]);

  if (displayOrder === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-4">
            <span className="material-symbols-outlined text-5xl">warning</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-main mb-2">
            Order Not Found
          </h1>
          <p className="text-text-muted text-lg">We could not locate this order.</p>
        </div>
      </div>
    );
  }

  // Determine step progress based on status
  const statusSteps = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
  const currentStepIndex = statusSteps.indexOf(displayOrder.status);

  const steps = [
    { icon: "receipt_long", label: "Order\nReceived", active: currentStepIndex >= 0 },
    { icon: "skillet", label: "Preparing\nFood", active: currentStepIndex >= 1 },
    { icon: "moped", label: "Out for\nDelivery", active: currentStepIndex >= 2, pulse: currentStepIndex === 2 },
    { icon: "home_pin", label: "Delivered", active: currentStepIndex >= 3 },
  ];

  const progressWidth = currentStepIndex >= 3 ? "100%" : `${(currentStepIndex / 3) * 100}%`;

  // Google Maps link — prioritize lat/lng
  const mapsLink = displayOrder.deliveryLat && displayOrder.deliveryLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${displayOrder.deliveryLat},${displayOrder.deliveryLng}`
    : displayOrder.deliveryAddress
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(displayOrder.deliveryAddress)}`
      : null;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-main mb-2">
          Order placed successfully!
        </h1>
        <p className="text-text-muted text-lg">
          Order {displayOrder.displayId}
          {displayOrder.status !== "Delivered" && displayOrder.status !== "Rejected" && timeLeft !== null && (
            <>
              {" "}• Estimated delivery in{" "}
              <span className="text-primary font-bold">{timeLeft} mins</span>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Status & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h3 className="text-lg font-bold text-text-main mb-8">Order Status</h3>
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full -z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full -z-0 transition-all duration-1000"
                style={{ width: progressWidth }}
              ></div>
              <div className="relative flex justify-between items-center z-10 w-full">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.active
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-gray-200 text-gray-400 border-2 border-white"
                      } ${step.pulse ? "animate-pulse" : ""}`}
                    >
                      <span className="material-symbols-outlined text-xl">{step.icon}</span>
                    </div>
                    <span
                      className={`text-xs md:text-sm text-center whitespace-pre-line ${
                        step.active ? "font-bold text-primary" : "font-medium text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <p className="text-sm text-text-main">
                {displayOrder.status === "Pending" && "Your order has been received and will be prepared shortly."}
                {displayOrder.status === "Preparing" && "Your order is being prepared by the restaurant. Hang tight!"}
                {displayOrder.status === "Out for Delivery" && "Your order is on the way! Your delivery partner is heading towards your location."}
                {displayOrder.status === "Delivered" && "Your order has been delivered. Enjoy your meal!"}
                {displayOrder.status === "Rejected" && "Unfortunately, your order was rejected by the restaurant."}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-96 relative map-pattern group">
            <div className="absolute inset-0 opacity-50 pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full h-4 bg-gray-300 transform -rotate-12 translate-y-10"></div>
              <div className="absolute top-0 right-1/3 h-full w-4 bg-gray-300 transform rotate-12"></div>
            </div>
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center transition-all duration-1000">
              <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1 whitespace-nowrap">
                Delivery Partner
              </div>
              <div className="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white relative">
                <span className="material-symbols-outlined">moped</span>
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25"></div>
              </div>
            </div>
            <div className="absolute bottom-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1 whitespace-nowrap">
                Home
              </div>
              <div className="text-red-500 drop-shadow-md">
                <span className="material-symbols-outlined text-5xl">location_on</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg text-xs font-medium text-text-muted">
              Live Tracking
            </div>
          </div>

          {/* Order Summary — Dynamic */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text-main">Order Summary</h3>
              <span className="text-sm text-text-muted">{displayOrder.items.length} Item{displayOrder.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {displayOrder.items.map((item: any, i: number) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">restaurant</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-main">{item.name}</p>
                      {item.addons && item.addons.length > 0 && (
                        <p className="text-xs text-text-muted">{item.addons.map((a: any) => a.name).join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-main">x{item.quantity}</p>
                    <p className="text-sm text-text-muted">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-text-main">Total Paid</span>
              <span className="font-bold text-xl text-primary">₹{displayOrder.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Delivery Info & Support */}
        <div className="space-y-6">
          {/* Delivery Address */}
          {displayOrder.deliveryAddress && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
                Delivery Address
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-sm text-text-main leading-relaxed">
                    {displayOrder.deliveryFlat ? `${displayOrder.deliveryFlat}, ` : ""}
                    {displayOrder.deliveryAddress}
                  </p>
                  {displayOrder.deliveryLandmark && (
                    <p className="text-xs text-text-muted mt-1">Landmark: {displayOrder.deliveryLandmark}</p>
                  )}
                  {displayOrder.deliveryLat && displayOrder.deliveryLng && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {displayOrder.deliveryLat.toFixed(6)}, {displayOrder.deliveryLng.toFixed(6)}
                    </p>
                  )}
                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-200"
                    >
                      <span className="material-symbols-outlined text-[16px]">directions</span>
                      View Directions
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Restaurant */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
              Restaurant
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <h4 className="font-bold text-text-main">Food Mohalla Kitchen</h4>
                <p className="text-sm text-text-muted mt-1">
                  123 Food Street, Mohalla District, City Center
                </p>
                <button className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">call</span>
                  Contact Restaurant
                </button>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">support_agent</span>
              <div>
                <h4 className="font-bold text-text-main mb-1">Need Help?</h4>
                <p className="text-sm text-text-muted mb-3">
                  Having trouble with your order? Our support team is here to help you.
                </p>
                <a className="text-sm font-bold text-blue-600 hover:underline" href="#">
                  Get Support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
