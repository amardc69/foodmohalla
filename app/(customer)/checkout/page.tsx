"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useCartUserId } from "@/lib/useGuestId";
import { DELIVERY_FEE, TAX_RATE } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession();
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout");
    }
  }, [status, router]);

  const userId = useCartUserId(session);
  const cartQuery = useQuery(api.cart.getCart, userId ? { userId } : "skip");
  const total = useQuery(api.cart.getCartTotal, userId ? { userId } : "skip") || 0;
  
  const cart = cartQuery || [];

  const updateCartItem = useMutation(api.cart.updateCartItem);
  const clearCart = useMutation(api.cart.clearCart);
  const createOrder = useMutation(api.orders.createOrder);

  const authUserId = (session?.user as any)?.id;
  const dbUser = useQuery(api.users.currentUser, authUserId ? { authProviderId: authUserId } : "skip");
  
  const addressesDb = useQuery(api.addresses.getAddresses, authUserId ? { userId: authUserId } : "skip") || [];
  const selectAddressMutation = useMutation(api.addresses.selectAddress);
  
  const selectedAddress = addressesDb.find((a: any) => a.isSelected) || addressesDb[0];

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isPlacing, setIsPlacing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  
  // Custom Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newFlat, setNewFlat] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("Home");
  const [newLat, setNewLat] = useState<number | undefined>(undefined);
  const [newLng, setNewLng] = useState<number | undefined>(undefined);

  const convex = useConvex();
  const addAddressMutation = useMutation(api.addresses.addAddress);

  const freeDeliveryEnabled = useQuery(api.adminSettings.getSetting, { key: "freeDeliveryEnabled" }) === "true";
  const freeDeliveryThreshold = Number(useQuery(api.adminSettings.getSetting, { key: "freeDeliveryThreshold" }) || 0);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  async function updateQuantity(cartItemId: any, quantity: number) {
    await updateCartItem({ cartItemId, quantity });
  }

  async function handleApplyCoupon() {
    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    try {
      const result = await convex.query(api.offers.validateOffer, {
        code: coupon,
        cartTotal: total,
      });

      if (result.valid && result.offer) {
        setAppliedCoupon(result.offer);
        setCouponError("");
        
        let calculatedDiscount = 0;
        if (result.offer.discountType === "percentage") {
          calculatedDiscount = (total * result.offer.discountValue) / 100;
        } else {
          calculatedDiscount = result.offer.discountValue;
        }
        
        if (result.offer.maxDiscount && calculatedDiscount > result.offer.maxDiscount) {
          calculatedDiscount = result.offer.maxDiscount;
        }
        
        setDiscountAmount(calculatedDiscount);
      } else {
        setCouponError(result.error || "Invalid coupon");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (e) {
      setCouponError("Failed to apply coupon");
    }
  }

  function handleRemoveCoupon() {
    setCoupon("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError("");
  }

  function handleGetLocation() {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setNewLat(latitude);
          setNewLng(longitude);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addressString = data.display_name || "Current Location";
          setNewAddress(addressString);
        } catch (error) {
          setLocationError("Failed to fetch address");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setLocationError("Failed to get your location");
        setIsGettingLocation(false);
      }
    );
  }

  async function handleSaveNewAddress() {
    if (!newAddress.trim()) {
       setLocationError("Please enter or fetch an address");
       return;
    }
    if (!authUserId) {
       setLocationError("Please log in to save address");
       return;
    }
    await addAddressMutation({
      userId: authUserId,
      label: newLabel,
      icon: newLabel === "Home" ? "home" : newLabel === "Work" ? "work" : "location_on",
      address: newAddress,
      flat: newFlat,
      landmark: newLandmark,
      lat: newLat,
      lng: newLng,
      deliveryTime: "30-40 mins",
      isSelected: true,
    });
    // Reset form
    setShowAddressForm(false);
    setNewAddress("");
    setNewFlat("");
    setNewLandmark("");
    setNewLabel("Home");
    setNewLat(undefined);
    setNewLng(undefined);
  }

  // Compute addon total for a single cart item
  function getItemTotal(item: any): number {
    let addonSum = 0;
    if (item.addons && item.addons.length > 0) {
      addonSum = item.addons.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
    }
    return (item.menuItem.price + addonSum) * item.quantity;
  }

  const currentDeliveryFee = freeDeliveryEnabled && total >= freeDeliveryThreshold ? 0 : DELIVERY_FEE;
  const grandTotal = total + currentDeliveryFee + TAX_RATE - discountAmount;

  async function placeOrder() {
    if (!userId || cart.length === 0) return;
    setIsPlacing(true);
    
    const formattedItems = cart.map((c: any) => ({
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      quantity: c.quantity,
      price: c.menuItem.price,
      selectedSize: c.selectedSize,
      addons: c.addons || [],
      instructions: c.instructions || [],
    }));
    
    const orderId = await createOrder({
      items: formattedItems,
      totalPrice: grandTotal,
      userId: (session?.user as any)?.id || userId,
      paymentMethod: selectedPayment,
      appliedCoupon: appliedCoupon?.code,
      discountAmount: discountAmount,
      deliveryAddress: selectedAddress?.address,
      deliveryLat: selectedAddress?.lat,
      deliveryLng: selectedAddress?.lng,
      deliveryFlat: selectedAddress?.flat,
      deliveryLandmark: selectedAddress?.landmark,
      customerPhone: dbUser?.phone,
    });
    
    await clearCart({ userId });
    
    setTimeout(() => {
      router.push(`/tracking?order=${orderId}`);
    }, 1000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Address & Payment */}
        <div className="lg:w-2/3 space-y-6">
          {/* Delivery Address — fetched from Convex */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <h2 className="text-lg font-bold text-text-main">Delivery Address</h2>
              </div>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                {showAddressForm ? "Cancel" : "+ Add New Address"}
              </button>
            </div>
            {locationError && <p className="text-xs text-red-500 mb-4 px-1">{locationError}</p>}
            
            {selectedAddress && !showAddressForm && (
               <div className="mb-6">
                 {selectedAddress.lat && selectedAddress.lng ? (
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAddress.lat},${selectedAddress.lng}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors font-medium border border-blue-200"
                   >
                     <span className="material-symbols-outlined text-[18px]">directions</span>
                     View Directions
                   </a>
                 ) : (
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedAddress.address)}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors font-medium border border-blue-200"
                   >
                     <span className="material-symbols-outlined text-[18px]">directions</span>
                     View Directions
                   </a>
                 )}
               </div>
            )}

            {showAddressForm ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-text-main">Add New Address</h3>
                  <button onClick={handleGetLocation} disabled={isGettingLocation} className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50 hover:bg-primary-dark transition-colors">
                    <span className="material-symbols-outlined text-[14px]">my_location</span>
                    {isGettingLocation ? "Locating..." : "Get Auto Location"}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1 font-medium">Street Address / Locality</label>
                    <textarea 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary resize-none" 
                      rows={2}
                      placeholder="Street, area, city..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1 font-medium">Flat / House / Building No.</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary" 
                        placeholder="e.g. Flat 402, Building A"
                        value={newFlat}
                        onChange={(e) => setNewFlat(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1 font-medium">Landmark (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary" 
                        placeholder="Near Apollo Hospital"
                        value={newLandmark}
                        onChange={(e) => setNewLandmark(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1 font-medium">Save As</label>
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map(lbl => (
                         <button 
                           key={lbl}
                           onClick={() => setNewLabel(lbl)}
                           className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${newLabel === lbl ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         >
                           {lbl}
                         </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveNewAddress} className="w-full bg-primary text-white font-bold py-2.5 rounded-lg mt-2 shadow-sm shadow-primary/30 hover:bg-primary-dark transition-colors">
                  Save Address and Proceed
                </button>
              </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {addressesDb.map((addr: any) => (
                    <div
                      key={addr.id}
                      onClick={() => authUserId && selectAddressMutation({ userId: authUserId, id: addr.id })}
                      className={`border-2 rounded-lg p-4 relative cursor-pointer group ${addr.isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"}`}
                    >
                      {addr.isSelected && (
                        <div className="absolute top-4 right-4 text-primary">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-500 mt-1">{addr.icon}</span>
                        <div>
                          <h3 className="font-bold text-text-main">{addr.label}</h3>
                          <p className="text-sm text-text-muted mt-1 leading-relaxed">
                            {addr.flat ? `${addr.flat}, ` : ''}{addr.address}
                          </p>
                          {addr.landmark && <p className="text-xs text-gray-500 mt-0.5">Landmark: {addr.landmark}</p>}
                          <div className="mt-3 text-sm text-text-main font-medium">{addr.deliveryTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
              <h2 className="text-lg font-bold text-text-main">Payment Method</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed bg-gray-50">
                <input className="w-5 h-5 text-primary border-gray-300" disabled name="payment" type="radio" checked={selectedPayment === "upi"} />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-main text-gray-500">UPI (Temporarily Unavailable)</span>
                    <div className="flex gap-2 opacity-50">
                      <span className="px-2 py-0.5 bg-gray-100 text-xs rounded text-gray-600 font-medium">GPay</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-xs rounded text-gray-600 font-medium">PhonePe</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">Pay via any UPI app</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" name="payment" type="radio" checked={selectedPayment === "cod"} onChange={() => setSelectedPayment("cod")} />
                <div className="ml-4 flex-1">
                  <span className="font-semibold text-text-main">Cash on Delivery</span>
                  <p className="text-sm text-text-muted mt-0.5">Pay cash at your doorstep</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-1/3">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  Order Summary
                </h2>
                <p className="text-xs text-text-muted mt-1">From <span className="font-semibold text-text-main">Food Mohalla</span></p>
              </div>
              <div className="p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <span className="material-symbols-outlined !text-4xl mb-2 block">shopping_cart</span>
                    <p className="text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item: any) => (
                    <div key={item._id} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={item.menuItem.name} className="w-12 h-12 rounded-lg object-cover" src={item.menuItem.image} />
                        <div className="text-sm">
                          <div className="flex items-center gap-1.5">
                            {item.menuItem.isVeg && (
                              <span className="w-3 h-3 border border-green-600 flex items-center justify-center p-[1px] rounded-[2px]">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                              </span>
                            )}
                            <span className="font-semibold text-text-main">{item.menuItem.name}</span>
                          </div>
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-text-muted mt-0.5">{item.addons.map((a: any) => a.name).join(", ")}</p>
                          )}
                          <div className="mt-1 flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded bg-white">
                              <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-0.5 text-gray-500 hover:text-primary transition-colors text-xs font-bold">-</button>
                              <span className="px-1 text-xs font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-0.5 text-gray-500 hover:text-primary transition-colors text-xs font-bold">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-main">₹{getItemTotal(item).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              {/* Coupon */}
              <div className="px-5 pb-5">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">local_offer</span>
                  </span>
                  <input
                    className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                    placeholder="Apply Coupon"
                    type="text"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="absolute right-1 top-1 bottom-1 px-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-md transition-colors uppercase"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="absolute right-1 top-1 bottom-1 px-3 text-xs font-bold text-primary hover:bg-primary/5 rounded-md transition-colors uppercase"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">check_circle</span>
                    Coupon {appliedCoupon.code} applied. You saved ₹{discountAmount.toFixed(2)}!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
              </div>
              {/* Bill Details */}
              <div className="bg-gray-50/50 p-5 space-y-2 border-t border-dashed border-gray-200">
                <h3 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Bill Details</h3>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Item Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span className="flex items-center gap-1">Delivery Fee <span className="material-symbols-outlined text-[14px] text-gray-400">info</span></span>
                  {currentDeliveryFee === 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="line-through text-gray-400 text-xs">₹{DELIVERY_FEE.toFixed(2)}</span>
                      <span className="text-green-600 font-bold">Free</span>
                    </span>
                  ) : (
                    <span>₹{currentDeliveryFee.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span className="flex items-center gap-1">Taxes &amp; Charges <span className="material-symbols-outlined text-[14px] text-gray-400">info</span></span>
                  <span>₹{TAX_RATE.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1">Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                  <span className="font-bold text-lg text-text-main">To Pay</span>
                  <span className="font-bold text-lg text-text-main">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              {/* Place Order */}
              <div className="p-5 pt-0 bg-gray-50/50">
                <button
                  onClick={placeOrder}
                  disabled={cart.length === 0 || isPlacing || !selectedAddress}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-medium opacity-90 uppercase">Total</span>
                    <span className="text-base">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{isPlacing ? "Placing..." : "Place Order"}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </button>
                <p className="text-[10px] text-center text-text-muted mt-3">By placing an order you agree to our Terms and Conditions</p>
              </div>
            </div>
            {/* Safety Banner */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600">health_and_safety</span>
              <div>
                <h4 className="text-xs font-bold text-green-800">Safe &amp; Hygienic</h4>
                <p className="text-[10px] text-green-700 mt-0.5">We ensure that your food is prepared and delivered with the utmost hygiene.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
