export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isVeg: boolean;
  isHot?: boolean;
  badge?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  addons?: Array<{ name: string; price: number }>;
  instructions?: string[];
}

export interface Order {
  _id: string;
  _creationTime: number;
  customer: {
    name: string;
    avatar: string;
  };
  items: OrderItem[];
  status: "Preparing" | "Out for Delivery" | "Delivered" | "Pending";
  totalPrice: number;
  // Computed fields from the query
  displayId?: string;
  timeAgo?: string;
  itemsSummary?: string;
  displayPrice?: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
}

export interface Address {
  id: string;
  label: string;
  icon: string;
  address: string;
  deliveryTime: string;
  isSelected: boolean;
}

// Shared constants for pricing
export const DELIVERY_FEE = 35;
export const TAX_RATE = 18.5;
