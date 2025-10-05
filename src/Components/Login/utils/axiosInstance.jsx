// src/utils/axiosInstance.js - Fixed Request Interceptor
import axios from "axios";
import { getToken, removeToken, isAuthenticated } from "./tokenUtils";

const API = axios.create({
  baseURL: "https://api.rasutrip.com/api/v1",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🎯 Enhanced Request Interceptor with Signup Token Support
API.interceptors.request.use(
  (config) => {
    try {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);

      // 🔥 CRITICAL FIX: Check for temporary signup token FIRST
      const tempToken = localStorage.getItem('tempAuthToken');

      if (tempToken && config.url?.includes('/complete-signup')) {
        console.log('🔑 Using temporary signup token for complete-signup');
        config.headers.Authorization = `Bearer ${tempToken}`;
        config.headers['X-Signup-Request'] = 'true';
        config.headers['X-User-Type'] = 'customer';
        return config;
      }

      // Get regular token using enhanced detection
      const { token, userType, hasToken, userData } = getToken();

      if (hasToken && token) {
        config.headers.Authorization = `Bearer ${token}`;

        // Enhanced headers for agent requests
        if (userType === 'agent') {
          config.headers['X-User-Type'] = 'agent';
          config.headers['X-Agent-Request'] = 'true';
          config.headers['X-Account-Type'] = 'agent';

          if (userData.agentId) {
            config.headers['X-Agent-ID'] = userData.agentId;
          }
          if (userData.agentCode) {
            config.headers['X-Agent-Code'] = userData.agentCode;
          }

          console.log(`📤 AGENT Request with token:`, config.url);
          console.log('🔑 Agent token preview:', token.substring(0, 25) + '...');
        } else if (userType === 'customer') {
          config.headers['X-User-Type'] = 'customer';
          config.headers['X-Customer-Request'] = 'true';

          console.log(`📤 CUSTOMER Request with token:`, config.url);
          console.log('🔑 Customer token preview:', token.substring(0, 25) + '...');
        }

        config.headers['X-Login-Type'] = userType;
        config.headers['X-Mobile'] = userData.mobile || '';

      } else {
        console.log('📤 Request without token:', config.url);

        // Check if this is a protected endpoint
        const protectedPatterns = ['/booking', '/my-bookings', '/cancel', '/agent/', '/user/'];
        const isProtectedEndpoint = protectedPatterns.some(pattern =>
          config.url?.includes(pattern)
        );

        if (isProtectedEndpoint) {
          console.warn('⚠️ Protected endpoint called without token:', config.url);

          // Try fallback token from localStorage
          const fallbackToken = localStorage.getItem('agent_token') ||
            localStorage.getItem('token') ||
            localStorage.getItem('authToken');

          if (fallbackToken) {
            console.log('🔄 Using fallback token from localStorage');
            config.headers.Authorization = `Bearer ${fallbackToken}`;

            const fallbackUserType = localStorage.getItem('userType') ||
              localStorage.getItem('user_type') ||
              (localStorage.getItem('isAgent') === 'true' ? 'agent' : 'customer');

            config.headers['X-User-Type'] = fallbackUserType;
            if (fallbackUserType === 'agent') {
              config.headers['X-Agent-Request'] = 'true';
            }
          }
        }
      }

      // Special handling for agent booking endpoints
      if (config.url?.includes('/agent/bus-bookings') ||
        (config.url?.includes('/booking') && userType === 'agent')) {

        console.log('🎫 Agent booking request detected');
        config.headers['X-Booking-Request'] = 'true';
        config.headers['X-Agent-Booking'] = 'true';

        if (!token && userType === 'agent') {
          const agentToken = localStorage.getItem('agent_token') || localStorage.getItem('agentToken');
          if (agentToken) {
            console.log('🔄 Using direct agent token for booking');
            config.headers.Authorization = `Bearer ${agentToken}`;
          }
        }
      }

      config.metadata = {
        startTime: new Date(),
        userType: userType,
        hasToken: hasToken
      };

      return config;

    } catch (error) {
      console.error('❌ Request Interceptor Error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor remains the same
API.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata?.startTime
      ? new Date() - response.config.metadata.startTime
      : 'unknown';

    const userType = response.config.metadata?.userType || 'unknown';

    console.log(
      `📥 Response Success [${userType}]:`,
      response.config.method?.toUpperCase(),
      response.config.url,
      `Status: ${response.status}`,
      `Duration: ${duration}ms`
    );

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const userType = error.config?.metadata?.userType || 'unknown';

    console.error(`📥 Response Error [${userType}]: ${method} ${url}`, {
      status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    switch (status) {
      case 401:
        console.warn('🚨 Unauthorized (401)! Token may be expired or invalid');

        // Clear temporary token if it failed
        if (url?.includes('/complete-signup')) {
          console.log('🗑️ Clearing invalid temporary token');
          localStorage.removeItem('tempAuthToken');
        }

        if (userType === 'agent') {
          console.error('🚨 Agent authentication failed!');
          removeToken('agent');
          localStorage.removeItem('agent_token');
          localStorage.removeItem('agentToken');
          localStorage.removeItem('isAgent');

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecting to agent login...');
            setTimeout(() => {
              window.location.href = '/login/agent';
            }, 1000);
          }
        } else {
          handleUnauthorized();
        }
        break;

      case 400:
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

const handleUnauthorized = () => {
  console.log('🔧 Handling unauthorized access...');

  try {
    const { userType } = getToken();
    removeToken();

    localStorage.removeItem('searchToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('agent_token');
    localStorage.removeItem('agentToken');
    localStorage.removeItem('isAgent');
    localStorage.removeItem('tempAuthToken'); // Clear temp token too

    console.log(`🗑️ Cleared ${userType || 'unknown'} session due to 401`);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      if (!currentPath.includes('/login')) {
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
// 🎯 Enhanced helper function for authenticated requests with user type detection
export const makeAuthenticatedRequest = async (requestConfig) => {
  const { token, userType, hasToken } = getToken();

  if (!isAuthenticated()) {
    console.error('❌ Cannot make request - user not authenticated');
    throw new Error('User not authenticated');
  }

  console.log(`🔐 Making authenticated request as ${userType}`);

  // Add user-type specific headers
  const enhancedConfig = {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'X-User-Type': userType,
      'X-Authenticated-Request': 'true'
    }
  };

  if (userType === 'agent') {
    enhancedConfig.headers['X-Agent-Request'] = 'true';
  }

  return API(enhancedConfig);
};

// 🎯 Enhanced helper function for agent-specific requests
export const makeAgentRequest = async (requestConfig) => {
  console.log('👤 Making agent-specific request...');

  // Verify agent authentication
  const { token, userType, hasToken, userData } = getToken('agent');

  if (!hasToken || userType !== 'agent') {
    console.error('❌ Agent authentication required but not found');
    throw new Error('Agent authentication required for this request');
  }

  // Enhanced config for agent requests
  const agentConfig = {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'X-User-Type': 'agent',
      'X-Agent-Request': 'true',
      'X-Account-Type': 'agent',
      'X-Authenticated-Request': 'true'
    }
  };

  // Add agent-specific identifiers if available
  if (userData.agentId) {
    agentConfig.headers['X-Agent-ID'] = userData.agentId;
  }
  if (userData.agentCode) {
    agentConfig.headers['X-Agent-Code'] = userData.agentCode;
  }
  if (userData.mobile) {
    agentConfig.headers['X-Mobile'] = userData.mobile;
  }

  console.log('👤 Agent request headers:', {
    'X-Agent-ID': agentConfig.headers['X-Agent-ID'],
    'X-Agent-Code': agentConfig.headers['X-Agent-Code'],
    'X-Mobile': agentConfig.headers['X-Mobile']
  });

  return API(agentConfig);
};

// 🎯 Enhanced booking request handler with agent support
export const makeBookingRequest = async (requestConfig) => {
  console.log('🎫 Making booking request...');

  // Check authentication
  const { token, userType, hasToken, userData } = getToken();

  if (!isAuthenticated()) {
    throw new Error('Authentication required for booking');
  }

  // Enhanced config for booking requests
  const bookingConfig = {
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
      'X-Request-Type': 'booking',
      'X-Booking-Request': 'true',
      'X-User-Type': userType
    }
  };

  // Add user-type specific headers
  if (userType === 'agent') {
    bookingConfig.headers['X-Agent-Booking'] = 'true';
    bookingConfig.headers['X-Agent-Request'] = 'true';

    if (userData.agentId) {
      bookingConfig.headers['X-Agent-ID'] = userData.agentId;
    }

    console.log('🎫 Agent booking request with headers:', {
      'X-Agent-ID': bookingConfig.headers['X-Agent-ID'],
      'X-Agent-Booking': 'true'
    });
  } else {
    bookingConfig.headers['X-Customer-Booking'] = 'true';
    console.log('🎫 Customer booking request');
  }

  return API(bookingConfig);
};

// 🎯 Agent-specific booking endpoints helper
export const getAgentBookingEndpoints = () => {
  const baseURL = "https://api.rasutrip.com/api/v1";

  return {
    // Agent-specific endpoints (try these first)
    agentUpcoming: `${baseURL}/agent/bus-bookings/upcoming`,
    agentAll: `${baseURL}/agent/bus-bookings`,
    agentHistory: `${baseURL}/agent/bus-bookings/history`,
    agentCancel: `${baseURL}/agent/bus-bookings/cancel`,

    // Fallback endpoints
    upcomingFallback: `${baseURL}/busservice/up-comming-bookings`,
    allFallback: `${baseURL}/busservice/my-bookings`,

    // Search endpoints
    search: `${baseURL}/busservice/search`,
    searchResults: `${baseURL}/busservice/search-results`,

    // Booking endpoints
    book: `${baseURL}/busservice/book`,
    confirm: `${baseURL}/busservice/confirm-booking`
  };
};

// 🎯 Helper to make agent booking requests with fallback
export const makeAgentBookingRequest = async (endpoint, config = {}) => {
  console.log('🎫 Making agent booking request to:', endpoint);

  try {
    // First try with agent-specific request
    return await makeAgentRequest({
      url: endpoint,
      method: 'GET',
      ...config
    });
  } catch (error) {
    console.error('❌ Agent-specific request failed:', error.response?.status);

    // If 404 or 403, try with regular authenticated request
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.log('🔄 Retrying with regular authenticated request...');

      try {
        return await makeAuthenticatedRequest({
          url: endpoint,
          method: 'GET',
          ...config
        });
      } catch (fallbackError) {
        console.error('❌ Fallback request also failed:', fallbackError.response?.status);
        throw fallbackError;
      }
    }

    throw error;
  }
};

// 🎯 Debug function to check current token and auth status
export const debugAuthStatus = () => {
  console.log('🔧 === AUTHENTICATION DEBUG INFO ===');

  const { token, userType, hasToken, userData } = getToken();
  const isAuth = isAuthenticated();

  console.log('Authentication Status:', {
    hasToken,
    userType,
    isAuthenticated: isAuth,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'None',
    userDataKeys: userData ? Object.keys(userData) : []
  });

  // Check localStorage directly
  console.log('\n📋 LocalStorage Auth Keys:');
  const authKeys = ['token', 'authToken', 'agent_token', 'agentToken', 'customer_token',
    'userType', 'user_type', 'isAgent', 'user', 'agent', 'currentUser'];

  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`  ${key}:`,
        key.includes('token') ? value.substring(0, 30) + '...' :
          key.includes('user') || key.includes('agent') ?
            (value.length > 100 ? `${value.substring(0, 50)}... (${value.length} chars)` : value) :
            value
      );
    }
  });

  // Show specific agent token status
  if (userType === 'agent') {
    console.log('\n👤 Agent-Specific Status:');
    console.log('  Agent Token (localStorage):',
      localStorage.getItem('agent_token') ?
        localStorage.getItem('agent_token').substring(0, 30) + '...' : 'None'
    );
    console.log('  Agent ID:', userData.agentId || 'None');
    console.log('  Agent Code:', userData.agentCode || 'None');
    console.log('  Is Agent Flag:', localStorage.getItem('isAgent'));
  }

  console.log('🔧 === END AUTH DEBUG ===');
};

// 🎯 Helper to verify token is properly saved for agent
export const verifyAgentToken = () => {
  const { token, userType, hasToken } = getToken('agent');
  const localStorageToken = localStorage.getItem('agent_token');
  const isAgentFlag = localStorage.getItem('isAgent');
  const userTypeStorage = localStorage.getItem('userType');

  const verification = {
    tokenUtilsDetection: hasToken && userType === 'agent',
    localStorageToken: !!localStorageToken,
    isAgentFlag: isAgentFlag === 'true',
    userTypeStorage: userTypeStorage === 'agent',
    tokensMatch: token === localStorageToken,
    allChecksPass: false
  };

  verification.allChecksPass = verification.tokenUtilsDetection &&
    verification.localStorageToken &&
    verification.isAgentFlag &&
    verification.userTypeStorage;

  console.log('🔍 Agent Token Verification:', verification);

  return verification;
};

// Make debug functions available in development
if (process.env.NODE_ENV === 'development') {
  window.debugAuthStatus = debugAuthStatus;
  window.verifyAgentToken = verifyAgentToken;
  window.API = API;
  window.makeAgentRequest = makeAgentRequest;
  window.makeAgentBookingRequest = makeAgentBookingRequest;
}

export default API;
// export {
//   // makeAgentRequest,
//   makeAgentBookingRequest,
//   getAgentBookingEndpoints,
//   debugAuthStatus,
//   verifyAgentToken
// };