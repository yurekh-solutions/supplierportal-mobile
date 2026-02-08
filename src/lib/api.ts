import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backendmatrix.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token AND handle FormData
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('supplierToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let axios handle it automatically
    if (config.data instanceof FormData) {
      console.log('🔧 FormData detected - removing Content-Type header');
      delete config.headers['Content-Type'];
    }
    
    console.log('📡 Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      dataType: config.data?.constructor?.name || typeof config.data
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      await AsyncStorage.removeItem('supplierToken');
      await AsyncStorage.removeItem('supplierUser');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const supplierLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/supplier/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};

export const supplierSetupPassword = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/supplier/setup-password', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Password setup error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to set up password' 
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to send reset email' 
    };
  }
};

// ==================== SUPPLIER ONBOARDING ====================

// Wake up the server before heavy requests (Render free tier goes to sleep)
export const wakeUpServer = async () => {
  try {
    await api.get('/health', { timeout: 60000 });
    return true;
  } catch {
    // Even if health check fails, continue - server might still be waking up
    return false;
  }
};

export const submitSupplierApplication = async (formData: FormData) => {
  try {
    console.log('📤 Submitting supplier application...');
    console.log('🌐 API URL:', API_URL);
    console.log('📋 FormData entries:');
    
    // Log all FormData entries for debugging
    for (const [key, value] of (formData as any).entries()) {
      if (value instanceof File || (value && typeof value === 'object' && 'uri' in value)) {
        console.log(`  ${key}: [FILE] ${value.name || 'unknown'}`);
      } else {
        console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) : value}`);
      }
    }
    
    console.log('🔗 Full URL:', `${API_URL}/supplier/submit`);
    
    // First, try to wake up the server if it's sleeping
    console.log('⏰ Attempting to wake up server...');
    await wakeUpServer();
    console.log('✅ Server wake-up request sent');
    
    const response = await api.post('/supplier/submit', formData, {
      timeout: 120000, // 2 minutes for file uploads (Render cold start + upload time)
    });
    
    console.log('✅ Application submitted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Supplier application error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return { 
        success: false, 
        message: 'Request timed out. The server is starting up (this takes 30-60 seconds on first request). Please try again.' 
      };
    }
    
    // Handle network errors
    if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Network error. Please check your internet connection and try again.'
      };
    }
    
    // Return detailed error message from backend
    const backendData = error.response?.data;
    const backendMessage = backendData?.message;
    
    // If backend sent missing fields info, format it nicely
    if (backendData?.missingFields && Array.isArray(backendData.missingFields)) {
      const fieldsList = backendData.missingFields
        .map((f: string) => `• ${f}`)
        .join('\n');
      
      return {
        success: false,
        message: `Missing Required Fields:

${fieldsList}

Please complete all required fields.`
      };
    }
    
    const detailedMessage = backendMessage || error.message || 'Failed to submit application';
    
    return { 
      success: false, 
      message: detailedMessage
    };
  }
};

export const checkSupplierStatus = async (email: string) => {
  try {
    const response = await api.get(`/supplier/check-status?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to check status' 
    };
  }
};

// ==================== PRODUCTS API ====================

export const getMyProducts = async () => {
  try {
    const response = await api.get('/products/my-products');
    return response.data;
  } catch (error: any) {
    console.error('Get products error:', error);
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || 'Failed to fetch products' 
    };
  }
};

export const addProduct = async (productData: FormData) => {
  try {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Add product error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add product' 
    };
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update product' 
    };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete product' 
    };
  }
};

// ==================== CATEGORIES API ====================

export const getCategories = async () => {
  try {
    const response = await api.get('/categories/public');
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || 'Failed to fetch categories' 
    };
  }
};

// ==================== PRODUCT INQUIRIES ====================

export const getProductInquiries = async () => {
  try {
    const response = await api.get('/supplier/inquiries');
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      data: [],
      message: error.response?.data?.message || 'Failed to fetch inquiries' 
    };
  }
};

// ==================== AI INSIGHTS ====================

export const getSupplierInsights = async () => {
  try {
    const response = await api.get('/ai/supplier-insights');
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch AI insights' 
    };
  }
};

// ==================== SUPPLIER PROFILE ====================

export const getSupplierProfile = async () => {
  try {
    const response = await api.get('/supplier/profile');
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch profile' 
    };
  }
};

export const updateSupplierProfile = async (profileData: any) => {
  try {
    const response = await api.put('/supplier/profile', profileData);
    return response.data;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update profile' 
    };
  }
};

export default api;
