// User Types
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'customer' | 'seller';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    accessToken: string;
}

// Category Types
export interface Category {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    isInStock: boolean;
    imageUrl?: string;
    category?: Category;
    seller?: User;
    sellerId: string;
    categoryId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Cart Types
export interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
        stockQuantity: number;
        isInStock: boolean;
        category?: string;
    };
    itemTotal: number;
    stockWarning?: string | null;
}

export interface Cart {
    items: CartItem[];
    itemCount: number;
    subtotal: string;
    total: string;
}

// Address Types
export interface Address {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
    landmark?: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
}

// Order Types
export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentMethod = 'cod' | 'upi' | 'credit_card' | 'debit_card' | 'net_banking';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: number;
    subtotal: number;
    productName: string;
    productImage?: string;
    productId?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    shippingName: string;
    shippingPhone: string;
    shippingAddressLine1: string;
    shippingAddressLine2?: string;
    shippingCity: string;
    shippingState: string;
    shippingPinCode: string;
    notes?: string;
    orderItems: OrderItem[];
    createdAt: string;
    updatedAt: string;
}
