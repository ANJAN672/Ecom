/**
 * API Client - Centralized HTTP requests to backend
 * 
 * Features:
 * - Automatic token attachment
 * - Error handling
 * - Type-safe responses
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP Error: ${response.status}`);
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) return {} as T;

        return JSON.parse(text);
    }

    // GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PATCH request
    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient();

// ============ Auth API ============
export const authApi = {
    signup: (data: { firstName: string; lastName: string; email: string; password: string }) =>
        api.post<{ message: string; user: any; accessToken: string }>('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ message: string; user: any; accessToken: string }>('/auth/login', data),
};

// ============ Users API ============
export const usersApi = {
    getProfile: () => api.get<any>('/users/me'),
    updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) =>
        api.patch<any>('/users/me', data),
};

// ============ Categories API ============
export const categoriesApi = {
    getAll: () => api.get<any[]>('/categories'),
    getOne: (id: string) => api.get<any>(`/categories/${id}`),
    create: (data: { name: string; description?: string; imageUrl?: string }) =>
        api.post<any>('/categories', data),
};

// ============ Products API ============
export const productsApi = {
    getAll: (params?: {
        search?: string;
        categoryId?: string;
        inStock?: boolean;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
    }) => {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, String(value));
            });
        }
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return api.get<any>(`/products${query}`);
    },

    getOne: (id: string) => api.get<any>(`/products/${id}`),

    create: (data: {
        name: string;
        description: string;
        price: number;
        stockQuantity: number;
        categoryId?: string;
        imageSearchTerm?: string;
    }) => api.post<any>('/products', data),

    update: (id: string, data: any) => api.patch<any>(`/products/${id}`, data),

    updateStock: (id: string, stockQuantity: number) =>
        api.patch<any>(`/products/${id}/stock`, { stockQuantity }),
};

// ============ Cart API ============
export const cartApi = {
    get: () => api.get<any>('/cart'),

    add: (productId: string, quantity: number = 1) =>
        api.post<any>('/cart', { productId, quantity }),

    updateQuantity: (cartItemId: string, quantity: number) =>
        api.patch<any>(`/cart/${cartItemId}`, { quantity }),

    remove: (cartItemId: string) => api.delete<any>(`/cart/${cartItemId}`),

    clear: () => api.delete<any>('/cart'),

    validate: () => api.get<{ valid: boolean; issues: any[] }>('/cart/validate'),
};

// ============ Addresses API ============
export const addressesApi = {
    getAll: () => api.get<any[]>('/addresses'),

    getDefault: () => api.get<any>('/addresses/default'),

    create: (data: {
        fullName: string;
        phoneNumber: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pinCode: string;
        landmark?: string;
        type?: 'home' | 'work' | 'other';
        isDefault?: boolean;
    }) => api.post<any>('/addresses', data),

    update: (id: string, data: any) => api.patch<any>(`/addresses/${id}`, data),

    setDefault: (id: string) => api.patch<any>(`/addresses/${id}/set-default`),

    delete: (id: string) => api.delete<any>(`/addresses/${id}`),
};

// ============ Orders API ============
export const ordersApi = {
    getAll: () => api.get<any[]>('/orders'),

    getOne: (id: string) => api.get<any>(`/orders/${id}`),

    create: (data: { addressId: string; paymentMethod: string; notes?: string }) =>
        api.post<any>('/orders', data),

    cancel: (id: string) => api.patch<any>(`/orders/${id}/cancel`),
};
