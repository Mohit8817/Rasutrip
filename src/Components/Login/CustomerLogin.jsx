// src/components/auth/CustomerLogin.js
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

import loginImage from '../../assest/loginimg.jpg';
import {
  signupOrLogin,
  verifyOtp,
  completeSignup,
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

    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');

    userNames[cleanMobile] = cleanName;
    userNames[`+91${cleanMobile}`] = cleanName;
    userNames[mobile] = cleanName;

    localStorage.setItem('userNames', JSON.stringify(userNames));
    localStorage.setItem(`userName_${cleanMobile}`, cleanName);

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

    const directName = localStorage.getItem(`userName_${cleanMobile}`);
    if (directName && directName !== 'User') {
      console.log('📖 Retrieved name via direct key:', directName);
      return directName;
    }

    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
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

const getUserProfile = (mobile) => {
  try {
    const cleanMobile = mobile.replace(/\D/g, '');
    const profileData = localStorage.getItem(`userProfile_${cleanMobile}`);

    if (profileData) {
      const profile = JSON.parse(profileData);
      console.log('📖 Retrieved user profile:', profile);
      return profile;
    }

    const savedName = getUserName(mobile);
    if (savedName) {
      const profile = {
        mobile: cleanMobile,
        name: savedName,
        firstName: savedName.split(' ')[0],
        lastName: savedName.split(' ').slice(1).join(' ') || '',
        fullName: savedName
      };

      localStorage.setItem(`userProfile_${cleanMobile}`, JSON.stringify(profile));
      return profile;
    }

    return null;
  } catch (error) {
    console.error('❌ Error retrieving user profile:', error);
    return null;
  }
};

const getNameFromMultipleSources = (mobile, backendUser = {}) => {
  const cleanMobile = mobile.replace(/\D/g, '');

  console.log('🔍 Determining name from multiple sources for:', cleanMobile);
  console.log('🔍 Backend user data:', backendUser);

  const localProfile = getUserProfile(cleanMobile);
  if (localProfile && localProfile.name && localProfile.name !== 'User') {
    console.log('✅ Using locally saved profile name:', localProfile.name);
    return localProfile.name;
  }

  if (backendUser.name && backendUser.name !== 'User' && backendUser.name.trim().length > 0) {
    console.log('✅ Using backend name:', backendUser.name);
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
  const [referralCode, setReferralCode] = useState('');
  const [referrerId, setReferrerId] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tempToken, setTempToken] = useState(''); // Store temporary token from OTP verification
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced signup function
  const handleSignup = async () => {
    setError('');
    setMessage('');

    if (!mobile) {
      return setError('Mobile number is required');
    }

    if (!name.trim()) {
      return setError('Name is required');
    }

    if (name.trim().length < 2) {
      return setError('Name must be at least 2 characters long');
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return setError('Name can only contain letters and spaces');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const cleanName = name.trim();

      const saved = saveUserName(cleanMobile, cleanName);

      if (!saved) {
        console.warn('⚠️ Failed to save name locally, but continuing with signup');
      }

      console.log('🔄 Sending signup request with:', {
        mobile: cleanMobile,
        name: cleanName
      });

      await signupOrLogin({
        mobile: cleanMobile,
        name: cleanName
      });

      setStep('verifyOtp');
      setMessage(`OTP sent to ${cleanMobile}. Please verify to continue.`);

    } catch (err) {
      console.error('❌ Signup Error:', err);
      setError(err.response?.data?.message || 'Signup/Login failed');
    }
  };

  // Handle OTP Verification - Get token from response
  const handleVerifyOtp = async () => {
    setError('');
    setMessage('');

    if (!otp) {
      return setError('Please enter OTP');
    }

    if (!/^\d{6}$/.test(otp)) {
      return setError('OTP must be exactly 6 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      
      console.log('🔄 Step 1: Verifying OTP for:', cleanMobile);
      const otpResponse = await verifyOtp({ mobile: cleanMobile, otp });

      console.log('✅ OTP Response:', otpResponse?.data);

      // Check if we get a token from OTP verification
      const token = otpResponse?.data?.token || otpResponse?.data?.data?.token;
      
      if (token) {
        console.log('🔑 Received token from OTP verification');
        setTempToken(token); // Store token temporarily
        
        // Save token temporarily in localStorage for the completeSignup API
        localStorage.setItem('tempAuthToken', token);
      }

      setMessage('OTP verified! Please complete your signup.');
      setStep('completeSignup');

    } catch (err) {
      console.error('❌ OTP Verification Error:', err);
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Handle Complete Signup - Now authenticated with token
  const handleCompleteSignup = async () => {
    setError('');
    setMessage('');

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const cleanName = name.trim();

      console.log('🔄 Step 2: Calling Complete Signup API');
      
      // Prepare data for complete signup API
      const signupData = {
        name: cleanName
      };

      // Add optional fields only if provided
      if (referralCode.trim()) {
        signupData.referralCode = referralCode.trim();
      }

      if (referrerId.trim()) {
        signupData.referrerId = referrerId.trim();
      }

      console.log('📤 Complete Signup Data:', signupData);

      // Call the complete signup API (now authenticated)
      const completeSignupResponse = await completeSignup(signupData);
      
      console.log('✅ Complete Signup Response:', completeSignupResponse?.data);

      // Save name again after complete signup
      saveUserName(cleanMobile, cleanName);

      setMessage('Signup completed! Now set your MPIN.');
      
      // Move to MPIN creation step
      setStep('createMpin');

    } catch (err) {
      console.error('❌ Complete Signup Error:', err);
      
      // If complete signup fails, we can still proceed to MPIN creation
      console.warn('⚠️ Complete signup failed, but continuing to MPIN creation');
      setMessage('Continuing to MPIN setup...');
      
      // Still move to MPIN step even if complete signup fails
      setTimeout(() => {
        setError('');
        setStep('createMpin');
      }, 1500);
    }
  };

  // Skip Complete Signup and go directly to MPIN creation
  const handleSkipCompleteSignup = () => {
    setError('');
    setMessage('Skipping referral. Creating your account...');
    setStep('createMpin');
  };

  // Handle MPIN Creation
  const handleCreateMpin = async () => {
    setError('');
    setMessage('');

    if (!mpin) {
      return setError('Please enter MPIN');
    }

    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const cleanName = name.trim();

      console.log('🔄 Step 3: Creating MPIN');
      await createMPIN({
        mobile: cleanMobile,
        newMPIN: mpin,
        name: cleanName
      });

      console.log('🔄 Step 4: Logging in with MPIN');
      const response = await loginWithMPIN({
        mobile: cleanMobile,
        mPIN: mpin
      });

      console.log('✅ Login Response:', response?.data);

      // Clear temporary token
      localStorage.removeItem('tempAuthToken');
      setTempToken('');

      const token = response?.data?.token;
      if (token) {
        const userData = {
          mobile: cleanMobile,
          name: cleanName,
          firstName: cleanName.split(' ')[0],
          lastName: cleanName.split(' ').slice(1).join(' ') || '',
          fullName: cleanName,
          displayName: cleanName,
          email: response?.data?.user?.email || '',
          userType: 'customer',
          registrationDate: new Date().toISOString(),
          signupCompleted: true,
          referralCode: referralCode || undefined,
          referrerId: referrerId || undefined,
          ...response?.data?.user,
          name: cleanName,
          firstName: cleanName.split(' ')[0],
          fullName: cleanName,
          displayName: cleanName
        };

        console.log('💾 Saving complete user data after signup:', userData);

        const tokenSaved = saveToken(token, 'customer', userData);

        if (tokenSaved) {
          console.log('✅ Customer signup token saved successfully');
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
      console.error('❌ MPIN Creation Error:', err);
      setError(err.response?.data?.message || 'MPIN setup failed');
      
      // Clear temporary token on error
      localStorage.removeItem('tempAuthToken');
      setTempToken('');
    }
  };

  // MPIN LOGIN
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
          const finalName = getNameFromMultipleSources(cleanMobile, backendUser);
          const existingProfile = getUserProfile(cleanMobile);

          const userData = {
            mobile: cleanMobile,
            name: finalName,
            firstName: finalName.split(' ')[0],
            lastName: finalName.split(' ').slice(1).join(' ') || '',
            fullName: finalName,
            displayName: finalName,
            email: backendUser.email || existingProfile?.email || '',
            userType: 'customer',
            lastLoginTime: new Date().toISOString(),
            isReturningUser: !!existingProfile,
            ...existingProfile,
            ...backendUser,
            name: finalName,
            firstName: finalName.split(' ')[0],
            fullName: finalName,
            displayName: finalName
          };

          console.log('💾 Saving login user data:', userData);

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
            setTimeout(() => navigate(-1), 1500);
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

  const checkExistingUser = (mobileNumber) => {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const existingName = getUserName(cleanMobile);

    if (existingName && existingName !== 'User') {
      console.log('👤 Existing user found:', existingName);
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
        const finalName = getNameFromMultipleSources(cleanMobile, backendUser);
        const existingProfile = getUserProfile(cleanMobile);

        const userData = {
          mobile: cleanMobile,
          name: finalName,
          firstName: finalName.split(' ')[0],
          lastName: finalName.split(' ').slice(1).join(' ') || '',
          fullName: finalName,
          displayName: finalName,
          userType: 'customer',
          lastLoginTime: new Date().toISOString(),
          ...existingProfile,
          ...backendUser,
          name: finalName,
          firstName: finalName.split(' ')[0],
          fullName: finalName,
          displayName: finalName
        };

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
      <div className="login-box d-flex flex-column flex-md-row">
        {/* Left Panel */}
        <div className="col-12 col-md-6 left-panel p-3 p-md-4 order-2 order-md-1">
          <h4 className="fw-bold text-white bg-danger py-2 px-3 rounded-pill d-inline-block mb-3">
            Registration Benefits:
          </h4>
          <ul className="list-unstyled mt-3">
            <li className="mb-2">✅ No Registration Fees</li>
            <li className="mb-2">✅ Easy Steps for registration</li>
            <li className="mb-2">✅ Manage Your Bookings</li>
            <li className="mb-2">✅ Print Ticket or Voucher</li>
            <li className="mb-2">✅ 24*7 Dedicated Support</li>
            <li className="mb-2">✅ Your Profile is Saved Forever</li>
          </ul>
          <div className="text-center d-none d-md-block">
            <img src={loginImage} alt="Login" className="img-fluid w-75 rounded mt-4" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-12 col-md-6 right-panel d-flex flex-column justify-content-center p-3 p-md-4 order-1 order-md-2">
          <h2 className="login-title mb-3 text-center fs-4 fs-md-2">
            {step === 'login' && 'Login with MPIN'}
            {step === 'signup' && 'Create Your Account'}
            {step === 'verifyOtp' && 'Verify OTP'}
            {step === 'completeSignup' && 'Complete Your Signup'}
            {step === 'createMpin' && 'Set Your MPIN'}
            {step === 'forgot' && 'Reset MPIN'}
          </h2>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          {message && <Alert variant="success" className="mb-3">{message}</Alert>}

          <Form>
            {/* Name field - Only in signup step */}
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
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setName(value);
                  }}
                  maxLength={50}
                  required
                  className="form-control"
                />
              </Form.Group>
            )}

            {/* Mobile Number field */}
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
                    if (step === 'login') {
                      checkExistingUser(phone);
                    }
                  }}
                  placeholder="Enter mobile number"
                  inputClass="custom-phone-input w-100"
                  containerClass="phone-input-container w-100"
                />
              </Form.Group>
            )}

            {/* OTP field - for verifyOtp and forgot steps */}
            {['verifyOtp', 'forgot'].includes(step) && (
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
                  className="form-control"
                />
                <Form.Text className="text-light small">
                  OTP sent to your mobile number
                </Form.Text>
              </Form.Group>
            )}

            {/* Referral Code - Optional, only in completeSignup step */}
            {step === 'completeSignup' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Referral Code <span className="text-muted">(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter referral code (if any)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    maxLength={20}
                    className="form-control"
                  />
                  <Form.Text className="text-light small">
                    Have a referral code? Enter it here for benefits
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Referrer ID <span className="text-muted">(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter referrer ID (if any)"
                    value={referrerId}
                    onChange={(e) => setReferrerId(e.target.value)}
                    maxLength={50}
                    className="form-control"
                  />
                  <Form.Text className="text-light small">
                    Enter the ID of the person who referred you
                  </Form.Text>
                </Form.Group>
              </>
            )}

            {/* MPIN field - for login, createMpin, and forgot steps */}
            {['login', 'createMpin', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  {step === 'createMpin' ? 'Create 4-digit MPIN' :
                    step === 'forgot' ? 'New MPIN' : 'MPIN'}
                  <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter 4-digit MPIN"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="form-control"
                />
                {step === 'createMpin' && (
                  <Form.Text className="text-muted small">
                    Choose a secure 4-digit MPIN for future logins
                  </Form.Text>
                )}
              </Form.Group>
            )}

            {/* Step-wise Buttons */}
            {step === 'login' && (
              <>
                <div className="d-flex flex-column flex-sm-row justify-content-between mb-3 gap-2">
                  <Button
                    variant="link"
                    className="p-0 text-light text-start text-sm-start"
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
                    className="p-0 text-light text-start text-sm-end"
                    onClick={handleSendForgotOtp}
                  >
                    Forgot MPIN?
                  </Button>
                </div>
                <Button
                  onClick={handleLoginWithMPIN}
                  className="w-100 login-btn mb-2"
                >
                  Login
                </Button>
              </>
            )}

            {step === 'signup' && (
              <>
                <Button
                  onClick={handleSignup}
                  className="w-100 login-btn mb-2"
                  disabled={!name.trim() || !mobile}
                >
                  Send OTP
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light text-center"
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

            {step === 'verifyOtp' && (
              <>
                <Button
                  onClick={handleVerifyOtp}
                  className="w-100 login-btn mb-2"
                  disabled={!otp || otp.length !== 6}
                >
                  Verify OTP
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light text-center"
                  onClick={() => {
                    setStep('signup');
                    setMessage('');
                    setError('');
                    setOtp('');
                  }}
                >
                  Back to Signup
                </Button>
              </>
            )}

            {step === 'completeSignup' && (
              <>
                <Button
                  onClick={handleCompleteSignup}
                  className="w-100 login-btn mb-2"
                >
                  {referralCode || referrerId ? 'Apply Referral & Continue' : 'Continue'}
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light text-center"
                  onClick={handleSkipCompleteSignup}
                >
                  Skip Referral & Continue
                </Button>
              </>
            )}

            {step === 'createMpin' && (
              <>
                <Button
                  onClick={handleCreateMpin}
                  className="w-100 login-btn mb-2"
                  disabled={!mpin || mpin.length !== 4}
                >
                  Complete Registration
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light text-center"
                  onClick={() => {
                    setStep('completeSignup');
                    setMessage('');
                    setError('');
                    setMpin('');
                  }}
                >
                  Back
                </Button>
              </>
            )}

            {step === 'forgot' && (
              <>
                <Button
                  onClick={handleForgotVerify}
                  className="w-100 login-btn mb-2"
                  disabled={!otp || !mpin || mpin.length !== 4}
                >
                  Reset MPIN & Login
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light text-center"
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