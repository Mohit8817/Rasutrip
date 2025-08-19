// src/components/auth/utils/tokenUtils.js

/**
 * Enhanced Token Management with User Type Support
 * Handles separate token storage for customers and agents
 */

// Token storage keys based on user type
const TOKEN_KEYS = {
  customer: {
    primary: 'token',
    secondary: 'authToken',
    backup: 'customer_token',
    userType: 'userType',
    userData: 'user'
  },
  agent: {
    primary: 'agent_token',
    secondary: 'agentToken',
    backup: 'agent_auth_token',
    userType: 'userType',
    userData: 'agent'
  }
};

/**
 * Save token with user type awareness
 * @param {string} token - The JWT token
 * @param {string} userType - 'customer' or 'agent'
 * @param {object} userData - Additional user data to store
 * @returns {boolean} - Success status
 */
export const saveToken = (token, userType = 'customer', userData = null) => {
  try {
    console.log('🔐 Saving token for user type:', userType);

    if (!token) {
      console.error('❌ No token provided to save');
      return false;
    }

    if (!userType || !['customer', 'agent'].includes(userType)) {
      console.error('❌ Invalid user type provided:', userType);
      userType = 'customer'; // Default fallback
    }

    const keys = TOKEN_KEYS[userType];

    // Save the token using multiple keys for reliability
    localStorage.setItem(keys.primary, token);
    localStorage.setItem(keys.secondary, token);

    // Save user type
    localStorage.setItem(keys.userType, userType);
    localStorage.setItem('user_type', userType); // Additional backup

    // Save user data if provided
    if (userData) {
      localStorage.setItem(keys.userData, JSON.stringify(userData));
      localStorage.setItem('currentUser', JSON.stringify({
        ...userData,
        userType,
        loginTime: new Date().toISOString()
      }));
    }

    // Clear tokens from other user type to avoid conflicts
    const otherUserType = userType === 'customer' ? 'agent' : 'customer';
    const otherKeys = TOKEN_KEYS[otherUserType];

    localStorage.removeItem(otherKeys.primary);
    localStorage.removeItem(otherKeys.secondary);
    localStorage.removeItem(otherKeys.backup);
    // Don't remove userData as it might be needed for reference

    console.log(`✅ ${userType} token saved successfully`);
    console.log(`🔐 Token preview: ${token.substring(0, 20)}...`);

    return true;

  } catch (error) {
    console.error('❌ Error saving token:', error);
    return false;
  }
};

/**
 * Get token with user type detection
 * @param {string} preferredUserType - Preferred user type to check first
 * @returns {object} - {token, userType, userData}
 */
export const getToken = (preferredUserType = null) => {
  try {
    console.log('🔍 Getting token with preferred type:', preferredUserType);

    let token = null;
    let detectedUserType = null;
    let userData = null;

    // Check preferred user type first
    if (preferredUserType && TOKEN_KEYS[preferredUserType]) {
      const keys = TOKEN_KEYS[preferredUserType];
      token = localStorage.getItem(keys.primary) ||
        localStorage.getItem(keys.secondary) ||
        localStorage.getItem(keys.backup);

      if (token) {
        detectedUserType = preferredUserType;
        try {
          userData = JSON.parse(localStorage.getItem(keys.userData) || '{}');
        } catch (e) {
          console.warn('⚠️ Error parsing user data for', preferredUserType);
        }
      }
    }

    // If no token found, check stored user type
    if (!token) {
      const storedUserType = localStorage.getItem('userType') || localStorage.getItem('user_type');
      if (storedUserType && TOKEN_KEYS[storedUserType]) {
        const keys = TOKEN_KEYS[storedUserType];
        token = localStorage.getItem(keys.primary) ||
          localStorage.getItem(keys.secondary) ||
          localStorage.getItem(keys.backup);

        if (token) {
          detectedUserType = storedUserType;
          try {
            userData = JSON.parse(localStorage.getItem(keys.userData) || '{}');
          } catch (e) {
            console.warn('⚠️ Error parsing user data for', storedUserType);
          }
        }
      }
    }

    // If still no token, check both types
    if (!token) {
      // Check agent first (higher priority)
      const agentKeys = TOKEN_KEYS.agent;
      token = localStorage.getItem(agentKeys.primary) ||
        localStorage.getItem(agentKeys.secondary) ||
        localStorage.getItem(agentKeys.backup);

      if (token) {
        detectedUserType = 'agent';
        try {
          userData = JSON.parse(localStorage.getItem(agentKeys.userData) || '{}');
        } catch (e) {
          console.warn('⚠️ Error parsing agent data');
        }
      } else {
        // Check customer tokens
        const customerKeys = TOKEN_KEYS.customer;
        token = localStorage.getItem(customerKeys.primary) ||
          localStorage.getItem(customerKeys.secondary) ||
          localStorage.getItem(customerKeys.backup);

        if (token) {
          detectedUserType = 'customer';
          try {
            userData = JSON.parse(localStorage.getItem(customerKeys.userData) || '{}');
          } catch (e) {
            console.warn('⚠️ Error parsing customer data');
          }
        }
      }
    }

    // Get additional user context if available
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.userType) {
        userData = { ...userData, ...currentUser };
      }
    } catch (e) {
      console.warn('⚠️ Error parsing current user data');
    }

    const result = {
      token,
      userType: detectedUserType,
      userData: userData || {},
      hasToken: !!token
    };

    console.log('🔍 Token retrieval result:', {
      hasToken: result.hasToken,
      userType: result.userType,
      tokenPreview: result.token ? `${result.token.substring(0, 15)}...` : 'None'
    });

    return result;

  } catch (error) {
    console.error('❌ Error getting token:', error);
    return {
      token: null,
      userType: null,
      userData: {},
      hasToken: false
    };
  }
};

