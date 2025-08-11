// // src/context/AuthContext.js
// import React, { createContext, useEffect, useState } from 'react';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [userType, setUserType] = useState(null); // "customer" or "agent"


//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     const savedUserType = localStorage.getItem('userType');

//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     if (savedUserType) {
//       setUserType(savedUserType);
//     }
//   }, []);

//   const login = (userData, type) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('userType', type);
//     setUser(userData);
//     setUserType(type);
//   };

//   const logout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('userType');
//     setUser(null);
//     setUserType(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, userType, setUserType, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };








// src/components/Context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getToken, getCurrentUser, removeToken, getUserType, isAuthenticated } from '../Login/utils/tokenUtils';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication state...');

      // Get token and user data using tokenUtils
      const tokenData = getToken();
      const { token, userType: detectedUserType, userData, hasToken } = tokenData;

      console.log('🔍 Token detection result:', {
        hasToken,
        userType: detectedUserType,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
      });

      if (hasToken && token && detectedUserType) {
        // Verify token is still valid
        if (isAuthenticated(detectedUserType)) {
          console.log(`✅ Valid ${detectedUserType} session found`);
          
          // Get complete user data
          const completeUserData = getCurrentUser();
          
          setUser(completeUserData);
          setUserType(detectedUserType);
          setIsLoggedIn(true);
          
          console.log(`✅ ${detectedUserType} session restored successfully`);
        } else {
          console.log('❌ Token invalid or expired, clearing session');
          clearAuth();
        }
      } else {
        console.log('ℹ️ No valid session found');
        clearAuth();
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      clearAuth();
    } finally {
      setLoading(false);
      console.log('✅ Auth initialization complete');
    }
  };

  // Customer login function
  const login = (userData, token = null) => {
    try {
      console.log('🔐 Customer login initiated:', userData);

      const customerData = {
        ...userData,
        userType: 'customer',
        loginTime: new Date().toISOString()
      };

      setUser(customerData);
      setUserType('customer');
      setIsLoggedIn(true);

      console.log('✅ Customer login successful');
      return true;
    } catch (error) {
      console.error('❌ Customer login error:', error);
      return false;
    }
  };

  // Agent login function
  const agentLogin = (agentData, token = null) => {
    try {
      console.log('🔐 Agent login initiated:', agentData);

      const enhancedAgentData = {
        ...agentData,
        userType: 'agent',
        loginTime: new Date().toISOString(),
        isAgent: true
      };

      setUser(enhancedAgentData);
      setUserType('agent');
      setIsLoggedIn(true);

      console.log('✅ Agent login successful');
      return true;
    } catch (error) {
      console.error('❌ Agent login error:', error);
      return false;
    }
  };

  // Generic logout function
  const logout = (redirectTo = '/login/customer') => {
    try {
      console.log(`🔓 Logging out ${userType} user...`);

      // Clear tokens using tokenUtils
      removeToken(userType);

      // Clear state
      clearAuth();

      console.log('✅ Logout successful');

      // Redirect if needed
      if (redirectTo && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 100);
      }

      return true;
    } catch (error) {
      console.error('❌ Logout error:', error);
      return false;
    }
  };

  // Clear auth state
  const clearAuth = () => {
    setUser(null);
    setUserType(null);
    setIsLoggedIn(false);
  };

  // Check if user has specific permissions
  const hasPermission = (requiredUserType) => {
    if (!isLoggedIn || !userType) return false;
    if (!requiredUserType) return true;
    return userType === requiredUserType;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.firstName || user.mobile || 'User';
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    if (!userType) return 'User';
    return userType === 'agent' ? 'Agent' : 'Customer';
  };

  // Check if current session is for customer
  const isCustomer = () => {
    return isLoggedIn && userType === 'customer';
  };

  // Check if current session is for agent
  const isAgent = () => {
    return isLoggedIn && userType === 'agent';
  };

  // Force refresh auth state
  const refreshAuthState = () => {
    console.log('🔄 Refreshing auth state...');
    setLoading(true);
    initializeAuth();
  };

  // Get booking endpoints based on user type
  const getBookingEndpoints = () => {
    const baseURL = 'https://api.rasutrip.com/api/v1';

    if (userType === 'agent') {
      return {
        upcoming: `${baseURL}/agent/bus-bookings/upcoming`,
        upcomingFallback: `${baseURL}/busservice/up-comming-bookings`,
        allFallback: `${baseURL}/busservice/my-bookings`
      };
    } else {
      return {
        upcoming: `${baseURL}/busservice/up-comming-bookings`,
        all: `${baseURL}/busservice/my-bookings`
      };
    }
  };

  const contextValue = {
    // State
    user,
    userType,
    loading,
    isLoggedIn,

    // Actions
    login,
    agentLogin,
    logout,
    refreshAuthState,

    // Utilities
    hasPermission,
    getUserDisplayName,
    getUserTypeDisplay,
    isCustomer,
    isAgent,
    getBookingEndpoints,

    // For debugging
    clearAuth
  };

  // Show loading spinner during initialization
  if (loading) {
    return (
      <AuthContext.Provider value={{ ...contextValue, loading: true }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
            Loading application...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };