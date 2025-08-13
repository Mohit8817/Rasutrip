// src/components/Context/AuthContext.js - Enhanced with Better Agent Support
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
            mobile: enhancedUserData.mobile,
            agentId: detectedUserType === 'agent' ? enhancedUserData.agentId : 'N/A'
          });

          // 🎯 CRITICAL: Ensure agent token is properly stored after context init
          if (detectedUserType === 'agent' && token) {
            ensureAgentTokenStorage(token, enhancedUserData);
          }

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

  // 🎯 CRITICAL: Ensure agent token is stored in all necessary locations
  const ensureAgentTokenStorage = (token, agentData) => {
    try {
      console.log('🔧 Ensuring comprehensive agent token storage...');
      
      // Store in multiple locations for maximum compatibility
      localStorage.setItem('agent_token', token);
      localStorage.setItem('agentToken', token);
      localStorage.setItem('token', token); // Some APIs expect this key
      localStorage.setItem('authToken', token);
      
      // Store user type explicitly
      localStorage.setItem('userType', 'agent');
      localStorage.setItem('user_type', 'agent');
      localStorage.setItem('accountType', 'agent');
      localStorage.setItem('isAgent', 'true');
      
      // Store agent data in multiple formats
      localStorage.setItem('agent', JSON.stringify(agentData));
      localStorage.setItem('user', JSON.stringify(agentData)); // For components expecting 'user'
      localStorage.setItem('currentUser', JSON.stringify(agentData));
      
      // Store individual fields for easy access
      localStorage.setItem('agentId', agentData.agentId || '');
      localStorage.setItem('agentMobile', agentData.mobile || '');
      localStorage.setItem('userName', agentData.name || '');
      
      console.log('✅ Agent token storage ensured');
      
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
          agentCode: '',
          role: 'agent'
        })
      };
    }

    console.log('📊 Processing user data for', userType, ':', userData);

    // Get stored profile data for this mobile number
    const mobile = userData.mobile || '';
    const storedProfile = getStoredUserProfile(mobile);
    
    // Priority order for name determination:
    // 1. Stored profile name (from signup)
    // 2. Current userData name
    // 3. Current userData fullName  
    // 4. firstName + lastName combination
    // 5. Fallback methods
    
    let finalName = userType === 'agent' ? 'Agent' : 'User';
    let nameSource = 'fallback';

    // Check stored profile first (highest priority)
    if (storedProfile && storedProfile.name && storedProfile.name.trim() !== '' && 
        storedProfile.name !== 'User' && storedProfile.name !== 'Agent') {
      finalName = storedProfile.name.trim();
      nameSource = 'stored_profile';
    }
    // Check current userData name
    else if (userData.name && userData.name.trim() !== '' && 
             userData.name !== 'User' && userData.name !== 'Agent') {
      finalName = userData.name.trim();
      nameSource = 'current_name';
    }
    // Check fullName
    else if (userData.fullName && userData.fullName.trim() !== '' && 
             userData.fullName !== 'User' && userData.fullName !== 'Agent') {
      finalName = userData.fullName.trim();
      nameSource = 'full_name';
    }
    // Check firstName + lastName
    else if (userData.firstName && userData.firstName.trim() !== '' && 
             userData.firstName !== 'User' && userData.firstName !== 'Agent') {
      const lastName = userData.lastName ? userData.lastName.trim() : '';
      finalName = `${userData.firstName.trim()} ${lastName}`.trim();
      nameSource = 'first_last_name';
    }
    // Check displayName
    else if (userData.displayName && userData.displayName.trim() !== '' && 
             userData.displayName !== 'User' && userData.displayName !== 'Agent') {
      finalName = userData.displayName.trim();
      nameSource = 'display_name';
    }

    console.log(`📝 Name determined for ${userType}: "${finalName}" (source: ${nameSource})`);

    // Parse name components
    const nameParts = finalName.split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || (userType === 'agent' ? 'Agent' : 'User');
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

    // 🎯 Add agent-specific fields if user is an agent
    if (userType === 'agent') {
      enhancedUser.isAgent = true;
      enhancedUser.role = 'agent';
      enhancedUser.accountType = 'agent';
      enhancedUser.agentId = userData.agentId || userData.id || userData.mobile || '';
      enhancedUser.agentCode = userData.agentCode || userData.code || '';
      enhancedUser.agentType = userData.agentType || 'standard';
      enhancedUser.permissions = userData.permissions || ['booking', 'search', 'cancel', 'view'];
      enhancedUser.status = userData.status || 'active';
      enhancedUser.isActive = userData.isActive !== false;
      
      // Agent financial data
      enhancedUser.commission = userData.commission || 0;
      enhancedUser.balance = userData.balance || 0;
      enhancedUser.creditLimit = userData.creditLimit || 0;
    }

    // Save/update the profile data
    if (mobile && finalName !== 'User' && finalName !== 'Agent') {
      saveUserProfileToStorage(mobile, enhancedUser);
    }

    console.log('✅ Enhanced user data created:', {
      userType: enhancedUser.userType,
      name: enhancedUser.name,
      firstName: enhancedUser.firstName,
      mobile: enhancedUser.mobile,
      nameSource: enhancedUser.nameSource,
      isAgent: enhancedUser.isAgent || false,
      agentId: enhancedUser.agentId || 'N/A'
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
        signupCompleted: true,
        ...(userData.userType === 'agent' && {
          isAgent: true,
          agentId: userData.agentId,
          agentCode: userData.agentCode,
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
      
      // Individual name storage
      localStorage.setItem(`userName_${cleanMobile}`, userData.name);
      
      console.log('💾 Profile saved to storage:', {
        mobile: cleanMobile,
        name: userData.name,
        userType: userData.userType,
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
        console.error('❌ Customer login failed: No mobile number provided');
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

  // 🎯 ENHANCED Agent login function with comprehensive token handling
  const agentLogin = (agentData, token = null) => {
    try {
      console.log('🔐 Agent login initiated:', agentData);

      // Ensure we have mobile number for agent
      if (!agentData.mobile) {
        console.error('❌ Agent login failed: No mobile number provided');
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

      // 🎯 CRITICAL: Ensure agent token is properly stored
      if (token) {
        console.log('🔧 Ensuring agent token storage after context login...');
        ensureAgentTokenStorage(token, enhancedAgentData);
      } else {
        // Try to get token from current detection
        const currentToken = getToken('agent');
        if (currentToken.hasToken) {
          ensureAgentTokenStorage(currentToken.token, enhancedAgentData);
        }
      }

      console.log('✅ Agent login successful in context:', {
        name: enhancedAgentData.name,
        mobile: enhancedAgentData.mobile,
        agentId: enhancedAgentData.agentId,
        isAgent: enhancedAgentData.isAgent
      });
      
      return true;
    } catch (error) {
      console.error('❌ Agent login error in context:', error);
      return false;
    }
  };

  // Generic logout function
  const logout = (redirectTo = '/login/customer') => {
    try {
      console.log(`🔓 Logging out ${userType} user...`);

      // Clear tokens using tokenUtils
      removeToken(userType);

      // 🎯 Additional cleanup for agent logout
      if (userType === 'agent') {
        localStorage.removeItem('agent_token');
        localStorage.removeItem('agentToken');
        localStorage.removeItem('isAgent');
        localStorage.removeItem('agentId');
        localStorage.removeItem('agentMobile');
        localStorage.removeItem('agentCode');
      }

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

  // 🎯 Get agent-specific information
  const getAgentInfo = () => {
    if (!isAgent() || !user) return null;
    
    return {
      agentId: user.agentId || '',
      agentCode: user.agentCode || '',
      agentType: user.agentType || 'standard',
      commission: user.commission || 0,
      balance: user.balance || 0,
      creditLimit: user.creditLimit || 0,
      permissions: user.permissions || [],
      status: user.status || 'active',
      isActive: user.isActive !== false
    };
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
        saveToken(currentTokenData.token, userType, updatedUserData);
        
        // 🎯 For agents, ensure comprehensive storage
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

  // Get greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = getUserFirstName();
    const userTypeText = userType === 'agent' ? ' (Agent)' : '';
    
    if (hour < 12) return `Good Morning, ${firstName}${userTypeText}!`;
    if (hour < 17) return `Good Afternoon, ${firstName}${userTypeText}!`;
    return `Good Evening, ${firstName}${userTypeText}!`;
  };

  // Get booking endpoints based on user type
  const getBookingEndpoints = () => {
    const baseURL = 'https://api.rasutrip.com/api/v1';

    if (userType === 'agent') {
      return {
        // Agent-specific endpoints (primary)
        upcoming: `${baseURL}/agent/bus-bookings/upcoming`,
        all: `${baseURL}/agent/bus-bookings`,
        history: `${baseURL}/agent/bus-bookings/history`,
        cancel: `${baseURL}/agent/bus-bookings/cancel`,
        
        // Fallback endpoints
        upcomingFallback: `${baseURL}/busservice/up-comming-bookings`,
        allFallback: `${baseURL}/busservice/my-bookings`,
        
        // Search and booking
        search: `${baseURL}/busservice/search`,
        book: `${baseURL}/busservice/book`,
        confirm: `${baseURL}/busservice/confirm-booking`
      };
    } else {
      return {
        upcoming: `${baseURL}/busservice/up-comming-bookings`,
        all: `${baseURL}/busservice/my-bookings`,
        search: `${baseURL}/busservice/search`,
        book: `${baseURL}/busservice/book`,
        cancel: `${baseURL}/busservice/cancel-booking`
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
        name: profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        firstName: profileData.firstName || profileData.name?.split(' ')[0] || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || '',
        fullName: profileData.fullName || profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        displayName: profileData.displayName || profileData.name || (profileData.userType === 'agent' ? 'Agent' : 'User'),
        email: profileData.email || '',
        userType: profileData.userType || 'customer',
        signupDate: new Date().toISOString(),
        signupCompleted: true,
        isActive: true,
        ...(profileData.userType === 'agent' && {
          isAgent: true,
          agentId: profileData.agentId || cleanMobile,
          agentCode: profileData.agentCode || '',
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

  // Get complete user profile info for display
  const getUserProfile = () => {
    if (!user) return null;
    
    const profile = {
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

    // Add agent-specific info if user is agent
    if (isAgent()) {
      const agentInfo = getAgentInfo();
      profile.agentInfo = agentInfo;
      profile.agentId = agentInfo?.agentId || '';
      profile.agentCode = agentInfo?.agentCode || '';
    }

    return profile;
  };

  // Get profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = {
      name: user.name && user.name !== 'User' && user.name !== 'Agent' ? 1 : 0,
      mobile: user.mobile ? 1 : 0,
      email: user.email ? 1 : 0,
      firstName: user.firstName && user.firstName !== 'User' && user.firstName !== 'Agent' ? 1 : 0,
    };

    // Add agent-specific fields for completion
    if (userType === 'agent') {
      fields.agentId = user.agentId ? 1 : 0;
    }
    
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
    
    if (!user.name || user.name === 'User' || user.name === 'Agent') missing.push('name');
    if (!user.mobile) missing.push('mobile');
    if (!user.email) missing.push('email');
    
    // Agent-specific missing fields
    if (userType === 'agent' && !user.agentId) {
      missing.push('agentId');
    }
    
    return missing;
  };

  // Get profile status message
  const getProfileStatusMessage = () => {
    const completion = getProfileCompletion();
    const userTypeText = userType === 'agent' ? 'agent ' : '';
    
    if (completion === 100) {
      return { type: 'success', message: `Your ${userTypeText}profile is complete!` };
    } else if (completion >= 75) {
      return { type: 'warning', message: `Almost done! Add your email to complete ${userTypeText}profile.` };
    } else if (completion >= 50) {
      return { type: 'info', message: `Please complete your ${userTypeText}profile for better experience.` };
    } else {
      return { type: 'danger', message: `Your ${userTypeText}profile needs attention. Please update your details.` };
    }
  };

  // 🎯 Agent-specific functions
  const getAgentDashboardData = () => {
    if (!isAgent()) return null;
    
    return {
      agentInfo: getAgentInfo(),
      bookingEndpoints: getBookingEndpoints(),
      profile: getUserProfile(),
      canBook: user?.permissions?.includes('booking') !== false,
      canSearch: user?.permissions?.includes('search') !== false,
      canCancel: user?.permissions?.includes('cancel') !== false,
      canView: user?.permissions?.includes('view') !== false
    };
  };

  // Check agent permissions
  const hasAgentPermission = (permission) => {
    if (!isAgent() || !user) return false;
    
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  };

  // Get agent status display
  const getAgentStatus = () => {
    if (!isAgent() || !user) return null;
    
    const status = user.status || 'unknown';
    const isActive = user.isActive !== false;
    
    return {
      status,
      isActive,
      displayStatus: isActive ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Inactive',
      canOperate: isActive && status === 'active'
    };
  };

  // 🎯 Token verification for agents
  const verifyAgentSession = () => {
    if (!isAgent()) return { valid: false, reason: 'Not an agent session' };
    
    const tokenData = getToken('agent');
    const localStorageToken = localStorage.getItem('agent_token');
    const isAgentFlag = localStorage.getItem('isAgent');
    
    const verification = {
      valid: false,
      hasContextUser: !!user,
      hasToken: tokenData.hasToken,
      userType: tokenData.userType,
      tokenInLocalStorage: !!localStorageToken,
      agentFlagSet: isAgentFlag === 'true',
      tokensMatch: tokenData.token === localStorageToken,
      reason: ''
    };

    if (!verification.hasContextUser) {
      verification.reason = 'No user in context';
    } else if (!verification.hasToken) {
      verification.reason = 'No token detected by tokenUtils';
    } else if (verification.userType !== 'agent') {
      verification.reason = `Wrong user type: ${verification.userType}`;
    } else if (!verification.tokenInLocalStorage) {
      verification.reason = 'No agent token in localStorage';
    } else if (!verification.agentFlagSet) {
      verification.reason = 'Agent flag not set in localStorage';
    } else if (!verification.tokensMatch) {
      verification.reason = 'Tokens do not match between sources';
    } else {
      verification.valid = true;
      verification.reason = 'Agent session is valid';
    }

    console.log('🔍 Agent session verification:', verification);
    return verification;
  };

  // Fix agent session if there are issues
  const fixAgentSession = () => {
    if (!isAgent() || !user) return false;
    
    try {
      console.log('🔧 Fixing agent session...');
      
      const tokenData = getToken('agent');
      if (tokenData.hasToken) {
        ensureAgentTokenStorage(tokenData.token, user);
        console.log('✅ Agent session fixed');
        return true;
      } else {
        console.error('❌ Cannot fix agent session - no token available');
        return false;
      }
    } catch (error) {
      console.error('❌ Error fixing agent session:', error);
      return false;
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

    // 🎯 Agent-specific Functions
    getAgentInfo,
    getAgentDashboardData,
    hasAgentPermission,
    getAgentStatus,
    verifyAgentSession,
    fixAgentSession,

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