/**
 * Check if user is authenticated with specific user type
 * @param {string} requiredUserType - Required user type ('customer' or 'agent')
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = (requiredUserType = null) => {
  const { token, userType } = getToken(requiredUserType);

  if (!token) {
    console.log('❌ No token found - not authenticated');
    return false;
  }

  if (requiredUserType && userType !== requiredUserType) {
    console.log(`❌ User type mismatch - required: ${requiredUserType}, found: ${userType}`);
    return false;
  }

  // Basic token validation (check if it's not expired)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      console.log('❌ Token expired');
      removeToken(userType);
      return false;
    }
  } catch (e) {
    console.warn('⚠️ Could not validate token expiry, assuming valid');
  }

  console.log(`✅ User authenticated as ${userType}`);
  return true;
};

/**
 * Remove token and user data
 * @param {string} userType - User type to remove tokens for
 */
export const removeToken = (userType = null) => {
  try {
    console.log('🗑️ Removing tokens for user type:', userType);

    if (userType && TOKEN_KEYS[userType]) {
      // Remove specific user type tokens
      const keys = TOKEN_KEYS[userType];
      localStorage.removeItem(keys.primary);
      localStorage.removeItem(keys.secondary);
      localStorage.removeItem(keys.backup);
      localStorage.removeItem(keys.userData);
    } else {
      // Remove all tokens
      Object.values(TOKEN_KEYS).forEach(keys => {
        localStorage.removeItem(keys.primary);
        localStorage.removeItem(keys.secondary);
        localStorage.removeItem(keys.backup);
        localStorage.removeItem(keys.userData);
      });
    }

    // Remove common keys
    localStorage.removeItem('userType');
    localStorage.removeItem('user_type');
    localStorage.removeItem('currentUser');

    // Clear any additional token keys that might exist
    const additionalKeys = ['accessToken', 'jwt', 'Bearer', 'auth_token'];
    additionalKeys.forEach(key => localStorage.removeItem(key));

    console.log('✅ Tokens removed successfully');

  } catch (error) {
    console.error('❌ Error removing tokens:', error);
  }
};

/**
 * Switch user type (for testing or admin purposes)
 * @param {string} newUserType - New user type to switch to
 * @param {object} userData - User data for new type
 */
export const switchUserType = (newUserType, userData = {}) => {
  try {
    console.log('🔄 Switching user type to:', newUserType);

    if (!['customer', 'agent'].includes(newUserType)) {
      console.error('❌ Invalid user type for switch:', newUserType);
      return false;
    }

    // Remove current tokens
    removeToken();

    // Set new user type (token will be set on next login)
    localStorage.setItem('userType', newUserType);
    localStorage.setItem('user_type', newUserType);

    if (userData && Object.keys(userData).length > 0) {
      const keys = TOKEN_KEYS[newUserType];
      localStorage.setItem(keys.userData, JSON.stringify(userData));
    }

    console.log('✅ User type switched successfully');
    return true;

  } catch (error) {
    console.error('❌ Error switching user type:', error);
    return false;
  }
};

/**
 * Get user type from storage or context
 * @returns {string|null} - User type or null
 */
export const getUserType = () => {
  const { userType } = getToken();
  return userType || localStorage.getItem('userType') || localStorage.getItem('user_type') || null;
};

/**
 * Get current user data
 * @returns {object} - User data object
 */
export const getCurrentUser = () => {
  const { userData, userType } = getToken();

  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
      ...userData,
      ...currentUser,
      userType: userType || currentUser.userType
    };
  } catch (e) {
    return { ...userData, userType };
  }
};

/**
 * Debug function to show all stored tokens and user data
 */
export const debugTokenStorage = () => {
  console.log('🔧 DEBUG: Token Storage State');

  Object.entries(TOKEN_KEYS).forEach(([type, keys]) => {
    console.log(`\n📋 ${type.toUpperCase()} TOKENS:`);
    Object.entries(keys).forEach(([keyType, key]) => {
      const value = localStorage.getItem(key);
      console.log(`  ${keyType}: ${value ? (keyType.includes('token') ? `${value.substring(0, 20)}...` : value) : 'null'}`);
    });
  });

  // Show common keys
  console.log('\n📋 COMMON KEYS:');
  ['userType', 'user_type', 'currentUser'].forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value || 'null'}`);
  });

  // Show current detection result
  const current = getToken();
  console.log('\n🎯 CURRENT DETECTION:');
  console.log('  Token:', current.hasToken ? `${current.token.substring(0, 20)}...` : 'null');
  console.log('  User Type:', current.userType);
  console.log('  User Data:', current.userData);
};

// Export debug function for development
if (process.env.NODE_ENV === 'development') {
  window.debugTokenStorage = debugTokenStorage;
}

export default {
  saveToken,
  getToken,
  isAuthenticated,
  removeToken,
  switchUserType,
  getUserType,
  getCurrentUser,
  debugTokenStorage
};