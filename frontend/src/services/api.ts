import axios from 'axios';

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || 'https://lyriczfashion.com').replace(/\/$/, '');

export const toApiUrl = (path?: string | null) => {
  if (!path) return '';
  const str = String(path).trim();
  if (!str) return '';
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  const normalized = str.startsWith('/') ? str : `/${str}`;
  return `${API_BASE_URL}${normalized}`;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't override Content-Type for multipart/form-data requests
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's actually an authentication error, not other API errors
    if (error.response?.status === 401 && error.response?.data?.code === 'token_not_valid') {
      localStorage.removeItem('token');
      // Only redirect to login if we're not already on login/register pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    
    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string, phone?: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      phone,
    });
    return response.data;
  },

  getMe: async (token: string) => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProfile: async (token: string, data: { first_name: string; last_name: string; email: string; phone: string }) => {
    const response = await api.patch('/auth/profile', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  changePassword: async (token: string, currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updatePayoutInfo: async (token: string, data: any) => {
    const response = await api.post('/auth/payout-info', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const sellerAPI = {
  becomeSeller: async (token: string, phone?: string) => {
    const response = await api.post(
      '/seller/become',
      { phone },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },
};

export const storeAPI = {
  listStores: async () => {
    const response = await api.get('/stores/')
    return response.data
  },

  getMyStore: async (token: string) => {
    const response = await api.get('/stores/my/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  createStore: async (token: string, payload: { name: string; description?: string; logo?: File | null; banner?: File | null }) => {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.description) form.append('description', payload.description)
    if (payload.logo) form.append('logo', payload.logo)
    if (payload.banner) form.append('banner', payload.banner)

    const response = await api.post('/stores/', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getStoreBySlug: async (slug: string) => {
    const response = await api.get(`/stores/${slug}/`)
    return response.data
  },

  updateStore: async (slug: string, formData: FormData) => {
    const response = await api.patch(`/stores/${slug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
};

export const wholesaleAPI = {
  createInquiry: async (payload: {
    name: string
    email: string
    phone: string
    company?: string
    website?: string
    message: string
  }) => {
    const response = await api.post('/wholesale-inquiries/', payload)
    return response.data
  },
}

export const designAPI = {
  createDesignProduct: async (token: string, payload: {
    name: string
    description?: string
    category?: number | null
    buy_price?: number
    price: number
    stock?: number
    is_published?: boolean
    mockup_variant?: number
    design_logo?: File | null
    design_preview?: File | null
    design_data?: any
  }) => {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.description) form.append('description', payload.description)
    if (payload.category) form.append('category', String(payload.category))
    if (payload.buy_price !== undefined) form.append('buy_price', String(payload.buy_price))
    form.append('price', String(payload.price))
    form.append('kind', 'design')
    form.append('is_published', String(Boolean(payload.is_published)))
    if (payload.stock !== undefined) form.append('stock', String(payload.stock))
    if (payload.mockup_variant !== undefined) form.append('mockup_variant', String(payload.mockup_variant))
    if (payload.design_logo) form.append('design_logo', payload.design_logo)
    if (payload.design_preview) form.append('design_preview', payload.design_preview)
    if (payload.design_data) form.append('design_data', JSON.stringify(payload.design_data))

    const response = await api.post('/seller-products/', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  listMyDesigns: async (token: string) => {
    const response = await api.get('/seller-products/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  listPublishedDesigns: async () => {
    const response = await api.get('/seller-products/published/')
    return response.data
  },
};

export const customProductsAPI = {
  createCustomProduct: async (token: string, payload: {
    name: string
    description?: string
    price: number
    stock?: number
    design_logo?: File | null
    design_preview?: File | null
    design_logo_front?: File | null
    design_logo_back?: File | null
    design_preview_front?: File | null
    design_preview_back?: File | null
    design_data?: any
  }) => {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.description) form.append('description', payload.description)
    form.append('price', String(payload.price))
    if (payload.stock !== undefined) form.append('stock', String(payload.stock))
    if (payload.design_logo) form.append('design_logo', payload.design_logo)
    if (payload.design_preview) form.append('design_preview', payload.design_preview)
    if (payload.design_logo_front) form.append('design_logo_front', payload.design_logo_front)
    if (payload.design_logo_back) form.append('design_logo_back', payload.design_logo_back)
    if (payload.design_preview_front) form.append('design_preview_front', payload.design_preview_front)
    if (payload.design_preview_back) form.append('design_preview_back', payload.design_preview_back)
    if (payload.design_data) form.append('design_data', JSON.stringify(payload.design_data))

    const response = await api.post('/custom-products/', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  createGuestCustomProduct: async (payload: {
    name: string
    description?: string
    price: number
    stock?: number
    design_logo?: File | null
    design_preview?: File | null
    design_logo_front?: File | null
    design_logo_back?: File | null
    design_preview_front?: File | null
    design_preview_back?: File | null
    design_data?: any
  }) => {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.description) form.append('description', payload.description)
    form.append('price', String(payload.price))
    if (payload.stock !== undefined) form.append('stock', String(payload.stock))
    if (payload.design_logo) form.append('design_logo', payload.design_logo)
    if (payload.design_preview) form.append('design_preview', payload.design_preview)
    if (payload.design_logo_front) form.append('design_logo_front', payload.design_logo_front)
    if (payload.design_logo_back) form.append('design_logo_back', payload.design_logo_back)
    if (payload.design_preview_front) form.append('design_preview_front', payload.design_preview_front)
    if (payload.design_preview_back) form.append('design_preview_back', payload.design_preview_back)
    if (payload.design_data) form.append('design_data', JSON.stringify(payload.design_data))

    const response = await api.post('/guest-custom-products/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  listMyCustomProducts: async (token: string) => {
    const response = await api.get('/custom-products/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
};

export const designLibraryAPI = {
  listPublic: async (queryString = '') => {
    const response = await api.get(`/design-library/${queryString}`)
    return response.data
  },

  listMy: async (token: string) => {
    const response = await api.get('/design-library/my/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  create: async (token: string, payload: {
    name: string
    image: File
    category?: string
    search_keywords?: string
    commission_per_use?: number
  }) => {
    const form = new FormData()
    form.append('name', payload.name)
    form.append('image', payload.image)
    if (payload.category) {
      form.append('category', payload.category)
    }
    if (payload.search_keywords) {
      form.append('search_keywords', payload.search_keywords)
    }
    if (payload.commission_per_use !== undefined) {
      form.append('commission_per_use', String(payload.commission_per_use))
    }

    const response = await api.post('/design-library/', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (token: string, id: number) => {
    const response = await api.delete(`/design-library/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  getFeatured: async () => {
    const response = await api.get('/design-library/featured/')
    return response.data
  },
};

export const designCategoryAPI = {
  list: async () => {
    const response = await api.get('/design-categories/')
    return response.data
  },
}

export const designCommissionAPI = {
  listMy: async (token: string) => {
    const response = await api.get('/design-commissions/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}

export const productsAPI = {
  getFeed: async () => {
    const response = await api.get('/feed')
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/products/');
    return response.data;
  },

  getByStoreSlug: async (storeSlug: string) => {
    const response = await api.get('/products/', {
      params: {
        store: storeSlug,
      },
    })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
};

export const categoriesAPI = {
  list: async () => {
    const response = await api.get('/categories/')
    return response.data
  },
  getActive: async () => {
    try {
      const response = await api.get('/categories/active');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export const settingsAPI = {
  getPromotionalBanners: async () => {
    try {
      const response = await api.get('/settings/promotional-banners');
      return response.data;
    } catch (error) {
      // Return default banners if API fails
      return [
        { id: 1, text: '🔥 Extra Sale 30% off - Limited Time Offer!', link: '/products', active: true },
        { id: 2, text: '✨ Free Shipping on Orders Over ৳2000', link: '/products', active: true },
        { id: 3, text: '🎨 Custom T-Shirt Design - Upload Your Logo Today', link: '/design-studio', active: true },
      ];
    }
  },

  getContactInfo: async () => {
    try {
      const response = await api.get('/settings/contact-info');
      return response.data;
    } catch (error) {
      // Return default contact info if API fails
      return {
        hotline: '19008188',
        email: 'support@lyriczfashion.com',
        address: 'Dhaka, Bangladesh',
      };
    }
  },
};

export const ordersAPI = {
  createOrder: async (
    token: string,
    payload: {
      customer_name?: string
      customer_phone?: string
      shipping_address: string
      payment_method?: 'cod'
      items: Array<{ product_id: number; quantity: number }>
    }
  ) => {
    const response = await api.post('/orders/', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  createGuestOrder: async (payload: {
    customer_name?: string
    customer_phone?: string
    shipping_address: string
    payment_method?: 'cod'
    items: Array<{ product_id: number; quantity: number }>
  }) => {
    const response = await api.post('/orders/', payload)
    return response.data
  },

  listMyOrders: async (token: string) => {
    const response = await api.get('/orders/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  getSellerOrders: async (token: string) => {
    const response = await api.get('/orders/seller/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
};

export const mockupAPI = {
  listMockupTypes: async () => {
    const response = await api.get('/mockup-types/')
    return response.data
  },

  getMockupType: async (slug: string) => {
    const response = await api.get(`/mockup-types/${slug}/`)
    return response.data
  },

  listMockupVariants: async (mockupType?: string, color?: string) => {
    const response = await api.get('/mockup-variants/', {
      params: {
        mockup_type: mockupType,
        color: color,
      },
    })
    return response.data
  },

  getAvailableColors: async () => {
    const response = await api.get('/mockup-variants/colors/')
    return response.data
  },
};

export default api;
