// src/components/auth/CustomerLogin.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

import loginImage from '../../assest/loginimg.jpg';
import {
  signupOrLogin,
  verifyOtp,
  createMPIN,
  loginWithMPIN,
  sendForgotMPINOtp,
  verifyForgotOtp,
} from './services/authService';
import { AuthContext } from '../Context/AuthContext';
import { saveToken } from './utils/tokenUtils';

// Enhanced utility functions for name persistence with better error handling
const saveUserName = (mobile, name) => {
  try {
    if (!mobile || !name) {
      console.warn('⚠️ Cannot save user name: missing mobile or name');
      return false;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanName = name.trim();

    // Get existing user names
    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');

    // Save with multiple key formats for better retrieval
    userNames[cleanMobile] = cleanName;
    userNames[`+91${cleanMobile}`] = cleanName;
    userNames[mobile] = cleanName; // Original format

    localStorage.setItem('userNames', JSON.stringify(userNames));

    // Also save as individual key for faster access
    localStorage.setItem(`userName_${cleanMobile}`, cleanName);

    // Save user profile data
    const userProfile = {
      mobile: cleanMobile,
      name: cleanName,
      firstName: cleanName.split(' ')[0],
      lastName: cleanName.split(' ').slice(1).join(' ') || '',
      fullName: cleanName,
      signupDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(`userProfile_${cleanMobile}`, JSON.stringify(userProfile));

    console.log('💾 Successfully saved user name and profile:', { mobile: cleanMobile, name: cleanName });
    return true;
  } catch (error) {
    console.error('❌ Failed to save user name locally:', error);
    return false;
  }
};

const getUserName = (mobile) => {
  try {
    if (!mobile) {
      console.warn('⚠️ No mobile number provided for name retrieval');
      return null;
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    // Method 1: Try to get from user profile
    try {
      const userProfile = localStorage.getItem(`userProfile_${cleanMobile}`);
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        if (profile.name && profile.name !== 'User') {
          console.log('📖 Retrieved name from user profile:', profile.name);
          return profile.name;
        }
      }
    } catch (e) {
      console.warn('⚠️ Error parsing user profile');
    }

    // Method 2: Direct key lookup
    const directName = localStorage.getItem(`userName_${cleanMobile}`);
    if (directName && directName !== 'User') {
      console.log('📖 Retrieved name via direct key:', directName);
      return directName;
    }

    // Method 3: From userNames object
    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');

    // Try different mobile formats
    const possibleKeys = [
      cleanMobile,
      `+91${cleanMobile}`,
      mobile,
      `91${cleanMobile}`
    ];

    for (const key of possibleKeys) {
      if (userNames[key] && userNames[key] !== 'User') {
        console.log('📖 Retrieved name from userNames object:', userNames[key]);
        return userNames[key];
      }
    }

    // Method 4: Check currentUser data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.mobile === cleanMobile && currentUser.name && currentUser.name !== 'User') {
      console.log('📖 Retrieved name from currentUser:', currentUser.name);
      return currentUser.name;
    }

    console.log('📖 No saved name found for mobile:', mobile);
    return null;
  } catch (error) {
    console.error('❌ Failed to retrieve user name locally:', error);
    return null;
  }
};

// Get complete user profile from localStorage
const getUserProfile = (mobile) => {
  try {
    const cleanMobile = mobile.replace(/\D/g, '');
    const profileData = localStorage.getItem(`userProfile_${cleanMobile}`);

    if (profileData) {
      const profile = JSON.parse(profileData);
      console.log('📖 Retrieved user profile:', profile);
      return profile;
    }

    // If no profile found, try to construct from saved name
    const savedName = getUserName(mobile);
    if (savedName) {
      const profile = {
        mobile: cleanMobile,
        name: savedName,
        firstName: savedName.split(' ')[0],
        lastName: savedName.split(' ').slice(1).join(' ') || '',
        fullName: savedName
      };

      // Save this constructed profile for future use
      localStorage.setItem(`userProfile_${cleanMobile}`, JSON.stringify(profile));
      return profile;
    }

    return null;
  } catch (error) {
    console.error('❌ Error retrieving user profile:', error);
    return null;
  }
};

// Enhanced function to get name from multiple sources with priority
const getNameFromMultipleSources = (mobile, backendUser = {}) => {
  const cleanMobile = mobile.replace(/\D/g, '');

  console.log('🔍 Determining name from multiple sources for:', cleanMobile);
  console.log('🔍 Backend user data:', backendUser);

  // Priority order for name determination:
  // 1. Locally saved user profile (highest priority)
  // 2. Backend name (if not generic)
  // 3. Backend fullName (if not generic)  
  // 4. Backend firstName + lastName combination
  // 5. Locally saved name (fallback)
  // 6. Fallback to 'User'

  // Check locally saved profile first (this should have the signup name)
  const localProfile = getUserProfile(cleanMobile);
  if (localProfile && localProfile.name && localProfile.name !== 'User') {
    console.log('✅ Using locally saved profile name:', localProfile.name);
    return localProfile.name;
  }

  // Check backend data
  if (backendUser.name && backendUser.name !== 'User' && backendUser.name.trim().length > 0) {
    console.log('✅ Using backend name:', backendUser.name);
    // Also save this name locally for future use
    saveUserName(cleanMobile, backendUser.name);
    return backendUser.name.trim();
  }

  if (backendUser.fullName && backendUser.fullName !== 'User' && backendUser.fullName.trim().length > 0) {
    console.log('✅ Using backend fullName:', backendUser.fullName);
    saveUserName(cleanMobile, backendUser.fullName);
    return backendUser.fullName.trim();
  }

  if (backendUser.firstName && backendUser.firstName !== 'User' && backendUser.firstName.trim().length > 0) {
    const fullName = `${backendUser.firstName.trim()} ${(backendUser.lastName || '').trim()}`.trim();
    console.log('✅ Using backend firstName + lastName:', fullName);
    saveUserName(cleanMobile, fullName);
    return fullName;
  }

  // Fallback to locally saved name
  const localName = getUserName(cleanMobile);
  if (localName) {
    console.log('✅ Using fallback locally saved name:', localName);
    return localName;
  }

  console.log('⚠️ No valid name found, using fallback');
  return 'User';
};

const CustomerLogin = () => {
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState('login');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Enhanced signup function with better name handling
  const handleSignup = async () => {
    setError('');
    setMessage('');

    if (!mobile) {
      return setError('Mobile number is required');
    }

    if (!name.trim()) {
      return setError('Name is required');
    }

    // Validate name (minimum 2 characters, only letters and spaces)
    if (name.trim().length < 2) {
      return setError('Name must be at least 2 characters long');
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return setError('Name can only contain letters and spaces');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const cleanName = name.trim();

      // Save name locally immediately and thoroughly
      const saved = saveUserName(cleanMobile, cleanName);

      if (!saved) {
        console.warn('⚠️ Failed to save name locally, but continuing with signup');
      }

      console.log('🔄 Sending signup request with:', {
        mobile: cleanMobile,
        name: cleanName
      });

      // Pass name to the signup API
      await signupOrLogin({
        mobile: cleanMobile,
        name: cleanName
      });

      setStep('verifyAndMpin');
      setMessage(`OTP sent to ${cleanMobile}. Please verify to complete signup.`);

    } catch (err) {
      console.error('❌ Signup Error:', err);
      setError(err.response?.data?.message || 'Signup/Login failed');
    }
  };

  // Enhanced verification with proper name handling
  const handleVerifyAndSetMpin = async () => {
    setError('');
    setMessage('');

    if (!otp || !mpin) {
      return setError('Enter both OTP and MPIN');
    }

    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const cleanName = name.trim();

      console.log('🔄 Step 1: Verifying OTP for:', cleanMobile);
      await verifyOtp({ mobile: cleanMobile, otp });

      console.log('🔄 Step 2: Creating MPIN with name:', cleanName);
      // Ensure name is passed to createMPIN
      await createMPIN({
        mobile: cleanMobile,
        newMPIN: mpin,
        name: cleanName
      });

      // Save name again after MPIN creation (ensure it's persistent)
      saveUserName(cleanMobile, cleanName);

      console.log('🔄 Step 3: Logging in with MPIN');
      const response = await loginWithMPIN({
        mobile: cleanMobile,
        mPIN: mpin
      });

      console.log('✅ Login Response:', response?.data);

      const token = response?.data?.token;
      if (token) {
        // Create comprehensive user data with name priority
        const userData = {
          mobile: cleanMobile,
          name: cleanName,
          firstName: cleanName.split(' ')[0],
          lastName: cleanName.split(' ').slice(1).join(' ') || '',
          fullName: cleanName,
          displayName: cleanName,
          ...response?.data?.user,
          // Always override with the name we collected during signup
          name: cleanName,
          firstName: cleanName.split(' ')[0],
          fullName: cleanName,
          displayName: cleanName,
          userType: 'customer',
          registrationDate: new Date().toISOString(),
          signupCompleted: true
        };

        console.log('💾 Saving complete user data after signup:', userData);

        const tokenSaved = saveToken(token, 'customer', userData);

        if (tokenSaved) {
          console.log('✅ Customer signup token saved successfully');

          // Also ensure the name is saved in our custom storage
          saveUserName(cleanMobile, cleanName);

          login(userData);

          setMessage(`Welcome ${cleanName}! Registration successful!`);
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setError('Failed to save session. Please try again.');
        }
      } else {
        setError('No authentication token received. Please try again.');
      }

    } catch (err) {
      console.error('❌ Verify and MPIN Error:', err);
      setError(err.response?.data?.message || 'Verification or MPIN setup failed');
    }
  };

  // ENHANCED MPIN LOGIN - Main fix for your issue
  const handleLoginWithMPIN = async () => {
    setError('');
    setMessage('');

    if (!mobile || !mpin) {
      return setError('Enter both mobile and MPIN');
    }

    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      console.log('🔄 Attempting login for:', cleanMobile);

      const response = await loginWithMPIN({
        mobile: cleanMobile,
        mPIN: mpin
      });
      console.log('✅ Login Response:', response?.data);

      if (response.status === 200 || response.status === 201) {
        const token = response?.data?.token;
        if (token) {
          const backendUser = response?.data?.user || {};

          // Use enhanced name determination function with priority to local storage
          const finalName = getNameFromMultipleSources(cleanMobile, backendUser);

          console.log('🎯 Final determined name for login:', finalName);

          // Get existing user profile data
          const existingProfile = getUserProfile(cleanMobile);

          // Create comprehensive user data with priority to existing profile
          const userData = {
            mobile: cleanMobile,
            name: finalName,
            firstName: finalName.split(' ')[0],
            lastName: finalName.split(' ').slice(1).join(' ') || '',
            fullName: finalName,
            displayName: finalName,
            email: backendUser.email || existingProfile?.email || '',
            ...existingProfile, // Include existing profile data
            ...backendUser, // Include backend data
            // Override with our determined name (this is crucial)
            name: finalName,
            firstName: finalName.split(' ')[0],
            fullName: finalName,
            displayName: finalName,
            userType: 'customer',
            lastLoginTime: new Date().toISOString(),
            isReturningUser: !!existingProfile
          };

          console.log('💾 Saving login user data:', userData);

          // Save updated name locally for future use
          if (finalName !== 'User') {
            saveUserName(cleanMobile, finalName);
          }

          const tokenSaved = saveToken(token, 'customer', userData);

          if (tokenSaved) {
            console.log('✅ Customer login token saved successfully');

            login(userData);

            const userName = userData.firstName || userData.name || 'User';
            const greeting = existingProfile ? 'Welcome back' : 'Welcome';
            setMessage(`${greeting}, ${userName}! Login successful!`);
            setTimeout(() => navigate('/dashboard'), 1500);
          } else {
            console.warn('⚠️ Token saving failed');
            setError('Failed to save session. Please try again.');
          }
        } else {
          console.warn('⚠️ No token received from customer login');
          setError('No authentication token received. Please try again.');
        }
      }

    } catch (err) {
      console.error('❌ MPIN Login Error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Check if user exists when mobile is entered
  const checkExistingUser = (mobileNumber) => {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const existingName = getUserName(cleanMobile);

    if (existingName && existingName !== 'User') {
      console.log('👤 Existing user found:', existingName);
      // Could show a message like "Welcome back, John!"
    }
  };

  const handleSendForgotOtp = async () => {
    setError('');
    setMessage('');

    if (!mobile) {
      return setError('Enter your mobile number');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      await sendForgotMPINOtp({ mobile: cleanMobile });
      setStep('forgot');
      setMessage(`OTP sent to ${cleanMobile} for MPIN reset`);
    } catch (err) {
      console.error('❌ Forgot OTP Error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Enhanced forgot password with better name preservation
  const handleForgotVerify = async () => {
    setError('');
    setMessage('');

    if (!otp || !mpin) {
      return setError('Enter both OTP and new MPIN');
    }

    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');

      console.log('🔄 Step 1: Verifying forgot OTP');
      await verifyForgotOtp({ mobile: cleanMobile, otp });

      console.log('🔄 Step 2: Creating new MPIN');
      await createMPIN({ mobile: cleanMobile, newMPIN: mpin });

      console.log('🔄 Step 3: Logging in with new MPIN');
      const response = await loginWithMPIN({
        mobile: cleanMobile,
        mPIN: mpin
      });

      const token = response?.data?.token;
      if (token) {
        const backendUser = response?.data?.user || {};

        // Use enhanced name determination function
        const finalName = getNameFromMultipleSources(cleanMobile, backendUser);
        const existingProfile = getUserProfile(cleanMobile);

        const userData = {
          mobile: cleanMobile,
          name: finalName,
          firstName: finalName.split(' ')[0],
          lastName: finalName.split(' ').slice(1).join(' ') || '',
          fullName: finalName,
          displayName: finalName,
          ...existingProfile,
          ...backendUser,
          // Override with determined name
          name: finalName,
          firstName: finalName.split(' ')[0],
          fullName: finalName,
          displayName: finalName,
          userType: 'customer',
          lastLoginTime: new Date().toISOString(),
        };

        // Save updated name locally
        if (finalName !== 'User') {
          saveUserName(cleanMobile, finalName);
        }

        const tokenSaved = saveToken(token, 'customer', userData);

        if (tokenSaved) {
          console.log('✅ Customer forgot password token saved successfully');

          login(userData);

          const userName = userData.firstName || userData.name || 'User';
          setMessage(`MPIN reset successful! Welcome back, ${userName}!`);
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setError('Failed to save session. Please try again.');
        }
      } else {
        setError('No authentication token received. Please try again.');
      }

    } catch (err) {
      console.error('❌ Forgot Reset Error:', err);
      setError(err.response?.data?.message || 'Failed to reset or login');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box d-flex">
        {/* Left Panel */}
        <div className="col-md-6 left-panel p-4">
          <h4 className="fw-bold text-white bg-danger py-2 px-3 rounded-pill d-inline-block">
            Registration Benefits:
          </h4>
          <ul className="list-unstyled mt-3">
            <li>✅ No Registration Fees</li>
            <li>✅ Easy Steps for registration</li>
            <li>✅ Manage Your Bookings</li>
            <li>✅ Print Ticket or Voucher</li>
            <li>✅ 24*7 Dedicated Support</li>
            <li>✅ Your Profile is Saved Forever</li>
          </ul>
          <img src={loginImage} alt="Login" className="img-fluid w-75 rounded mt-4" />
        </div>

        {/* Right Panel */}
        <div className="col-md-6 right-panel d-flex flex-column justify-content-center">
          <h2 className="login-title mb-3 text-center">
            {step === 'login' && 'Login with MPIN'}
            {step === 'signup' && 'Create Your Account'}
            {step === 'verifyAndMpin' && 'Complete Registration'}
            {step === 'forgot' && 'Reset MPIN'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form>
            {/* Enhanced Name field with validation */}
            {step === 'signup' && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    // Allow only letters and spaces
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setName(value);
                  }}
                  maxLength={50}
                  required
                  className="form-control-lg"
                />

              </Form.Group>
            )}

            {/* Mobile Number field with existing user check */}
            {['login', 'signup', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  Mobile Number <span className="text-danger">*</span>
                </Form.Label>
                <PhoneInput
                  country={'in'}
                  value={mobile}
                  onChange={(phone) => {
                    setMobile(phone);
                    // Check for existing user when in login mode
                    if (step === 'login') {
                      checkExistingUser(phone);
                    }
                  }}
                  placeholder="Enter mobile number"
                  inputClass="custom-phone-input w-100"
                  containerClass="phone-input-container"
                />
              </Form.Group>
            )}

            {/* MPIN field */}
            {['login', 'verifyAndMpin', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  {step === 'verifyAndMpin' ? 'Create 4-digit MPIN' :
                    step === 'forgot' ? 'New MPIN' : 'MPIN'}
                  <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter 4-digit MPIN"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="form-control-lg"
                />
                {step === 'verifyAndMpin' && (
                  <Form.Text className="text-muted">
                    Choose a secure 4-digit MPIN for future logins
                  </Form.Text>
                )}
              </Form.Group>
            )}

            {/* OTP field */}
            {['verifyAndMpin', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  OTP <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  OTP sent to your mobile number
                </Form.Text>
              </Form.Group>
            )}

            {/* Step-wise Enhanced Buttons */}
            {step === 'login' && (
              <>
                <div className="d-flex justify-content-between mb-3">
                  <Button
                    variant="link"
                    className="p-0 text-light"
                    onClick={() => {
                      setStep('signup');
                      setMessage('');
                      setError('');
                      setName('');
                    }}
                  >
                    New User? Create Account
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 text-light"
                    onClick={handleSendForgotOtp}
                  >
                    Forgot MPIN?
                  </Button>
                </div>
                <Button
                  onClick={handleLoginWithMPIN}
                  className="w-100 login-btn mb-2"
                  size="lg"
                >
                  Login to Dashboard
                </Button>
              </>
            )}

            {step === 'signup' && (
              <>
                <Button
                  onClick={handleSignup}
                  className="w-100 login-btn mb-2"
                  size="lg"
                  disabled={!name.trim() || !mobile}
                >
                  Create Account & Send OTP
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('login');
                    setMessage('');
                    setError('');
                    setName('');
                  }}
                >
                  Already have account? Login
                </Button>
              </>
            )}

            {step === 'verifyAndMpin' && (
              <>
                <Button
                  onClick={handleVerifyAndSetMpin}
                  className="w-100 login-btn mb-2"
                  size="lg"
                  disabled={!otp || !mpin || mpin.length !== 4}
                >
                  Complete Registration
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('signup');
                    setMessage('');
                    setError('');
                    setOtp('');
                    setMpin('');
                  }}
                >
                  Back to Details
                </Button>
              </>
            )}

            {step === 'forgot' && (
              <>
                <Button
                  onClick={handleForgotVerify}
                  className="w-100 login-btn mb-2"
                  size="lg"
                  disabled={!otp || !mpin || mpin.length !== 4}
                >
                  Reset MPIN & Login
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('login');
                    setMessage('');
                    setError('');
                    setOtp('');
                    setMpin('');
                  }}
                >
                  Back to Login
                </Button>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;