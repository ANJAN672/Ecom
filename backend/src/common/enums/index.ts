// User Roles - Defines what actions a user can perform
export enum UserRole {
  CUSTOMER = 'customer',  // Can browse, buy products
  SELLER = 'seller',      // Can also add/manage their products
}

// Order Status - Tracks the lifecycle of an order
export enum OrderStatus {
  PENDING = 'pending',           // Order placed, awaiting confirmation
  CONFIRMED = 'confirmed',       // Order confirmed by seller
  SHIPPED = 'shipped',           // Order shipped
  OUT_FOR_DELIVERY = 'out_for_delivery', // Last mile delivery
  DELIVERED = 'delivered',       // Successfully delivered
  CANCELLED = 'cancelled',       // Order cancelled
}

// Payment Methods - Supported payment options
export enum PaymentMethod {
  COD = 'cod',                   // Cash on Delivery (working)
  UPI = 'upi',                   // Under development
  CREDIT_CARD = 'credit_card',   // Under development
  DEBIT_CARD = 'debit_card',     // Under development
  NET_BANKING = 'net_banking',   // Under development
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Address Type
export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}
