// src/utils/axiosInstance.js
import axios from "axios";
import { getToken, removeToken, isAuthenticated } from "./tokenUtils";

const API = axios.create({
  baseURL: "https://api.rasutrip.com/api/v1",
  timeout: 30000, // Increased timeout for booking operations
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🎯 Enhanced Request Interceptor - Uses your token management system
API.interceptors.request.use(
  (config) => {
    try {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      
      // Get token using your token management system
      const { token, userType, hasToken } = getToken();
      
      if (hasToken && token) {
        // Add Authorization header
        config.headers.Authorization = `Bearer ${token}`;
        
        // Add user type header (some APIs might need this)
        config.headers['X-User-Type'] = userType;
        
        console.log(`📤 Request with ${userType} token:`, config.url);
        console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('📤 Request without token:', config.url);
        
        // For public endpoints, still log the attempt
        if (config.url?.includes('login') || config.url?.includes('signup') || config.url?.includes('otp')) {
          console.log('✅ Public endpoint - no token required');
        } else {
          console.warn('⚠️ Protected endpoint called without token');
        }
      }

      // Add request timestamp for debugging
      config.metadata = { startTime: new Date() };
      
      return config;
    } catch (error) {
      console.error('❌ Request Interceptor Error:', error);
      return config; // Return config anyway to not break the request
    }
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// 🎯 Enhanced Response Interceptor - Handles token expiry and errors
API.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime 
      ? new Date() - response.config.metadata.startTime 
      : 'unknown';
    
    console.log(
      `📥 Response Success:`, 
      response.config.method?.toUpperCase(),
      response.config.url, 
      `Status: ${response.status}`,
      `Duration: ${duration}ms`
    );
    
    // Log response data for booking-related endpoints
    if (response.config.url?.includes('booking') || response.config.url?.includes('search')) {
      console.log('📊 Booking/Search Response Data:', response.data);
    }
    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    
    console.error(`📥 Response Error: ${method} ${url}`, {
      status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // 🚨 Handle different error scenarios
    switch (status) {
      case 401:
        console.warn('🚨 Unauthorized (401)! Token may be expired or invalid');
        handleUnauthorized();
        break;
        
      case 400:
        // Special handling for booking/search token errors
        if (error.response?.data?.error?.ErrorMessage?.includes('search token')) {
          console.error('🔍 Search Token Error - This might be a search session token issue, not auth token');
          console.error('💡 Check if search needs to be performed before booking');
        }
        console.warn('⚠️ Bad Request (400):', error.response?.data);
        break;
        
      case 403:
        console.warn('🚫 Forbidden (403)! User may not have required permissions');
        break;
        
      case 404:
        console.warn('🔍 Not Found (404)! Endpoint may not exist:', url);
        break;
        
      case 500:
      case 502:
      case 503:
        console.error('🔥 Server Error:', status, 'URL:', url);
        break;
        
      default:
        console.error('❌ Unknown Error:', status, error.message);
    }
    
    return Promise.reject(error);
  }
);

// 🔧 Handle unauthorized access
const handleUnauthorized = () => {
  console.log('🔧 Handling unauthorized access...');
  
  try {
    // Get current user type before clearing
    const { userType } = getToken();
    
    // Clear all tokens using your token management system
    removeToken(); // This clears all token types
    
    // Also clear any additional keys that might exist
    localStorage.removeItem('searchToken'); // Clear search token if exists
    localStorage.removeItem('sessionId');
    
    console.log(`🗑️ Cleared ${userType || 'unknown'} session due to 401`);
    
    // Redirect to appropriate login page based on current path
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on login page
      if (!currentPath.includes('/login')) {
        // Determine redirect based on user type or current path
        if (currentPath.includes('/agent') || userType === 'agent') {
          console.log('🔄 Redirecting to agent login...');
          window.location.href = '/login/agent';
        } else {
          console.log('🔄 Redirecting to customer login...');
          window.location.href = '/login/customer';
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling unauthorized access:', error);
  }
};

// 🎯 Helper function to check if user is authenticated before making requests
export const makeAuthenticatedRequest = async (requestConfig) => {
  const { userType } = getToken();
  
  if (!isAuthenticated()) {
    console.error('❌ Cannot make request - user not authenticated');
    throw new Error('User not authenticated');
  }
  
  console.log(`🔐 Making authenticated request as ${userType}`);
  return API(requestConfig);
};

// 🎯 Helper function for booking-specific requests
export const makeBookingRequest = async (requestConfig) => {
  console.log('🎫 Making booking request...');
  
  // Check authentication
  if (!isAuthenticated()) {
    throw new Error('Authentication required for booking');
  }
  
  // Add booking-specific headers if needed
  const enhancedConfig = {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'X-Request-Type': 'booking'
    }
  };
  
  return API(enhancedConfig);
};

// 🎯 Debug function to check current token status
export const debugTokenStatus = () => {
  console.log('🔧 === TOKEN DEBUG INFO ===');
  
  const { token, userType, hasToken, userData } = getToken();
  const isAuth = isAuthenticated();
  
  console.log('Has Token:', hasToken);
  console.log('User Type:', userType);
  console.log('Is Authenticated:', isAuth);
  console.log('Token Preview:', token ? token.substring(0, 30) + '...' : 'None');
  console.log('User Data:', userData);
  
  // Check localStorage directly
  console.log('\n📋 LocalStorage Keys:');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('token') || key.includes('user') || key.includes('Type')) {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value?.substring(0, 50) + (value?.length > 50 ? '...' : ''));
    }
  });
  
  console.log('🔧 === END DEBUG ===');
};

// Make debug function available in development
if (process.env.NODE_ENV === 'development') {
  window.debugTokenStatus = debugTokenStatus;
  window.API = API;
}

export default API;