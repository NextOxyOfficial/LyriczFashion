import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};

export const designAPI = {
  createDesignProduct: async (token: string, payload: {
    name: string
    description?: string
    category?: number | null
    buy_price: number
    price: number
    stock?: number
    is_published?: boolean
    design_logo?: File | null
    design_preview?: File | null
    design_data?: any
  }) => {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.description) form.append('description', payload.description)
    if (payload.category) form.append('category', String(payload.category))
    form.append('buy_price', String(payload.buy_price))
    form.append('price', String(payload.price))
    form.append('kind', 'design')
    form.append('is_published', String(Boolean(payload.is_published)))
    if (payload.stock !== undefined) form.append('stock', String(payload.stock))
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

  listMyCustomProducts: async (token: string) => {
    const response = await api.get('/custom-products/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
};

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
    const response = await api.get(`/products/${id}`);
    return response.data;
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
