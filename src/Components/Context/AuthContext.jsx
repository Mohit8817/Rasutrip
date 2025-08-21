// src/components/Context/AuthContext.js - Cleaned and Optimized
import React, { createContext, useState, useEffect } from 'react';
import { getToken, getCurrentUser, removeToken, getUserType, isAuthenticated, saveToken } from '../Login/utils/tokenUtils';

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

      const tokenData = getToken();
      const { token, userType: detectedUserType, userData, hasToken } = tokenData;

      console.log('🔍 Token detection:', {
        hasToken,
        userType: detectedUserType,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
      });

      if (hasToken && token && detectedUserType) {
        if (isAuthenticated(detectedUserType)) {
          console.log(`✅ Valid ${detectedUserType} session found`);

          const completeUserData = getCurrentUser();
          const enhancedUserData = enhanceUserData(completeUserData, detectedUserType);

          setUser(enhancedUserData);
          setUserType(detectedUserType);
          setIsLoggedIn(true);

          console.log(`✅ ${detectedUserType} session restored:`, {
            name: enhancedUserData.name,
            mobile: enhancedUserData.mobile
          });

          // Ensure agent token storage
          if (detectedUserType === 'agent' && token) {
            ensureAgentTokenStorage(token, enhancedUserData);
          }
        } else {
          console.log('❌ Token invalid, clearing session');
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
    }
  };

  // Ensure agent token is stored properly
  const ensureAgentTokenStorage = (token, agentData) => {
    try {
      console.log('🔧 Ensuring agent token storage...');

      localStorage.setItem('agent_token', token);
      localStorage.setItem('agentToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);

      localStorage.setItem('userType', 'agent');
      localStorage.setItem('user_type', 'agent');
      localStorage.setItem('isAgent', 'true');

      localStorage.setItem('agent', JSON.stringify(agentData));
      localStorage.setItem('user', JSON.stringify(agentData));
      localStorage.setItem('currentUser', JSON.stringify(agentData));

      localStorage.setItem('agentId', agentData.agentId || '');
      localStorage.setItem('agentMobile', agentData.mobile || '');
      localStorage.setItem('userName', agentData.name || '');

      console.log('✅ Agent token storage complete');
    } catch (error) {
      console.error('❌ Error ensuring agent token storage:', error);
    }
  };

  // Enhanced user data processing with proper name priority
  const enhanceUserData = (userData, userType) => {
    if (!userData || typeof userData !== 'object') {
      const defaultName = userType === 'agent' ? 'Agent' : 'User';
      return {
        userType,
        name: defaultName,
        displayName: defaultName,
        firstName: defaultName,
        lastName: '',
        fullName: defaultName,
        mobile: '',
        email: '',
        initials: defaultName.charAt(0),
        ...(userType === 'agent' && {
          isAgent: true,
          agentId: '',
          role: 'agent'
        })
      };
    }

    console.log('📊 Processing user data for', userType);

    const mobile = userData.mobile || '';
    const storedProfile = getStoredUserProfile(mobile);

    // Priority order for name determination:
    // 1. Stored profile (from signup) - HIGHEST PRIORITY
    // 2. Current userData name
    // 3. Current userData fullName  
    // 4. firstName + lastName combination
    // 5. Fallback

    let finalName = userType === 'agent' ? 'Agent' : 'User';
    let nameSource = 'fallback';

    if (storedProfile?.name && storedProfile.name.trim() !== '' &&
      storedProfile.name !== 'User' && storedProfile.name !== 'Agent') {
      finalName = storedProfile.name.trim();
      nameSource = 'stored_profile';
    }
    else if (userData.name && userData.name.trim() !== '' &&
      userData.name !== 'User' && userData.name !== 'Agent') {
      finalName = userData.name.trim();
      nameSource = 'current_name';
    }
    else if (userData.fullName && userData.fullName.trim() !== '' &&
      userData.fullName !== 'User' && userData.fullName !== 'Agent') {
      finalName = userData.fullName.trim();
      nameSource = 'full_name';
    }
    else if (userData.firstName && userData.firstName.trim() !== '' &&
      userData.firstName !== 'User' && userData.firstName !== 'Agent') {
      const lastName = userData.lastName ? userData.lastName.trim() : '';
      finalName = `${userData.firstName.trim()} ${lastName}`.trim();
      nameSource = 'first_last_name';
    }

    console.log(`📝 Name determined: "${finalName}" (source: ${nameSource})`);

    const nameParts = finalName.split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || (userType === 'agent' ? 'Agent' : 'User');
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create enhanced user object
    const enhancedUser = {
      ...userData,

      // Enhanced name fields (override any existing values)
      name: finalName,
      displayName: finalName,
      firstName: firstName,
      lastName: lastName,
      fullName: finalName,

      // Additional fields
      userType,
      mobile: userData.mobile || '',
      email: userData.email || '',
      initials: getInitials(finalName),

      // Timestamps
      lastLoginTime: userData.lastLoginTime || new Date().toISOString(),
    };

    // Add agent-specific fields
    if (userType === 'agent') {
      enhancedUser.isAgent = true;
      enhancedUser.role = 'agent';
      enhancedUser.agentId = userData.agentId || userData.id || userData.mobile || '';
      enhancedUser.agentCode = userData.agentCode || userData.code || '';
      enhancedUser.permissions = userData.permissions || ['booking', 'search', 'cancel', 'view'];
      enhancedUser.status = userData.status || 'active';
      enhancedUser.isActive = userData.isActive !== false;
      enhancedUser.commission = userData.commission || 0;
      enhancedUser.balance = userData.balance || 0;
    }

    // Save/update the profile data for future use
    if (mobile && finalName !== 'User' && finalName !== 'Agent') {
      saveUserProfileToStorage(mobile, enhancedUser);
    }

    console.log('✅ Enhanced user data created:', {
      name: enhancedUser.name,
      userType: enhancedUser.userType,
      mobile: enhancedUser.mobile
    });

    return enhancedUser;
  };

  // Get stored user profile from localStorage
  const getStoredUserProfile = (mobile) => {
    try {
      if (!mobile) return null;

      const cleanMobile = mobile.replace(/\D/g, '');

      // Try userProfile storage first
      const profileKey = `userProfile_${cleanMobile}`;
      const storedProfile = localStorage.getItem(profileKey);

      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        console.log('📖 Retrieved stored profile:', profile.name);
        return profile;
      }

      // Fallback to userNames storage
      const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
      const savedName = userNames[cleanMobile] || userNames[`+91${cleanMobile}`] || userNames[mobile];

      if (savedName && savedName !== 'User' && savedName !== 'Agent') {
        console.log('📖 Retrieved name from userNames:', savedName);
        return { name: savedName, mobile: cleanMobile };
      }

      return null;
    } catch (error) {
      console.error('❌ Error retrieving stored profile:', error);
      return null;
    }
  };

  // Save user profile to localStorage
  const saveUserProfileToStorage = (mobile, userData) => {
    try {
      if (!mobile || !userData) return;

      const cleanMobile = mobile.replace(/\D/g, '');

      const profileData = {
        mobile: cleanMobile,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        displayName: userData.displayName,
        email: userData.email || '',
        userType: userData.userType,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        signupCompleted: true,
        ...(userData.userType === 'agent' && {
          isAgent: true,
          agentId: userData.agentId,
          role: 'agent'
        })
      };

      // Save profile
      const profileKey = `userProfile_${cleanMobile}`;
      localStorage.setItem(profileKey, JSON.stringify(profileData));

      // Also save in userNames for backward compatibility
      const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
      userNames[cleanMobile] = userData.name;
      userNames[`+91${cleanMobile}`] = userData.name;
      localStorage.setItem('userNames', JSON.stringify(userNames));

      localStorage.setItem(`userName_${cleanMobile}`, userData.name);

      console.log('💾 Profile saved:', {
        mobile: cleanMobile,
        name: userData.name,
        userType: userData.userType
      });
    } catch (error) {
      console.error('❌ Error saving profile:', error);
    }
  };

  // Helper function to get user initials
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';

    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
  };

  // Customer login function
  const login = (userData, token = null) => {
    try {
      console.log('🔐 Customer login initiated');

      if (!userData.mobile) {
        console.error('❌ No mobile number provided');
        return false;
      }

      const enhancedUserData = enhanceUserData({
        ...userData,
        userType: 'customer',
        loginTime: new Date().toISOString()
      }, 'customer');

      setUser(enhancedUserData);
      setUserType('customer');
      setIsLoggedIn(true);

      console.log('✅ Customer login successful:', enhancedUserData.name);
      return true;
    } catch (error) {
      console.error('❌ Customer login error:', error);
      return false;
    }
  };

  // Agent login function
  const agentLogin = (agentData, token = null) => {
    try {
      console.log('🔐 Agent login initiated');

      if (!agentData.mobile) {
        console.error('❌ No mobile number provided');
        return false;
      }

      const enhancedAgentData = enhanceUserData({
        ...agentData,
        userType: 'agent',
        loginTime: new Date().toISOString(),
        isAgent: true
      }, 'agent');

      setUser(enhancedAgentData);
      setUserType('agent');
      setIsLoggedIn(true);

      // Ensure agent token storage
      if (token) {
        ensureAgentTokenStorage(token, enhancedAgentData);
      } else {
        const currentToken = getToken('agent');
        if (currentToken.hasToken) {
          ensureAgentTokenStorage(currentToken.token, enhancedAgentData);
        }
      }

      console.log('✅ Agent login successful:', enhancedAgentData.name);
      return true;
    } catch (error) {
      console.error('❌ Agent login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      console.log(`🔓 Logging out ${userType} user...`);

      // Clear tokens using tokenUtils
      removeToken(userType);

      // Additional cleanup for agent
      if (userType === 'agent') {
        localStorage.removeItem('agent_token');
        localStorage.removeItem('agentToken');
        localStorage.removeItem('isAgent');
        localStorage.removeItem('agentId');
        localStorage.removeItem('agentMobile');
      }

      // Clear state
      clearAuth();

      console.log('✅ Logout successful');

      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 100);

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

  // User display functions
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.displayName || user.name || user.fullName || 'User';
  };

  const getUserFirstName = () => {
    if (!user) return 'User';
    return user.firstName || user.name?.split(' ')[0] || 'User';
  };

  const getUserFullName = () => {
    if (!user) return 'User';
    return user.fullName || user.name || user.displayName || 'User';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.initials || getInitials(getUserDisplayName());
  };

  const getUserMobile = () => {
    if (!user) return '';
    const mobile = user.mobile || '';
    if (mobile.length >= 10) {
      const cleaned = mobile.replace(/\D/g, '');
      return `+91 ${cleaned.slice(-10, -5)} ${cleaned.slice(-5)}`;
    }
    return mobile;
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  // User type checks
  const isCustomer = () => {
    return isLoggedIn && userType === 'customer';
  };

  const isAgent = () => {
    return isLoggedIn && userType === 'agent';
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = getUserFirstName();
    const userTypeText = userType === 'agent' ? ' (Agent)' : '';

    if (hour < 12) return `Good Morning, ${firstName}${userTypeText}!`;
    if (hour < 17) return `Good Afternoon, ${firstName}${userTypeText}!`;
    return `Good Evening, ${firstName}${userTypeText}!`;
  };

  // Agent-specific functions
  const getAgentInfo = () => {
    if (!isAgent() || !user) return null;

    return {
      agentId: user.agentId || '',
      agentCode: user.agentCode || '',
      commission: user.commission || 0,
      balance: user.balance || 0,
      permissions: user.permissions || [],
      status: user.status || 'active',
      isActive: user.isActive !== false
    };
  };

  const hasAgentPermission = (permission) => {
    if (!isAgent() || !user) return false;
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  };

  // Save user profile during signup
  const saveUserProfile = (mobile, profileData) => {
    try {
      console.log('💾 Saving user profile for signup');

      if (!mobile || !profileData) {
        console.error('❌ Cannot save profile: missing data');
        return false;
      }

      const cleanMobile = mobile.replace(/\D/g, '');

      const completeProfile = {
        mobile: cleanMobile,
        name: profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        firstName: profileData.firstName || profileData.name?.split(' ')[0] || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || '',
        fullName: profileData.fullName || profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        displayName: profileData.displayName || profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        email: profileData.email || '',
        userType: profileData.userType || 'customer',
        signupDate: new Date().toISOString(),
        signupCompleted: true,
        ...(profileData.userType === 'agent' && {
          isAgent: true,
          agentId: profileData.agentId || cleanMobile,
          role: 'agent'
        })
      };

      saveUserProfileToStorage(cleanMobile, completeProfile);

      console.log('✅ User profile saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      return false;
    }
  };

  // Update user data
  const updateUserData = (newUserData) => {
    try {
      console.log('🔄 Updating user data');

      const updatedUserData = enhanceUserData({
        ...user,
        ...newUserData,
        lastUpdated: new Date().toISOString()
      }, userType);

      setUser(updatedUserData);

      // Update in localStorage
      const currentTokenData = getToken();
      if (currentTokenData.hasToken) {
        saveToken(currentTokenData.token, userType, updatedUserData);

        if (userType === 'agent') {
          ensureAgentTokenStorage(currentTokenData.token, updatedUserData);
        }
      }

      console.log('✅ User data updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      return false;
    }
  };

  // Refresh auth state
  const refreshAuthState = () => {
    console.log('🔄 Refreshing auth state...');
    setLoading(true);
    initializeAuth();
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
    updateUserData,
    saveUserProfile,

    // Utilities
    getUserDisplayName,
    getUserFirstName,
    getUserFullName,
    getUserInitials,
    getUserMobile,
    getUserEmail,
    getTimeBasedGreeting,
    isCustomer,
    isAgent,

    // Agent-specific
    getAgentInfo,
    hasAgentPermission,

    // For debugging
    clearAuth
  };

  // Show loading spinner during initialization
  if (loading) {
    return (
      <AuthContext.Provider value={{ ...contextValue, loading: true }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Initializing...</div>
          </div>
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