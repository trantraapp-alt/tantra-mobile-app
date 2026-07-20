// Order and notification domain types.
import type { CartSummary } from './cart.types';
import type { Address, ID, IsoDateString, Money } from './common.types';

// Lifecycle status of an order.
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

// Supported payment methods.
export type PaymentMethod =
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'wallet'
  | 'cod';

// A single item captured within an order.
export interface OrderItem {
  // Unique order item identifier.
  id: ID;
  // Product identifier.
  productId: ID;
  // Product title snapshot.
  title: string;
  // Product image URL snapshot.
  imageUrl: string;
  // Quantity ordered.
  quantity: number;
  // Unit price snapshot.
  unitPrice: Money;
}

// Full order entity.
export interface Order {
  // Unique order identifier.
  id: ID;
  // Human-friendly order number.
  orderNumber: string;
  // Ordered items.
  items: OrderItem[];
  // Monetary summary.
  summary: CartSummary;
  // Current order status.
  status: OrderStatus;
  // Payment method used.
  paymentMethod: PaymentMethod;
  // Shipping address snapshot.
  shippingAddress: Address;
  // Order creation timestamp.
  createdAt: IsoDateString;
  // Estimated or actual delivery timestamp.
  deliveredAt?: IsoDateString;
}

// In-app notification.
export interface AppNotification {
  // Unique notification identifier.
  id: ID;
  // Notification title.
  title: string;
  // Notification body text.
  body: string;
  // Notification category.
  type: 'order' | 'promotion' | 'system' | 'wishlist';
  // Whether the notification has been read.
  isRead: boolean;
  // Optional deep link target.
  deepLink?: string;
  // Creation timestamp.
  createdAt: IsoDateString;
}

// Promotional banner shown on the home screen.
export interface Banner {
  // Unique banner identifier.
  id: ID;
  // Banner image URL.
  imageUrl: string;
  // Optional title overlay.
  title?: string;
  // Optional subtitle overlay.
  subtitle?: string;
  // Optional deep link target when tapped.
  deepLink?: string;
}
