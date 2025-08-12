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
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
        userData: userData ? Object.keys(userData) : 'None'
      });

      if (hasToken && token && detectedUserType) {
        // Verify token is still valid
        if (isAuthenticated(detectedUserType)) {
          console.log(`✅ Valid ${detectedUserType} session found`);
          
          // Get complete user data with enhanced name handling
          const completeUserData = getCurrentUser();
          const enhancedUserData = enhanceUserData(completeUserData, detectedUserType);
          
          setUser(enhancedUserData);
          setUserType(detectedUserType);
          setIsLoggedIn(true);
          
          console.log(`✅ ${detectedUserType} session restored successfully`, {
            name: enhancedUserData.name,
            displayName: enhancedUserData.displayName,
            mobile: enhancedUserData.mobile
          });
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

  // Enhanced user data processing with proper name priority
  const enhanceUserData = (userData, userType) => {
    if (!userData || typeof userData !== 'object') {
      return {
        userType,
        name: 'User',
        displayName: 'User',
        firstName: 'User',
        lastName: '',
        fullName: 'User',
        mobile: '',
        email: '',
        initials: 'U'
      };
    }

    console.log('📊 Processing user data:', userData);

    // Get stored profile data for this mobile number
    const mobile = userData.mobile || '';
    const storedProfile = getStoredUserProfile(mobile);
    
    // Priority order for name determination:
    // 1. Stored profile name (from signup)
    // 2. Current userData name
    // 3. Current userData fullName  
    // 4. firstName + lastName combination
    // 5. Fallback methods
    
    let finalName = 'User';
    let nameSource = 'fallback';

    // Check stored profile first (highest priority)
    if (storedProfile && storedProfile.name && storedProfile.name.trim() !== '' && storedProfile.name !== 'User') {
      finalName = storedProfile.name.trim();
      nameSource = 'stored_profile';
    }
    // Check current userData name
    else if (userData.name && userData.name.trim() !== '' && userData.name !== 'User') {
      finalName = userData.name.trim();
      nameSource = 'current_name';
    }
    // Check fullName
    else if (userData.fullName && userData.fullName.trim() !== '' && userData.fullName !== 'User') {
      finalName = userData.fullName.trim();
      nameSource = 'full_name';
    }
    // Check firstName + lastName
    else if (userData.firstName && userData.firstName.trim() !== '' && userData.firstName !== 'User') {
      const lastName = userData.lastName ? userData.lastName.trim() : '';
      finalName = `${userData.firstName.trim()} ${lastName}`.trim();
      nameSource = 'first_last_name';
    }
    // Check displayName
    else if (userData.displayName && userData.displayName.trim() !== '' && userData.displayName !== 'User') {
      finalName = userData.displayName.trim();
      nameSource = 'display_name';
    }

    console.log(`📝 Name determined: "${finalName}" (source: ${nameSource})`);

    // Parse name components
    const nameParts = finalName.split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const fullName = finalName;

    // Create enhanced user object
    const enhancedUser = {
      // Original data
      ...userData,
      
      // Enhanced name fields (these override any existing values)
      name: finalName,
      displayName: finalName,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      
      // Additional fields
      userType,
      mobile: userData.mobile || '',
      email: userData.email || '',
      initials: getInitials(finalName),
      nameSource: nameSource, // For debugging
      
      // Timestamps
      lastLoginTime: userData.lastLoginTime || new Date().toISOString(),
      profileUpdatedAt: new Date().toISOString()
    };

    // Save/update the profile data
    if (mobile && finalName !== 'User') {
      saveUserProfileToStorage(mobile, enhancedUser);
    }

    console.log('✅ Enhanced user data created:', {
      name: enhancedUser.name,
      firstName: enhancedUser.firstName,
      mobile: enhancedUser.mobile,
      nameSource: enhancedUser.nameSource
    });

    return enhancedUser;
  };

  // Get stored user profile from localStorage
  const getStoredUserProfile = (mobile) => {
    try {
      if (!mobile) return null;
      
      const cleanMobile = mobile.replace(/\D/g, '');
      
      // Try to get from userProfile storage
      const profileKey = `userProfile_${cleanMobile}`;
      const storedProfile = localStorage.getItem(profileKey);
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        console.log('📖 Retrieved stored profile:', profile);
        return profile;
      }
      
      // Try to get from userNames storage (fallback)
      const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
      const savedName = userNames[cleanMobile] || userNames[`+91${cleanMobile}`] || userNames[mobile];
      
      if (savedName && savedName !== 'User') {
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
      
      // Create comprehensive profile object
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
        signupCompleted: true
      };
      
      // Save profile
      const profileKey = `userProfile_${cleanMobile}`;
      localStorage.setItem(profileKey, JSON.stringify(profileData));
      
      // Also save in userNames for backward compatibility
      const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
      userNames[cleanMobile] = userData.name;
      userNames[`+91${cleanMobile}`] = userData.name;
      localStorage.setItem('userNames', JSON.stringify(userNames));
      
      // Individual name storage
      localStorage.setItem(`userName_${cleanMobile}`, userData.name);
      
      console.log('💾 Profile saved to storage:', {
        mobile: cleanMobile,
        name: userData.name,
        key: profileKey
      });
      
    } catch (error) {
      console.error('❌ Error saving profile to storage:', error);
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

  // Enhanced customer login function
  const login = (userData, token = null) => {
    try {
      console.log('🔐 Customer login initiated with data:', userData);

      // Ensure we have mobile number
      if (!userData.mobile) {
        console.error('❌ Login failed: No mobile number provided');
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

      console.log('✅ Customer login successful:', {
        name: enhancedUserData.name,
        displayName: enhancedUserData.displayName,
        mobile: enhancedUserData.mobile
      });
      
      return true;
    } catch (error) {
      console.error('❌ Customer login error:', error);
      return false;
    }
  };

  // Enhanced agent login function  
  const agentLogin = (agentData, token = null) => {
    try {
      console.log('🔐 Agent login initiated:', agentData);

      const enhancedAgentData = enhanceUserData({
        ...agentData,
        userType: 'agent',
        loginTime: new Date().toISOString(),
        isAgent: true
      }, 'agent');

      setUser(enhancedAgentData);
      setUserType('agent');
      setIsLoggedIn(true);

      console.log('✅ Agent login successful:', {
        name: enhancedAgentData.name,
        mobile: enhancedAgentData.mobile
      });
      
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

  // Enhanced user display name getter
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.displayName || user.name || user.fullName || 'User';
  };

  // Get user's first name for personalized greetings
  const getUserFirstName = () => {
    if (!user) return 'User';
    return user.firstName || user.name?.split(' ')[0] || 'User';
  };

  // Get user's full name for formal contexts
  const getUserFullName = () => {
    if (!user) return 'User';
    return user.fullName || user.name || user.displayName || 'User';
  };

  // Get user initials for avatar display
  const getUserInitials = () => {
    if (!user) return 'U';
    return user.initials || getInitials(getUserDisplayName());
  };

  // Get user mobile number
  const getUserMobile = () => {
    if (!user) return '';
    return user.mobile || '';
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
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

  // Update user data (for profile updates)
  const updateUserData = (newUserData) => {
    try {
      console.log('🔄 Updating user data:', newUserData);
      
      const updatedUserData = enhanceUserData({
        ...user,
        ...newUserData,
        lastUpdated: new Date().toISOString()
      }, userType);
      
      setUser(updatedUserData);
      
      // Also update in localStorage and tokenUtils
      const currentTokenData = getToken();
      if (currentTokenData.hasToken) {
        const { saveToken } = require('../Login/utils/tokenUtils');
        saveToken(currentTokenData.token, userType, updatedUserData);
      }
      
      console.log('✅ User data updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      return false;
    }
  };

  // Get greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = getUserFirstName();
    
    if (hour < 12) return `Good Morning, ${firstName}!`;
    if (hour < 17) return `Good Afternoon, ${firstName}!`;
    return `Good Evening, ${firstName}!`;
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

  // Save user profile data during signup/registration
  const saveUserProfile = (mobile, profileData) => {
    try {
      console.log('💾 Saving user profile:', { mobile, profileData });
      
      if (!mobile || !profileData) {
        console.error('❌ Cannot save profile: missing mobile or data');
        return false;
      }

      const cleanMobile = mobile.replace(/\D/g, '');
      
      // Create complete profile
      const completeProfile = {
        mobile: cleanMobile,
        name: profileData.name || 'User',
        firstName: profileData.firstName || profileData.name?.split(' ')[0] || 'User',
        lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || '',
        fullName: profileData.fullName || profileData.name || 'User',
        displayName: profileData.displayName || profileData.name || 'User',
        email: profileData.email || '',
        userType: profileData.userType || 'customer',
        signupDate: new Date().toISOString(),
        signupCompleted: true,
        isActive: true
      };

      saveUserProfileToStorage(cleanMobile, completeProfile);
      
      console.log('✅ User profile saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      return false;
    }
  };

  // Get complete user profile info for display
  const getUserProfile = () => {
    if (!user) return null;
    
    return {
      name: getUserDisplayName(),
      firstName: getUserFirstName(),
      fullName: getUserFullName(),
      mobile: getUserMobile(),
      email: getUserEmail(),
      initials: getUserInitials(),
      userType: userType,
      userTypeDisplay: getUserTypeDisplay(),
      isCustomer: isCustomer(),
      isAgent: isAgent(),
      greeting: getTimeBasedGreeting()
    };
  };

  // Get profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = {
      name: user.name && user.name !== 'User' ? 1 : 0,
      mobile: user.mobile ? 1 : 0,
      email: user.email ? 1 : 0,
      firstName: user.firstName && user.firstName !== 'User' ? 1 : 0,
    };
    
    const completedFields = Object.values(fields).reduce((sum, val) => sum + val, 0);
    const totalFields = Object.keys(fields).length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    return getProfileCompletion() >= 75; // Consider 75% as complete
  };

  // Get missing profile fields
  const getMissingProfileFields = () => {
    if (!user) return ['name', 'mobile'];
    
    const missing = [];
    
    if (!user.name || user.name === 'User') missing.push('name');
    if (!user.mobile) missing.push('mobile');
    if (!user.email) missing.push('email');
    
    return missing;
  };

  // Get profile status message
  const getProfileStatusMessage = () => {
    const completion = getProfileCompletion();
    
    if (completion === 100) {
      return { type: 'success', message: 'Your profile is complete!' };
    } else if (completion >= 75) {
      return { type: 'warning', message: 'Almost done! Add your email to complete profile.' };
    } else if (completion >= 50) {
      return { type: 'info', message: 'Please complete your profile for better experience.' };
    } else {
      return { type: 'danger', message: 'Your profile needs attention. Please update your details.' };
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
    updateUserData,
    saveUserProfile,

    // Enhanced Utilities
    hasPermission,
    getUserDisplayName,
    getUserFirstName,
    getUserFullName,
    getUserInitials,
    getUserMobile,
    getUserEmail,
    getUserTypeDisplay,
    getTimeBasedGreeting,
    isCustomer,
    isAgent,
    getBookingEndpoints,
    getUserProfile,
    
    // Profile Completion Functions
    getProfileCompletion,
    isProfileComplete,
    getMissingProfileFields,
    getProfileStatusMessage,

    // For debugging
    clearAuth
  };

  // Show loading spinner during initialization
  if (loading) {
    return (
      <AuthContext.Provider value={{ ...contextValue, loading: true }}>
       
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